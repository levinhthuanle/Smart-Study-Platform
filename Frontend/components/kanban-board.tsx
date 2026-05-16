"use client";

import React, { useEffect, useMemo, useState } from "react";
import { backendApi, type TaskResponse, type UserResponse } from "@/lib/api";
import { Loader2 } from "lucide-react";

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

export default function KanbanBoard({ workspaceId, token, usersById = {} }: TaskWithUsersProps) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const columns = useMemo(() => ["Todo", "In Progress", "Done"], []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    backendApi
      .getWorkspaceTasks(token, workspaceId)
      .then((t) => {
        if (!cancelled) setTasks(t);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, workspaceId]);

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
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Kanban Board</h2>
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
                              Assigned to {usersById[task.assigned_to]?.username ?? `#${task.assigned_to}`}
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
