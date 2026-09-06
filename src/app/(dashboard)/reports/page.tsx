import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { PeriodPicker } from "./period-picker";

type Return = {
  members_total: number;
  members_male: number;
  members_female: number;
  members_joined: number;
  members_transferred: number;
  services_held: number;
  attendance_total: number;
  attendance_avg: string | number;
  baptisms: number;
  confirmations: number;
  weddings: number;
  deaths: number;
  visitors: number;
  converts: number;
  tithe: string | number;
  offering: string | number;
  other_income: string | number;
  total_income: string | number;
};

const cedis = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
});

const longDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Defaults to the current calendar year, the usual reporting period. */
function defaultRange() {
  const now = new Date();
  return {
    from: `${now.getFullYear()}-01-01`,
    to: now.toISOString().slice(0, 10),
  };
}

const isDate = (v: string | undefined): v is string =>
  !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string | number;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0 ${
        strong ? "font-bold text-foreground" : ""
      }`}
    >
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span className="font-numeric tabular-nums">{value}</span>
    </div>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const fallback = defaultRange();
  const from = isDate(sp.from) ? sp.from : fallback.from;
  const to = isDate(sp.to) ? sp.to : fallback.to;

  const showFinance = can(membership.role, "finance.view");

  const supabase = await createClient();

  const [{ data, error }, { data: groupRows }] = await Promise.all([
    supabase.rpc("statistical_return", {
      org_id: membership.organization.id,
      p_start: from,
      p_end: to,
    }),
    supabase
      .from("members")
      .select("member_groups!members_member_group_id_fkey ( name )")
      .eq("status", "active"),
  ]);

  const r = (data?.[0] ?? null) as Return | null;

  // Membership by class/group, the breakdown a circuit usually asks for
  // alongside the totals.
  const byGroup = new Map<string, number>();
  for (const row of (groupRows ?? []) as {
    member_groups: { name: string } | { name: string }[] | null;
  }[]) {
    const g = Array.isArray(row.member_groups)
      ? row.member_groups[0]
      : row.member_groups;
    const name = g?.name ?? "No group";
    byGroup.set(name, (byGroup.get(name) ?? 0) + 1);
  }
  const groups = [...byGroup.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-6">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-foreground">
          Statistical return
        </h1>
        <p className="text-sm text-muted-foreground">
          Figures for a chosen period, ready to submit upward. Everything is
          drawn from what your team has recorded, nothing is entered twice.
        </p>
      </div>

      <div className="print:hidden">
        <PeriodPicker from={from} to={to} />
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text print:hidden">
          Could not build the return: {error.message}
        </p>
      )}

      {/* The printable sheet. `print:` utilities strip the app chrome so a
          plain Ctrl/Cmd-P produces something a circuit office would accept. */}
      <div className="rounded-xl border border-border bg-surface p-6 print:border-0 print:p-0">
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-bold text-foreground">
            {membership.organization.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {membership.organization.denomination
              ? `${membership.organization.denomination} · `
              : ""}
            Statistical return for {longDate.format(new Date(from))} to{" "}
            {longDate.format(new Date(to))}
          </p>
        </div>

        {!r ? (
          <p className="pt-4 text-sm text-muted-foreground">
            No figures available for this period.
          </p>
        ) : (
          <div className="grid gap-8 pt-6 sm:grid-cols-2">
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                Membership
              </h3>
              <Row label="Total active members" value={r.members_total} strong />
              <Row label="Male" value={r.members_male} />
              <Row label="Female" value={r.members_female} />
              <Row
                label="Not stated"
                value={r.members_total - r.members_male - r.members_female}
              />
              <Row label="Joined in period" value={r.members_joined} />
              <Row label="Transferred out" value={r.members_transferred} />
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                Attendance
              </h3>
              <Row label="Services recorded" value={r.services_held} />
              <Row label="Total attendance" value={r.attendance_total} />
              <Row
                label="Average per service"
                value={Number(r.attendance_avg)}
                strong
              />
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                Vital records
              </h3>
              <Row label="Baptisms" value={r.baptisms} />
              <Row label="Confirmations" value={r.confirmations} />
              <Row label="Weddings" value={r.weddings} />
              <Row label="Deaths" value={r.deaths} />
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                Outreach
              </h3>
              <Row label="Visitors received" value={r.visitors} />
              <Row label="Became members" value={r.converts} />
            </section>

            {showFinance && (
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  Income
                </h3>
                <Row label="Tithes" value={cedis.format(Number(r.tithe))} />
                <Row
                  label="Offerings"
                  value={cedis.format(Number(r.offering))}
                />
                <Row
                  label="Other (pledges, donations)"
                  value={cedis.format(Number(r.other_income))}
                />
                <Row
                  label="Total income"
                  value={cedis.format(Number(r.total_income))}
                  strong
                />
              </section>
            )}

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                Membership by class / group
              </h3>
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No members recorded.
                </p>
              ) : (
                groups.map(([name, count]) => (
                  <Row key={name} label={name} value={count} />
                ))
              )}
            </section>
          </div>
        )}

        <p className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          Prepared from records held in Fold on{" "}
          {longDate.format(new Date())}.
          {!showFinance && " Income figures omitted, not visible to your role."}
        </p>
      </div>
    </div>
  );
}
