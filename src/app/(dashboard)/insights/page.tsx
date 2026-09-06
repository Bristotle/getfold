import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardLabel, CardStat } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { queueAbsenceFollowUps } from "../messages/actions";

type Watch = {
  member_id: string;
  full_name: string;
  phone: string | null;
  group_name: string | null;
  last_attended: string | null;
  weeks_since_seen: number | null;
  recent_attendance: number;
  baseline_rate: string | number | null;
  recent_rate: string | number | null;
  last_gave: string | null;
  weeks_since_gave: number | null;
  risk: number;
};

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const pct = (v: string | number | null) =>
  v === null ? "—" : `${Math.round(Number(v) * 100)}%`;

function RiskBadge({ risk }: { risk: number }) {
  const [label, style] =
    risk >= 4
      ? ["Needs a visit", "bg-danger/10 text-danger"]
      : risk >= 2
        ? ["Drifting", "bg-primary/10 text-primary"]
        : ["Watch", "bg-surface-soft text-muted-foreground"];
  return (
    <span className={`rounded px-2 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}

export default async function InsightsPage() {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const seesGiving = can(membership.role, "finance.view");
  const canFollowUp = can(membership.role, "people.write");
  const supabase = await createClient();

  const [{ data, error }, { data: checkInCount }] = await Promise.all([
    supabase.rpc("attrition_watchlist", {
      org_id: membership.organization.id,
      recent_weeks: 6,
      baseline_weeks: 18,
    }),
    supabase.from("attendance_check_ins").select("id"),
  ]);

  const rows = ((data ?? []) as Watch[]).filter((r) => r.risk > 0);
  const hasCheckIns = (checkInCount?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-sm text-muted-foreground">
          People who used to be here regularly and quietly aren&rsquo;t any
          more — before they disappear altogether.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          Could not build the watchlist: {error.message}
        </p>
      )}

      {!hasCheckIns ? (
        <Card>
          <h2 className="text-sm font-bold text-foreground">
            Nothing to analyse yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This works by comparing each member against their own past
            attendance, so it needs to know <em>who</em> was at a service, not
            just how many people came.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Open a service under{" "}
            <Link
              href="/attendance"
              className="font-medium text-primary hover:underline"
            >
              Attendance
            </Link>{" "}
            and tick off who was present. After a few weeks there is enough
            history to spot a change. Head counts alone stay perfectly valid
            for your returns — this is an extra, not a replacement.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card>
              <CardLabel>On the watchlist</CardLabel>
              <CardStat>{rows.length}</CardStat>
            </Card>
            <Card>
              <CardLabel>Needs a visit</CardLabel>
              <CardStat>{rows.filter((r) => r.risk >= 4).length}</CardStat>
            </Card>
            <Card>
              <CardLabel>Drifting</CardLabel>
              <CardStat>
                {rows.filter((r) => r.risk >= 2 && r.risk < 4).length}
              </CardStat>
            </Card>
          </div>

          {canFollowUp && rows.length > 0 && (
            <Card>
              <h2 className="text-sm font-bold text-foreground">
                Reach out to them
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Queues a short &ldquo;we&rsquo;ve missed you&rdquo; text to
                everyone listed who has a phone number. Anyone already
                contacted in the last fortnight is skipped, so nobody is
                nagged.
              </p>
              <form action={queueAbsenceFollowUps} className="mt-3">
                <input type="hidden" name="minRisk" value="2" />
                <Button type="submit" variant="secondary">
                  Queue follow-up messages
                </Button>
              </form>
            </Card>
          )}

          <Card className="p-0">
            {rows.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                Nobody is drifting. Everyone with a track record of attending
                is still turning up at their usual rate.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Member</th>
                      <th className="px-5 py-3 font-semibold">Last seen</th>
                      <th className="px-5 py-3 font-semibold">Was attending</th>
                      <th className="px-5 py-3 font-semibold">Now</th>
                      {seesGiving && (
                        <th className="px-5 py-3 font-semibold">Last gave</th>
                      )}
                      <th className="px-5 py-3 text-right font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.member_id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          <Link
                            href={`/members/${r.member_id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {r.full_name}
                          </Link>
                          <span className="block text-xs font-normal text-muted-foreground">
                            {r.group_name ?? "No group"}
                            {r.phone ? ` · ${r.phone}` : ""}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {r.last_attended
                            ? `${dateFmt.format(new Date(r.last_attended))}`
                            : "Never"}
                          {r.weeks_since_seen !== null && (
                            <span className="block text-xs">
                              {r.weeks_since_seen} weeks ago
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 font-numeric text-muted-foreground">
                          {pct(r.baseline_rate)}
                        </td>
                        <td className="px-5 py-3 font-numeric font-bold text-foreground">
                          {pct(r.recent_rate)}
                        </td>
                        {seesGiving && (
                          <td className="px-5 py-3 text-muted-foreground">
                            {r.last_gave
                              ? dateFmt.format(new Date(r.last_gave))
                              : "—"}
                          </td>
                        )}
                        <td className="px-5 py-3 text-right">
                          <RiskBadge risk={r.risk} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              Compares the last 6 weeks against the 18 before them, as a share
              of services actually held. Someone who never attended much
              isn&rsquo;t listed — this looks for a{" "}
              <em>change</em> in a person&rsquo;s own pattern, not for low
              attendance.
              {!seesGiving && " Giving signals are excluded from your view."}
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
