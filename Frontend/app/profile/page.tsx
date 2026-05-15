import { SiteHeader } from "@/components/site-header";
import { ProfileShell } from "@/components/profile-shell";

export default function ProfilePage() {
  return (
    <main>
      <SiteHeader />
      <section className="section-shell py-10 md:py-14">
        <div className="mb-8 animate-rise">
          <p className="muted-label">Profile</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Account overview</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Review your account data and the workspaces you are part of from a clean, focused profile view.
          </p>
        </div>

        <ProfileShell />
      </section>
    </main>
  );
}
