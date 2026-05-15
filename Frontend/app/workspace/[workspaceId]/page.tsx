"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { backendApi, type WorkspaceResponse, type TaskResponse, type WorkspaceMemberResponse, type ChannelResponse } from "@/lib/api";
import { Loader2, Users, CalendarDays, MessageCircle } from "lucide-react";

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = Number(params.workspaceId);
  const [token, setToken] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [members, setMembers] = useState<WorkspaceMemberResponse[]>([]);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [channels, setChannels] = useState<ChannelResponse[]>([]);
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
        const [w, m, t, c] = await Promise.all([
          backendApi.getWorkspace(tokenChecked, workspaceId),
          backendApi.getWorkspaceMembers(tokenChecked, workspaceId),
          backendApi.getWorkspaceTasks(tokenChecked, workspaceId),
          backendApi.getWorkspaceChannels(tokenChecked, workspaceId),
        ]);

        if (cancelled) return;
        setWorkspace(w);
        setMembers(m);
        setTasks(t);
        setChannels(c);
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

  const upcoming = useMemo(() => {
    const now = Date.now();
    const soon = now + 1000 * 60 * 60 * 24 * 7; // 7 days
    return tasks.filter((t) => {
      const due = new Date(t.due_date).getTime();
      return due >= now && due <= soon;
    });
  }, [tasks]);

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
            <h1 className="text-2xl font-semibold">{workspace?.name}</h1>
            <p className="text-sm text-slate-500 mt-1">Workspace #{workspace?.workspace_id}</p>
          </div>
          <div className="flex gap-3">
            <button className="secondary-button" onClick={() => router.push(`/workspace/${workspaceId}/kanban`)}>
              <CalendarDays className="mr-2" /> Kanban
            </button>
            <button className="secondary-button" onClick={() => router.push(`/workspace/${workspaceId}/chat`)}>
              <MessageCircle className="mr-2" /> Chat
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="panel">
            <h3 className="font-semibold">Members</h3>
            <div className="mt-3 space-y-2">
              {members.map((m) => (
                <div key={m.workspace_member_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">{String(m.user_id).slice(-2)}</div>
                    <div>
                      <div className="font-medium">User #{m.user_id}</div>
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