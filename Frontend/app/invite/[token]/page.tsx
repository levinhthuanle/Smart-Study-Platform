"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

import { backendApi, type WorkspaceInvitePreviewResponse } from "@/lib/api";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params.token || "");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [invite, setInvite] = useState<WorkspaceInvitePreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinedWorkspaceId, setJoinedWorkspaceId] = useState<number | null>(null);

  useEffect(() => {
    setAccessToken(window.localStorage.getItem("smart-study-access-token"));
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    async function loadInvite() {
      setLoading(true);
      setError(null);

      try {
        const data = await backendApi.getWorkspaceInvite(token);

        if (!cancelled) {
          setInvite(data);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Failed to load invite");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInvite();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const authenticatedToken = accessToken;

    if (!authenticatedToken || !invite || invite.is_used || invite.is_expired || joinedWorkspaceId) {
      return;
    }

    let cancelled = false;

    async function acceptInvite() {
      setJoining(true);
        
      const authenticatedToken = accessToken;
      if (!authenticatedToken) {
        if (!cancelled) {
          setError("You must be signed in to accept the invite");
          setJoining(false);
        }
        return;
      }
      try {
        const member = await backendApi.acceptWorkspaceInvite(authenticatedToken, token);

        if (!cancelled) {
          setJoinedWorkspaceId(member.workspace_id);
          router.push(`/workspace/${member.workspace_id}`);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Failed to join workspace");
        }
      } finally {
        if (!cancelled) {
          setJoining(false);
        }
      }
    }

    void acceptInvite();

    return () => {
      cancelled = true;
    };
  }, [accessToken, invite, joinedWorkspaceId, router, token]);

  if (loading) {
    return (
      <main className="section-shell py-16">
        <div className="panel flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-accent" />
          Checking invite...
        </div>
      </main>
    );
  }

  return (
    <main className="section-shell py-16">
      <div className="panel mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-5 text-accent" />
          <div>
            <p className="muted-label">Workspace invite</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
              {invite?.workspace_name || "Invite link"}
            </h1>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        {invite ? (
          <div className="rounded-[24px] border border-black/5 bg-slate-50 p-5 text-sm text-slate-600">
            <p>Invite token: {invite.token}</p>
            <p className="mt-2">Status: {invite.is_used ? "already used" : invite.is_expired ? "expired" : "active"}</p>
          </div>
        ) : null}

        {!accessToken ? (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-slate-600">
              Sign in to accept this invite and join the workspace.
            </p>
            <div className="flex gap-3">
              <Link href="/login" className="primary-button">
                Sign in
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link href="/register" className="secondary-button">
                Create account
              </Link>
            </div>
          </div>
        ) : invite?.is_expired ? (
          <p className="text-sm text-slate-600">This invite has expired.</p>
        ) : invite?.is_used ? (
          <p className="text-sm text-slate-600">This invite has already been used.</p>
        ) : joining ? (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Loader2 className="size-4 animate-spin text-accent" />
            Joining workspace...
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <CheckCircle2 className="size-4 text-emerald-600" />
            You are signed in. The invite is being accepted.
          </div>
        )}
      </div>
    </main>
  );
}