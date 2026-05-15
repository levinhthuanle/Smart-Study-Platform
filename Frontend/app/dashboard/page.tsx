import { DashboardShell } from "@/components/dashboard-shell";
import { SiteHeader } from "@/components/site-header";

export default function DashboardPage() {
  return (
    <main>
      <SiteHeader />
      <section className="section-shell py-10 md:py-14">
        <div className="mb-8 animate-rise">
          <p className="muted-label">Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Workspace overview</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            This shell is ready for real backend data. For now it provides a refined base for workspace
            navigation, task management, and realtime chat.
          </p>
        </div>

        <DashboardShell />
      </section>
    </main>
  );
}
