import Link from "next/link";
import { ChevronRight, Layers3, Sparkles, Users } from "lucide-react";

import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";

const registerPoints = [
  {
    icon: Layers3,
    title: "Workspace ready",
    text: "Create a workspace shell that is ready for tasks, members, and study discussions.",
  },
  {
    icon: Users,
    title: "Collaboration built in",
    text: "Roles and members already fit the backend model and workspace management flow.",
  },
  {
    icon: Sparkles,
    title: "Polished defaults",
    text: "The interface begins with a calm palette and spacing system that can scale later.",
  },
] as const;

export default function RegisterPage() {
  return (
    <main>
      <SiteHeader />

      <section className="section-shell py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-start">
          <div className="panel space-y-8 animate-rise">
            <div>
              <p className="muted-label">Register</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Start a focused workspace.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                Create an account and begin with a clean foundation for study groups, team projects, or
                research collaboration.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              {registerPoints.map((point) => {
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

            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-accent">
              Already have an account? Sign in
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <AuthForm mode="register" />
        </div>
      </section>
    </main>
  );
}
