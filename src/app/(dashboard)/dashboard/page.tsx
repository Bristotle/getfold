import { redirect } from "next/navigation";
import { Card, CardLabel, CardStat } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { getInsights, MONTH_NAMES } from "./insights-data";
import { BarSeries, GroupedBars, SplitBar, SERIES } from "@/components/charts";
import { Cake } from "lucide-react";

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
  const insights = await getInsights(organization.id);

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

      {/* ---------- birthdays ---------- */}
      {/*
        Put high on the page on purpose. This is the one thing here that
        changes what happens in the service itself: a name read out and a
        blessing given. It uses the date of birth the register already
        holds, and it never shows the year, because the year is the part
        nobody wants announced.
      */}
      {insights.birthdays.length > 0 && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning-text"
              >
                <Cake size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Birthdays to announce
                </h2>
                <p className="text-xs text-muted-foreground">
                  The next fortnight, so you can bless them on Sunday.
                </p>
              </div>
            </div>
            <span className="font-numeric text-xs text-muted-foreground">
              {insights.birthdaysThisMonth} this month
            </span>
          </div>

          <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
            {insights.birthdays.slice(0, 24).map((b) => (
              <li
                key={b.id}
                className="flex items-baseline gap-2 rounded-full border border-border bg-surface-soft px-3 py-1.5"
              >
                <span className="text-sm font-medium text-foreground">
                  {b.name}
                </span>
                <span className="font-numeric text-xs text-muted-foreground">
                  {b.day} {MONTH_NAMES[b.month]}
                </span>
              </li>
            ))}
          </ul>
          {insights.birthdays.length > 24 && (
            <p className="mt-3 font-numeric text-xs text-muted-foreground">
              and {insights.birthdays.length - 24} more
            </p>
          )}
        </Card>
      )}

      {/* ---------- charts ---------- */}
      {!isEmpty && (
        <div className="grid gap-4 lg:grid-cols-2">
          {insights.attendance.length > 0 && (
            <Card>
              <CardLabel>Attendance, last services recorded</CardLabel>
              <div className="mt-4">
                <BarSeries
                  label="Total attendance per service"
                  data={insights.attendance}
                  color={SERIES.attendance}
                />
              </div>
            </Card>
          )}

          {insights.attendanceBySex.length > 0 && (
            <Card>
              <CardLabel>Attendance by sex</CardLabel>
              <div className="mt-4">
                <GroupedBars
                  label="Attendance by sex per service"
                  data={insights.attendanceBySex}
                  keys={[
                    { name: "Female", color: SERIES.female },
                    { name: "Male", color: SERIES.male },
                  ]}
                />
              </div>
            </Card>
          )}

          {showFinance && (
            <Card>
              <CardLabel>Giving by month</CardLabel>
              <div className="mt-4">
                <GroupedBars
                  label="Giving by month and type"
                  data={insights.giving}
                  format={(n) => cedis.format(n)}
                  keys={[
                    { name: "Tithe", color: SERIES.tithe },
                    { name: "Offering", color: SERIES.offering },
                    { name: "Other", color: SERIES.other },
                  ]}
                />
              </div>
            </Card>
          )}

          {insights.memberTypes.length > 0 && (
            <Card>
              <CardLabel>Membership by type</CardLabel>
              <div className="mt-4">
                <SplitBar label="Membership by type" parts={insights.memberTypes} />
              </div>
            </Card>
          )}

          {insights.sexSplit.female + insights.sexSplit.male > 0 && (
            <Card>
              <CardLabel>Membership by age</CardLabel>
              <div className="mt-4">
                <GroupedBars
                  label="Membership by age band and sex"
                  data={insights.ageBands}
                  keys={[
                    { name: "Female", color: SERIES.female },
                    { name: "Male", color: SERIES.male },
                  ]}
                />
              </div>
            </Card>
          )}

          <Card>
            <CardLabel>Members by sex</CardLabel>
            <div className="mt-4">
              <SplitBar
                label="Members by sex"
                parts={[
                  { name: "Female", value: insights.sexSplit.female, color: SERIES.female },
                  { name: "Male", value: insights.sexSplit.male, color: SERIES.male },
                  { name: "Not recorded", value: insights.sexSplit.unknown, color: "#c9c3d4" },
                ]}
              />
            </div>
          </Card>
        </div>
      )}

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
            <li>
              Record dates of birth as you go, and this page will tell you
              who to bless each Sunday.
            </li>
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
