"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, LogOut, Sparkles, UserCircle2 } from "lucide-react";

type HeaderAuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

export function SiteHeader() {
  const router = useRouter();
  const [authState, setAuthState] = useState<HeaderAuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const accessToken = window.localStorage.getItem("smart-study-access-token");

    setAuthState({
      isAuthenticated: Boolean(accessToken),
      isLoading: false,
    });
  }, []);

  function handleLogout() {
    window.localStorage.removeItem("smart-study-access-token");
    window.localStorage.removeItem("smart-study-refresh-token");
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
    });
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/60 backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-ink text-sm font-semibold text-white shadow-soft">
            SS
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              Smart Study Workspace
              <Sparkles className="size-4 text-teal-700" />
            </div>
            <p className="text-xs text-slate-500">Minimal workspace for focused teams</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <Link href="/dashboard" className="transition hover:text-ink">
            Dashboard
          </Link>
          {authState.isAuthenticated ? (
            <Link href="/profile" className="transition hover:text-ink">
              Profile
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {authState.isLoading ? (
            <div className="hidden h-11 w-28 animate-pulse rounded-2xl bg-slate-100 md:block" />
          ) : authState.isAuthenticated ? (
            <>
              <Link href="/profile" className="secondary-button hidden md:inline-flex">
                <UserCircle2 className="mr-2 size-4" />
                Profile
              </Link>
              <button type="button" className="secondary-button hidden md:inline-flex" onClick={handleLogout}>
                <LogOut className="mr-2 size-4" />
                Logout
              </button>
              <Link href="/profile" className="primary-button md:hidden">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="secondary-button hidden md:inline-flex">
                Sign in
              </Link>
              <Link href="/register" className="primary-button">
                Get started
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
