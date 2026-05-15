import Link from "next/link";
import { ArrowRight, Check, LayoutDashboard, MessageSquareMore, NotebookText, ShieldCheck, Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { workspaceHighlights } from "@/lib/mock-data";

const capabilityCards = [
  {
    icon: LayoutDashboard,
    title: "Workspace-first layout",
    description: "The interface keeps workspaces, tasks, and messages on the same visual plane.",
  },
  {
    icon: MessageSquareMore,
    title: "Realtime collaboration",
    description: "Sockets are ready for live chat updates and future presence indicators.",
  },
  {
    icon: NotebookText,
    title: "Notes-friendly aesthetic",
    description: "Muted surfaces, crisp typography, and calm spacing keep the screen easy to read.",
  },
  {
    icon: ShieldCheck,
    title: "Auth and access",
    description: "Login and register screens are prepared to connect with the backend tokens.",
  },
] as const;

export default function HomePage() {
  return (
    <main>
      <SiteHeader />

      <section className="section-shell pt-10 md:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8 animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-white/70 px-4 py-2 text-xs font-medium text-teal-900 shadow-soft">
              <Sparkles className="size-4" />
              Modern study workspace for focused teams
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-ink md:text-6xl">
                Calm interface for tasks, notes, and realtime discussion.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Smart Study Workspace brings workspace collaboration, task management, and realtime chat
                into a clean dashboard inspired by tools like Notion and Obsidian.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="primary-button">
                Create workspace
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <Link href="/dashboard" className="secondary-button">
                View dashboard
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full border border-black/5 bg-white/70 px-4 py-2 shadow-soft">JWT auth</span>
              <span className="rounded-full border border-black/5 bg-white/70 px-4 py-2 shadow-soft">Workspace tasks</span>
              <span className="rounded-full border border-black/5 bg-white/70 px-4 py-2 shadow-soft">Realtime messages</span>
            </div>
          </div>

          <div className="panel animate-rise lg:ml-auto lg:max-w-xl">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div>
                <p className="muted-label">Workspace preview</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Product Design Sprint</h2>
              </div>
              <div className="rounded-2xl bg-accentSoft px-3 py-2 text-xs font-medium text-accent">
                12 active
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Tasks", "18"],
                ["Messages", "42"],
                ["Members", "08"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 rounded-[24px] border border-black/5 bg-white p-5">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Today</span>
                <span className="font-mono text-xs">09:30</span>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-ink">Refine task board layout</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Move work toward done without visual clutter.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-ink">Realtime chat is ready</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Messages can be broadcast to every open client.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {workspaceHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-ink">
                    <Check className="size-4 text-accent" />
                    {item.title}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pt-8 md:pt-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {capabilityCards.map((card) => {
            const Icon = card.icon;

            return (
              <article key={card.title} className="panel-subtle transition hover:-translate-y-1 hover:shadow-soft">
                <Icon className="size-5 text-accent" />
                <h3 className="mt-5 text-lg font-semibold text-ink">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell pt-8 md:pt-12">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="panel">
            <p className="muted-label">Design direction</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Minimal, textured, and calm.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
              The visual language leans on warm neutrals, crisp borders, roomy layout, and quiet motion so
              the product feels more like a notes tool than a noisy admin panel.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["01", "Workspace shell"],
              ["02", "Auth flow"],
              ["03", "Realtime layer"],
            ].map(([step, label]) => (
              <div key={label} className="panel-subtle">
                <p className="font-mono text-xs text-slate-500">{step}</p>
                <p className="mt-4 text-lg font-semibold text-ink">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="section-shell pb-12 pt-8">
        <div className="flex flex-col gap-3 border-t border-black/5 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Smart Study Workspace</p>
          <p>Built for study groups, project teams, and focused collaboration.</p>
        </div>
      </footer>
    </main>
  );
}
