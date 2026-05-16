"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { backendApi, type WorkspaceResponse, type TaskResponse, type WorkspaceMemberResponse, type ChannelResponse, type UserResponse } from "@/lib/api";
import { Loader2, CalendarDays, MessageCircle, Link2, Copy, ShieldCheck } from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = Number(params.workspaceId);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [members, setMembers] = useState<WorkspaceMemberResponse[]>([]);
  const [usersById, setUsersById] = useState<Record<number, UserResponse>>({});
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [channels, setChannels] = useState<ChannelResponse[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(window.localStorage.getItem("smart-study-access-token"));
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);

    const tokenChecked = token;
    async function load() {
      try {
        const [me, w, m, t, c] = await Promise.all([
          backendApi.getMe(tokenChecked),
          backendApi.getWorkspace(tokenChecked, workspaceId),
          backendApi.getWorkspaceMembers(tokenChecked, workspaceId),
          backendApi.getWorkspaceTasks(tokenChecked, workspaceId),
          backendApi.getWorkspaceChannels(tokenChecked, workspaceId),
        ]);

        if (cancelled) return;
        setCurrentUser(me);
        setWorkspace(w);
        setMembers(m);
        setTasks(t);
        setChannels(c);

        const users = await Promise.allSettled(m.map((member) => backendApi.getUser(tokenChecked, member.user_id)));
        const userMap: Record<number, UserResponse> = {};

        users.forEach((result) => {
          if (result.status === "fulfilled") {
            userMap[result.value.user_id] = result.value;
          }
        });

        setUsersById(userMap);
      } catch (err) {
        // ignore for now
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, workspaceId]);

  const isOwner = useMemo(() => {
    return Boolean(currentUser && workspace && currentUser.user_id === workspace.owner_id);
  }, [currentUser, workspace]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    const soon = now + 1000 * 60 * 60 * 24 * 7; // 7 days
    return tasks.filter((t) => {
      const due = new Date(t.due_date).getTime();
      return due >= now && due <= soon;
    });
  }, [tasks]);

  async function handleCreateInvite() {
    if (!token || !workspace || !isOwner) {
      return;
    }

    setIsCreatingInvite(true);
    setInviteStatus(null);

    try {
      const invite = await backendApi.createWorkspaceInvite(token, workspace.workspace_id);
      const fullUrl = new URL(invite.invite_path, window.location.origin).toString();

      setInviteLink(fullUrl);
      await navigator.clipboard.writeText(fullUrl);
      setInviteStatus("Invite link copied to clipboard");
    } catch (err) {
      setInviteStatus(err instanceof Error ? err.message : "Failed to create invite link");
    } finally {
      setIsCreatingInvite(false);
    }
  }

  if (loading) {
    return (
      <div className="panel">
        <Loader2 className="animate-spin" /> Loading workspace...
      </div>
    );
  }

  return (
    <div className="section-shell py-8">
      <div className="max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            {workspace?.workspace_avt_url ? (
              <img
                src={workspace.workspace_avt_url}
                alt={workspace.name}
                className="mb-4 size-16 rounded-3xl object-cover shadow-soft"
              />
            ) : null}
            <h1 className="text-2xl font-semibold">{workspace?.name}</h1>
            <p className="text-sm text-slate-500 mt-1">Workspace #{workspace?.workspace_id}</p>
          </div>
          <div className="flex gap-3">
            {isOwner ? (
              <button className="secondary-button" onClick={handleCreateInvite} disabled={isCreatingInvite}>
                <Link2 className="mr-2" />
                {isCreatingInvite ? "Creating invite..." : "Invite"}
              </button>
            ) : null}
            <button className="secondary-button" onClick={() => router.push(`/workspace/${workspaceId}/kanban`)}>
              <CalendarDays className="mr-2" /> Kanban
            </button>
            <button className="secondary-button" onClick={() => router.push(`/workspace/${workspaceId}/chat`)}>
              <MessageCircle className="mr-2" /> Chat
            </button>
          </div>
        </div>

        {isOwner ? (
          <div className="panel flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <ShieldCheck className="size-4 text-accent" />
                Owner invite access
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Generate a one-time invite link for this workspace and share it with someone you want to add.
              </p>
              {inviteLink ? (
                <p className="mt-2 break-all text-sm text-slate-600">{inviteLink}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <button className="primary-button" onClick={handleCreateInvite} disabled={isCreatingInvite}>
                <Copy className="mr-2" />
                Copy invite link
              </button>
              {inviteStatus ? <p className="text-xs text-slate-500">{inviteStatus}</p> : null}
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="panel">
            <h3 className="font-semibold">Members</h3>
            <div className="mt-3 space-y-2">
              {members.map((m) => (
                <div key={m.workspace_member_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden text-sm font-medium">
                      {usersById[m.user_id]?.avt_url ? (
                        <img
                          src={usersById[m.user_id].avt_url || undefined}
                          alt={usersById[m.user_id]?.username || `User ${m.user_id}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{(usersById[m.user_id]?.username || String(m.user_id)).slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{usersById[m.user_id]?.username || `User #${m.user_id}`}</div>
                      <div className="text-xs text-slate-500">Role: {m.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <h3 className="font-semibold">Upcoming tasks</h3>
            <div className="mt-3 space-y-2">
              {upcoming.length ? (
                upcoming.map((t) => (
                  <div key={t.task_id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-slate-500">Due {new Date(t.due_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">No upcoming tasks in the next 7 days.</div>
              )}
            </div>
          </div>

          <div className="panel">
            <h3 className="font-semibold">Channels</h3>
            <div className="mt-3 space-y-2">
              {channels.map((c) => (
                <div key={c.channel_id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full" style={{ background: c.color }} />
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}