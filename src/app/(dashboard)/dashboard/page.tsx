import { redirect } from "next/navigation";
import { Card, CardLabel, CardStat } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";

type Stats = {
  member_count: number;
  week_attendance: number;
  month_tithe: string | number;
  pending_transfers: number;
};

const cedis = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export default async function DashboardPage() {
  const { membership } = await getMembership();

  // The layout already guarantees this, but the page renders on its own
  // request and TypeScript can't see that invariant.
  if (!membership) redirect("/onboarding");

  const { organization } = membership;

  // dashboard_stats is SECURITY INVOKER, so the tithe figure comes back as 0
  // for roles without finance read access. Showing a confident "GHS 0" would
  // be a lie, hide the tile instead.
  const showFinance = can(membership.role, "finance.view");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("dashboard_stats", {
    org_id: organization.id,
  });

  const stats = (data?.[0] ?? null) as Stats | null;

  // amount is DECIMAL(12,2); PostgREST serialises it as a string to avoid
  // float rounding, so parse rather than assuming a number.
  const tithe = stats ? Number(stats.month_tithe) : 0;
  const isEmpty =
    !stats ||
    (stats.member_count === 0 &&
      stats.week_attendance === 0 &&
      (!showFinance || tithe === 0) &&
      stats.pending_transfers === 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {organization.name}, live figures, updated as your team records
          them.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
          Could not load statistics: {error.message}
        </p>
      )}

      <div className={`grid grid-cols-2 gap-4 ${showFinance ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
        <Card>
          <CardLabel>Active members</CardLabel>
          <CardStat>{stats?.member_count ?? 0}</CardStat>
        </Card>
        <Card>
          <CardLabel>This week&rsquo;s attendance</CardLabel>
          <CardStat>{stats?.week_attendance ?? 0}</CardStat>
        </Card>
        {showFinance && (
          <Card>
            <CardLabel>This month&rsquo;s tithe</CardLabel>
            <CardStat>{cedis.format(tithe)}</CardStat>
          </Card>
        )}
        <Card>
          <CardLabel>Pending transfers</CardLabel>
          <CardStat>{stats?.pending_transfers ?? 0}</CardStat>
        </Card>
      </div>

      {isEmpty && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">
            Your church is set up. Here&rsquo;s what comes next.
          </h2>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-muted-foreground">
            <li>
              Add your members, the register everything else is built on.
            </li>
            <li>
              Record a service&rsquo;s attendance to start the weekly count.
            </li>
            <li>Log tithes and offerings against members and funds.</li>
            <li>Invite your administrators, elders and class leaders.</li>
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Every figure above is scoped to {organization.name} by
            row-level security, no other church can see your data, and you
            cannot see theirs.
          </p>
        </Card>
      )}
    </div>
  );
}
