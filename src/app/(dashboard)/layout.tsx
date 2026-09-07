import { redirect } from "next/navigation";
import { getMembership } from "@/lib/org";
import { signOut } from "@/app/(auth)/login/actions";
import { Nav } from "@/components/nav";
import { ROLE_LABELS } from "@/lib/permissions";
import { TrialBanner } from "@/components/trial-banner";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, membership } = await getMembership();

  if (!email) redirect("/login");

  // A signed-in user with no church hasn't finished signing up. Send them
  // to onboarding rather than rendering a dashboard with nothing behind it.
  if (!membership) redirect("/onboarding");

  const { organization, role } = membership;

  // trial_status is SECURITY INVOKER, so RLS scopes it to this church.
  const supabase = await createClient();
  const { data: trial } = await supabase.rpc("trial_status", {
    org_id: organization.id,
  });
  const t = (trial?.[0] ?? null) as
    | { status: string; days_left: number }
    | null;

  return (
    <div className="min-h-screen">
      {t && <TrialBanner status={t.status} daysLeft={t.days_left} />}

      <header className="border-b border-border bg-surface">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">
              {organization.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABELS[role] ?? role}
              {organization.denomination
                ? ` · ${organization.denomination}`
                : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {email}
            </span>
            <form action={signOut}>
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <Nav role={role} />
      </header>
      {/* pb-24 on phones keeps the fixed bottom bar from covering the last
          row of any list. */}
      <main id="main" className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pb-8 sm:pt-8">
        {children}
      </main>
    </div>
  );
}
