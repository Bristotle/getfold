import Link from "next/link";
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
  const { userId, email, membership } = await getMembership();

  if (!email) redirect("/login");

  // A signed-in user with no church hasn't finished signing up. Send them
  // to onboarding rather than rendering a dashboard with nothing behind it.
  if (!membership) redirect("/onboarding");

  const { organization, role } = membership;

  const supabase = await createClient();

  /*
    trial_status is SECURITY INVOKER, so RLS scopes it to this church. The
    profile read beside it is the person's own name for the header, which
    falls back to the address they sign in with until they set one.
  */
  const [{ data: trial }, { data: me }, { data: platformViewer }] = await Promise.all([
    supabase.rpc("trial_status", { org_id: organization.id }),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId ?? "")
      .maybeSingle<{ full_name: string | null }>(),
    // Fold staff only. The answer comes from app_admins in the database,
    // so the link appears for exactly the people the console admits.
    supabase.rpc("is_platform_viewer"),
  ]);
  const fullName = me?.full_name ?? null;
  const t = (trial?.[0] ?? null) as
    | { status: string; days_left: number; has_paid: boolean }
    | null;

  return (
    <div className="min-h-screen">
      {t && <TrialBanner status={t.status} daysLeft={t.days_left} hasPaid={t.has_paid} />}

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
            {platformViewer === true && (
              <Link
                href="/admin/churches"
                className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
              >
                Fold admin
              </Link>
            )}
            {/* The signed in person, and the way to their own details.
                It used to be the email address as plain text, which told
                somebody their address and offered them nothing. */}
            <Link
              href="/profile"
              className="hidden max-w-[16rem] truncate rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:inline"
            >
              {fullName ?? email}
            </Link>
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
