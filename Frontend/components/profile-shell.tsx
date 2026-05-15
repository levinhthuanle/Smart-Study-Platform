"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Sparkles, Users } from "lucide-react";

import { backendApi, type UserResponse, type WorkspaceResponse } from "@/lib/api";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ProfileShell() {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<UserResponse | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("smart-study-access-token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const [meData, workspaceList] = await Promise.all([
          backendApi.getMe(token),
          backendApi.getWorkspaces(token),
        ]);

        if (cancelled) {
          return;
        }

        setMe(meData);
        setWorkspaces(workspaceList);
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Failed to load profile data");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <div className="panel text-center">
        <p className="muted-label">Authentication required</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Sign in to view your profile</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The profile page uses the access token saved after login to load your user details and workspaces.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="panel flex items-center gap-3 text-slate-600">
        <Loader2 className="size-5 animate-spin text-accent" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="panel space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="size-5 text-accent" />
          <div>
            <p className="muted-label">Profile</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Your account</h1>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="space-y-4 rounded-[24px] border border-black/5 bg-slate-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-3xl bg-ink text-lg font-semibold text-white shadow-soft">
              {me?.email?.slice(0, 1).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm text-slate-500">Signed in as</p>
              <h2 className="text-xl font-semibold text-ink">{me?.email || "Unknown user"}</h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-slate-400" />
              <span>{me?.email || "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="size-4 text-slate-400" />
              <span>{workspaces.length} accessible workspaces</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-400">ID</span>
              <span>{me?.user_id ?? "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-400">Joined</span>
              <span>{me?.created_at ? formatDate(me.created_at) : "-"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel space-y-5">
        <div>
          <p className="muted-label">Workspaces</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Spaces you participate in</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This list comes from the real backend workspace endpoint, so it includes both the workspaces you
            own and the ones you have been invited to.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {workspaces.map((workspace) => {
            const role = workspace.owner_id === me?.user_id ? "Owner" : "Member";

            return (
              <article
                key={workspace.workspace_id}
                className="rounded-[24px] border border-black/5 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{workspace.name}</h3>
                    <p className="mt-2 text-sm text-slate-500">Workspace #{workspace.workspace_id}</p>
                  </div>
                  <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-medium text-accent">
                    {role}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                  <span>Created {formatDate(workspace.created_at)}</span>
                  <span className="font-mono text-xs">#{workspace.workspace_id}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
