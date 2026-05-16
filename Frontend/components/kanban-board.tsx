"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  backendApi,
  type TaskResponse,
  type UserResponse,
  type WorkspaceMemberResponse,
} from "@/lib/api";
import { Loader2, Plus } from "lucide-react";

type Props = {
  workspaceId: number;
  token: string | null;
};

type TaskWithUsersProps = Props & {
  usersById?: Record<number, UserResponse>;
};

function statusKey(status: string) {
  const s = status?.toLowerCase();
  if (s.includes("done") || s.includes("complete")) return "Done";
  if (s.includes("progress") || s.includes("doing")) return "In Progress";
  return "Todo";
}

export default function KanbanBoard({ workspaceId, token, usersById }: TaskWithUsersProps) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [members, setMembers] = useState<WorkspaceMemberResponse[]>([]);
  const [memberUsersById, setMemberUsersById] = useState<Record<number, UserResponse>>({});
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAssignee, setNewAssignee] = useState<number | null>(null);
  const [newDueDate, setNewDueDate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigneesLoaded, setAssigneesLoaded] = useState(false);
  const columns = useMemo(() => ["Todo", "In Progress", "Done"], []);
  const externalUsersById = useMemo(() => usersById ?? {}, [usersById]);
  const resolvedUsersById = useMemo(
    () => (Object.keys(externalUsersById).length > 0 ? externalUsersById : memberUsersById),
    [externalUsersById, memberUsersById]
  );
  const isLoadingAssignees = !assigneesLoaded && members.length > 0 && Object.keys(resolvedUsersById).length === 0;
  const assigneeOptions = useMemo(() => {
    return members
      .map((m) => {
        const user = resolvedUsersById[m.user_id];

        return {
          userId: m.user_id,
          label: user?.username ?? user?.email ?? "Unknown member",
        };
      })
      .filter((item, index, arr) => arr.findIndex((v) => v.userId === item.userId) === index);
  }, [members, resolvedUsersById]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    backendApi
      .getWorkspaceTasks(token, workspaceId)
      .then((t) => {
        if (!cancelled) setTasks(t);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load tasks");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, workspaceId]);

  useEffect(() => {
    if (!token) return;
    const accessToken = token;

    let cancelled = false;
    setAssigneesLoaded(false);

    async function loadMembersAndUsers() {
      try {
        const workspaceMembers = await backendApi.getWorkspaceMembers(accessToken, workspaceId);
        if (cancelled) return;

        setMembers(workspaceMembers);

        const sourceUsers = Object.keys(externalUsersById).length > 0 ? externalUsersById : {};
        if (Object.keys(sourceUsers).length === 0) {
          const users = await Promise.allSettled(
            workspaceMembers.map((member) => backendApi.getUser(accessToken, member.user_id))
          );

          if (cancelled) return;

          const map: Record<number, UserResponse> = {};
          users.forEach((result) => {
            if (result.status === "fulfilled") {
              map[result.value.user_id] = result.value;
            }
          });
          setMemberUsersById(map);
        }

        setNewAssignee((current) => current ?? workspaceMembers[0]?.user_id ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load members");
        }
      } finally {
        if (!cancelled) {
          setAssigneesLoaded(true);
        }
      }
    }

    void loadMembersAndUsers();

    return () => {
      cancelled = true;
    };
  }, [token, workspaceId, externalUsersById]);

  function onDragStart(e: React.DragEvent, taskId: number) {
    e.dataTransfer.setData("text/plain", String(taskId));
  }

  async function onDrop(e: React.DragEvent, newStatus: string) {
    const idStr = e.dataTransfer.getData("text/plain");
    const taskId = Number(idStr);
    if (!taskId || !token) return;

    try {
      const updated = await backendApi.updateTask(token, workspaceId, taskId, { status: newStatus });
      setTasks((current) => current.map((t) => (t.task_id === taskId ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Kanban Board</h2>
      <div className="flex items-center gap-3">
        <button
          className="secondary-button"
          onClick={() => setShowCreate((s) => !s)}
        >
          <Plus className="mr-2 size-4" /> Add Task
        </button>
        {showCreate ? (
          <div className="ml-3 flex items-center gap-2">
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" className="rounded-2xl border px-3 py-2" />
            <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Description" className="rounded-2xl border px-3 py-2" />
            <select
              value={newAssignee ?? ""}
              onChange={(e) => setNewAssignee(e.target.value ? Number(e.target.value) : null)}
              className="rounded-2xl border px-3 py-2"
              disabled={isLoadingAssignees}
            >
              <option value="" disabled>
                {isLoadingAssignees ? "Loading assignees..." : "Select assignee"}
              </option>
              {assigneeOptions.map((option) => (
                <option key={option.userId} value={option.userId}>{option.label}</option>
              ))}
            </select>
            <input type="date" value={newDueDate ?? ""} onChange={(e) => setNewDueDate(e.target.value)} className="rounded-2xl border px-3 py-2" />
            <button className="primary-button" disabled={isCreating} onClick={async () => {
              if (!token || !newTitle.trim() || !newAssignee) return;
              setIsCreating(true);
              setError(null);
              try {
                const payload = {
                  title: newTitle.trim(),
                  description: newDescription.trim(),
                  status: "Todo",
                  assigned_to: newAssignee,
                  due_date: newDueDate ? new Date(newDueDate).toISOString() : new Date().toISOString(),
                };
                const task = await backendApi.createTask(token, workspaceId, payload);
                setTasks((current) => [task, ...current]);
                setNewTitle("");
                setNewDescription("");
                setNewAssignee(assigneeOptions[0]?.userId ?? null);
                setNewDueDate(null);
                setShowCreate(false);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to create task");
              } finally {
                setIsCreating(false);
              }
            }}>Create</button>
          </div>
        ) : null}
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="animate-spin" /> Loading tasks...
        </div>
      ) : (
        <div className="flex gap-4">
          {columns.map((col) => (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col)}
              className="flex-1 rounded-2xl border border-black/5 bg-slate-50 p-4"
            >
              <h3 className="font-semibold mb-3">{col}</h3>
              <div className="space-y-3 min-h-[200px]">
                {tasks
                  .filter((t) => statusKey(t.status) === col)
                  .map((task) => (
                    <div
                      key={task.task_id}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.task_id)}
                      className="rounded-xl border bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs text-slate-500">{task.description}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              Assigned to {resolvedUsersById[task.assigned_to]?.username ?? resolvedUsersById[task.assigned_to]?.email ?? "Unknown member"}
                            </div>
                        </div>
                        <div className="text-xs text-slate-500">Due {new Date(task.due_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
