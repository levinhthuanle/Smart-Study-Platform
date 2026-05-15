import Link from "next/link";
import { ChevronRight, Clock3, FileText, ShieldCheck } from "lucide-react";

import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

const loginPoints = [
  {
    icon: ShieldCheck,
    title: "Protected access",
    text: "JWT login is wired to the backend and stores your tokens for the dashboard flow.",
  },
  {
    icon: FileText,
    title: "Workspace context",
    text: "Once signed in, the UI is ready to open workspaces, tasks, and message streams.",
  },
  {
    icon: Clock3,
    title: "Fast return",
    text: "The layout keeps the sign-in flow light so users can get back to work quickly.",
  },
] as const;

export default function LoginPage() {
  return (
    <main>
      <SiteHeader />

      <section className="section-shell py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-start">
          <div className="panel space-y-8 animate-rise">
            <div>
              <p className="muted-label">Login</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Back to your workspace.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                Sign in to continue your workspace, review tasks, and jump into realtime messages without
                moving away from the same calm visual system.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              {loginPoints.map((point) => {
                const Icon = point.icon;

                return (
                  <div key={point.title} className="rounded-[24px] border border-black/5 bg-slate-50 p-5">
                    <Icon className="size-5 text-accent" />
                    <h2 className="mt-4 text-lg font-semibold text-ink">{point.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{point.text}</p>
                  </div>
                );
              })}
            </div>

            <Link href="/register" className="inline-flex items-center gap-2 text-sm font-medium text-accent">
              Need an account? Register here
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <AuthForm mode="login" />
        </div>
      </section>
    </main>
  );
}
