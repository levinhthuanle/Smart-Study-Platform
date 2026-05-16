"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Circle,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import {
  backendApi,
  getWsBaseUrl,
  type MessageResponse,
  type TaskResponse,
  type UserResponse,
  type WorkspaceMemberResponse,
  type WorkspaceResponse,
} from "@/lib/api";

type ChatEvent =
  | { event: "connected"; workspace_id: number; user_id: number }
  | { event: "message.created"; workspace_id: number; message: MessageResponse }
  | { event: "message.updated"; workspace_id: number; message: MessageResponse }
  | { event: "message.deleted"; workspace_id: number; message_id: number };

type WorkspaceTaskGroups = Record<string, TaskResponse[]>;

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function groupTasks(tasks: TaskResponse[]): WorkspaceTaskGroups {
  return tasks.reduce<WorkspaceTaskGroups>((groups, task) => {
    const key = task.status?.trim() || "Todo";

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(task);
    return groups;
  }, {});
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("done") || normalized.includes("complete")) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalized.includes("progress") || normalized.includes("doing")) {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-stone-100 text-stone-700";
}

export function DashboardShell() {
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null);
  const [members, setMembers] = useState<WorkspaceMemberResponse[]>([]);
  const [channels, setChannels] = useState<import("@/lib/api").ChannelResponse[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [usersById, setUsersById] = useState<Record<number, import("@/lib/api").UserResponse>>({});
  const [newMessage, setNewMessage] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<number | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [isSubmittingWorkspace, setIsSubmittingWorkspace] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [isSubmittingChannel, setIsSubmittingChannel] = useState(false);

  const selectedWorkspace = useMemo(() => {
    return workspaces.find((workspace: WorkspaceResponse) => workspace.workspace_id === selectedWorkspaceId) || null;
  }, [selectedWorkspaceId, workspaces]);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("smart-study-access-token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const accessToken = token;

    let cancelled = false;

    async function loadWorkspaceData() {
      setIsLoading(true);
      setError(null);

      try {
        const [me, workspaceList] = await Promise.all([
          backendApi.getMe(accessToken),
          backendApi.getWorkspaces(accessToken),
        ]);

        if (cancelled) {
          return;
        }

        setCurrentUser(me);
        setWorkspaces(workspaceList);
        setSelectedWorkspaceId((current: number | null) => current ?? workspaceList[0]?.workspace_id ?? null);
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Failed to load workspace data");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadWorkspaceData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !selectedWorkspaceId) {
      return;
    }

    const accessToken = token;
    const workspaceId = selectedWorkspaceId;

    let cancelled = false;

    async function loadSelectedWorkspace() {
      try {
        const [memberList, taskList, messageList] = await Promise.all([
          backendApi.getWorkspaceMembers(accessToken, workspaceId),
          backendApi.getWorkspaceTasks(accessToken, workspaceId),
          backendApi.getWorkspaceMessages(accessToken, workspaceId),
        ]);

        if (cancelled) {
          return;
        }

        setMembers(memberList);
        setTasks(taskList);
        setMessages(messageList);

        // load channels
        try {
          const channelList = await backendApi.getWorkspaceChannels(accessToken, workspaceId);
          setChannels(channelList);
          setSelectedChannelId((current: number | null) => current ?? channelList[0]?.channel_id ?? null);
        } catch (err) {
          // ignore channel load errors for now
        }

        // fetch user details for members
        try {
          const userRequests = memberList.map((m) => backendApi.getUser(accessToken, m.user_id));
          const users = await Promise.all(userRequests);
          const map: Record<number, import("@/lib/api").UserResponse> = {};
          users.forEach((u) => (map[u.user_id] = u));
          setUsersById(map);
          setNewTaskAssignee((current) => current ?? (map[memberList[0]?.user_id]?.user_id ?? null));
        } catch (err) {
          // ignore
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Failed to load selected workspace");
        }
      }
    }

    void loadSelectedWorkspace();

    return () => {
      cancelled = true;
    };
  }, [selectedWorkspaceId, token]);

  useEffect(() => {
    if (!token || !selectedWorkspaceId) {
      return;
    }

    const accessToken = token;

    const socket = new WebSocket(
      `${getWsBaseUrl()}/ws/workspaces/${selectedWorkspaceId}/messages?token=${encodeURIComponent(accessToken)}`
    );

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as ChatEvent;

        if (payload.event === "message.created") {
          setMessages((current: MessageResponse[]) => [
            payload.message,
            ...current.filter((message: MessageResponse) => message.message_id !== payload.message.message_id),
          ]);
        }

        if (payload.event === "message.updated") {
          setMessages((current: MessageResponse[]) =>
            current.map((message: MessageResponse) =>
              message.message_id === payload.message.message_id ? payload.message : message
            )
          );
        }

        if (payload.event === "message.deleted") {
          setMessages((current: MessageResponse[]) =>
            current.filter((message: MessageResponse) => message.message_id !== payload.message_id)
          );
        }
      } catch {
        return;
      }
    };

    return () => {
      socket.close();
    };
  }, [selectedWorkspaceId, token]);

  async function handleCreateWorkspace() {
    if (!token || !newWorkspaceName.trim()) {
      return;
    }

    setIsSubmittingWorkspace(true);
    setError(null);

    try {
      const workspace = await backendApi.createWorkspace(token, newWorkspaceName.trim());
      setWorkspaces((current: WorkspaceResponse[]) => [workspace, ...current]);
      setSelectedWorkspaceId(workspace.workspace_id);
      setNewWorkspaceName("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create workspace");
    } finally {
      setIsSubmittingWorkspace(false);
    }
  }

  async function handleCreateChannel() {
    if (!token || !selectedWorkspaceId || !newChannelName.trim()) return;

    setIsSubmittingChannel(true);
    setError(null);

    try {
      const channel = await backendApi.createChannel(token, selectedWorkspaceId, { name: newChannelName.trim() });
      setChannels((current) => [channel, ...current]);
      setSelectedChannelId(channel.channel_id);
      setNewChannelName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create channel");
    } finally {
      setIsSubmittingChannel(false);
    }
  }

  async function handleSendMessage() {
    if (!token || !selectedWorkspaceId || !newMessage.trim()) {
      return;
    }

    setIsSubmittingMessage(true);
    setError(null);

    try {
      await backendApi.createMessage(token, selectedWorkspaceId, newMessage.trim(), selectedChannelId ?? undefined);
      setNewMessage("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to send message");
    } finally {
      setIsSubmittingMessage(false);
    }
  }

  async function handleCreateTask() {
    if (!token || !selectedWorkspaceId || !newTaskTitle.trim() || !currentUser) {
      return;
    }

    setIsSubmittingTask(true);
    setError(null);

    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2);

      const task = await backendApi.createTask(token, selectedWorkspaceId, {
        title: newTaskTitle.trim(),
        description: "Created from the frontend dashboard shell.",
        status: "Todo",
        assigned_to: newTaskAssignee ?? currentUser.user_id,
        due_date: dueDate.toISOString(),
      });

      setTasks((current: TaskResponse[]) => [task, ...current]);
      setNewTaskTitle("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create task");
    } finally {
      setIsSubmittingTask(false);
    }
  }

  const groupedTasks = useMemo(() => groupTasks(tasks), [tasks]);
  const router = useRouter();

  if (!token) {
    return (
      <div className="panel space-y-4 text-center">
        <p className="muted-label">Authentication required</p>
        <h2 className="text-2xl font-semibold text-ink">Sign in to load your workspace</h2>
        <p className="text-sm leading-7 text-slate-600">
          The dashboard uses the backend JWT access token stored after login. Sign in first, then return
          here to load your workspaces and realtime chat.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="panel flex items-center gap-3 text-slate-600">
        <Loader2 className="size-5 animate-spin text-accent" />
        Loading workspace data...
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="panel h-fit xl:sticky xl:top-28">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="muted-label">Workspace rail</p>
            <h2 className="mt-2 text-lg font-semibold text-ink">Your spaces</h2>
          </div>
          <div className="rounded-2xl bg-accentSoft px-3 py-2 text-xs font-medium text-accent">Live</div>
        </div>

        <div className="space-y-3">
                {workspaces.map((workspace: WorkspaceResponse) => {
            const active = workspace.workspace_id === selectedWorkspaceId;

            return (
              <button
                key={workspace.workspace_id}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active
                    ? "border-teal-900/20 bg-white shadow-soft"
                    : "border-black/5 bg-white/85 hover:-translate-y-0.5 hover:shadow-soft"
                }`}
                onClick={() => router.push(`/workspace/${workspace.workspace_id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-ink">{workspace.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">Workspace #{workspace.workspace_id}</p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${
                      active ? "from-teal-900 to-cyan-700" : "from-slate-900 to-slate-700"
                    }`}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>{formatDate(workspace.created_at)}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    Open
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-3 rounded-[24px] border border-black/5 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Create workspace</p>
          <input
            value={newWorkspaceName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setNewWorkspaceName(event.target.value)}
            placeholder="New workspace name"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal-700"
          />
          <button
            className="primary-button w-full"
            onClick={handleCreateWorkspace}
            disabled={isSubmittingWorkspace}
          >
            {isSubmittingWorkspace ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Plus className="mr-2 size-4" />
            )}
            Create
          </button>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="panel flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="muted-label">Workspace dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
              {selectedWorkspace?.name || "Select a workspace"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              {currentUser ? `Signed in as ${currentUser.username || currentUser.email}` : "No user loaded."}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <Search className="size-4" />
            Search workspace, tasks, or messages
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="panel-subtle">
            <p className="text-sm text-slate-500">Workspaces</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold tracking-tight text-ink">{workspaces.length}</p>
              <p className="text-xs font-medium text-accent">Available</p>
            </div>
          </div>
          <div className="panel-subtle">
            <p className="text-sm text-slate-500">Tasks</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold tracking-tight text-ink">{tasks.length}</p>
              <p className="text-xs font-medium text-accent">Loaded</p>
            </div>
          </div>
          <div className="panel-subtle">
            <p className="text-sm text-slate-500">Messages</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold tracking-tight text-ink">{messages.length}</p>
              <p className="text-xs font-medium text-accent">Realtime</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
          <div className="panel space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="muted-label">Task board</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Move work forward</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  placeholder="New task title"
                  className="max-w-[320px] min-w-0 flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal-700"
                />
                <select
                  value={newTaskAssignee ?? ""}
                  onChange={(e) => setNewTaskAssignee(Number(e.target.value))}
                  className="max-w-[200px] flex-shrink-0 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
                >
                  {members.map((m) => (
                    <option key={m.workspace_member_id} value={m.user_id}>
                      {usersById[m.user_id]?.username ?? usersById[m.user_id]?.email ?? `User #${m.user_id}`}
                    </option>
                  ))}
                </select>
                <button className="secondary-button flex-shrink-0" onClick={handleCreateTask} disabled={isSubmittingTask}>
                  {isSubmittingTask ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 size-4" />
                  )}
                  Add
                </button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {Object.entries(groupedTasks).length > 0 ? (
                Object.entries(groupedTasks).map(([status, statusTasks]) => (
                  <div key={status} className="space-y-3 rounded-[24px] border border-black/5 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-ink">{status}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(status)}`}>
                        {statusTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {statusTasks.map((task) => (
                        <article key={task.task_id} className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-medium text-ink">{task.title}</h4>
                              <p className="mt-2 text-sm leading-6 text-slate-500">
                                {selectedWorkspace?.description ?? ""}
                              </p>
                            </div>
                            <Circle className="size-4 text-slate-300" />
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                            <span>{formatDate(task.due_date)}</span>
                            <span className="rounded-full bg-slate-100 px-2 py-1 font-medium">Task</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-black/10 bg-slate-50/70 p-6 text-sm text-slate-500 xl:col-span-3">
                  No tasks yet. Create one to start moving work.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="muted-label">Realtime chat</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">Messages stream</h2>
                </div>
                <div className="rounded-2xl bg-accentSoft px-3 py-2 text-xs font-medium text-accent">
                  WebSocket live
                </div>
              </div>

              <div className="space-y-3">
                <div className="mb-3 flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="muted-label">Channels</p>
                    <div className="mt-2 flex gap-2 flex-wrap max-w-full">
                      {channels.map((c) => (
                        <button
                          key={c.channel_id}
                          onClick={() => setSelectedChannelId(c.channel_id)}
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            selectedChannelId === c.channel_id ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ background: c.color }} />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="New channel"
                      className="max-w-[180px] min-w-0 rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
                    />
                    <button className="secondary-button flex-shrink-0" onClick={handleCreateChannel} disabled={isSubmittingChannel}>
                      <Plus className="size-4 mr-2" />
                      Create
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-auto">
                  {(
                    selectedChannelId ? messages.filter((m) => m.channel_id === selectedChannelId) : messages
                  ).map((message) => (
                    <div key={message.message_id} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-medium text-slate-700">
                            {(usersById[message.sender_id]?.username || usersById[message.sender_id]?.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium text-ink">{usersById[message.sender_id]?.username ?? usersById[message.sender_id]?.email ?? `User #${message.sender_id}`}</p>
                        </div>
                        <p className="font-mono text-xs text-slate-500">{formatDate(message.created_at)}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-dashed border-black/10 bg-white p-4">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <MessageCircle className="size-4" />
                  Publish a message to the backend and broadcast over websocket.
                </div>
                <textarea
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Write a message..."
                  rows={3}
                  className="w-full rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-700"
                />
                <button className="primary-button w-full" onClick={handleSendMessage} disabled={isSubmittingMessage}>
                  {isSubmittingMessage ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <MessageCircle className="mr-2 size-4" />
                  )}
                  Send message
                </button>
              </div>
            </div>

            <div className="panel space-y-4">
              <div className="flex items-center gap-3">
                <Users className="size-5 text-accent" />
                <h2 className="text-xl font-semibold text-ink">Members</h2>
              </div>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.workspace_member_id}
                    className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4"
                  >
                    <div>
                      <p className="font-medium text-ink">{usersById[member.user_id]?.username ?? usersById[member.user_id]?.email ?? `User #${member.user_id}`}</p>
                      <p className="mt-1 text-sm text-slate-500">Role: {member.role}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Member
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-sm text-slate-500">
                Total members: <span className="font-medium text-ink">{members.length}</span>
              </div>
            </div>

            <div className="panel space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-accent" />
                <h2 className="text-xl font-semibold text-ink">Selected workspace</h2>
              </div>
              <p className="text-sm leading-7 text-slate-600">
                {selectedWorkspace
                  ? `Workspace ${selectedWorkspace.name} is now wired to live REST endpoints and websocket updates.`
                  : "Choose a workspace to load its live data."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
