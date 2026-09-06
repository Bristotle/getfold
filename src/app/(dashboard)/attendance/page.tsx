import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardLabel, CardStat } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { SERVICE_TYPES, labelFor } from "@/lib/constants";
import { recordAttendance } from "./actions";

type Row = {
  id: string;
  service_type: string;
  date: string;
  male_count: number;
  female_count: number;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const canWrite = can(membership.role, "attendance.write");

  const supabase = await createClient();
  const { data, error: loadError } = await supabase
    .from("attendance_records")
    .select("id, service_type, date, male_count, female_count")
    .order("date", { ascending: false })
    .limit(30);

  const rows = (data ?? []) as Row[];
  const total = rows.reduce((s, r) => s + r.male_count + r.female_count, 0);
  const average = rows.length ? Math.round(total / rows.length) : 0;

  // Default the date field to today, in the org's terms rather than UTC.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Head counts per service. Aggregate figures only, no per-member
          check-in required.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {message}
        </p>
      )}
      {loadError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          Could not load attendance: {loadError.message}
        </p>
      )}

      {canWrite && (
      <Card>
        <h2 className="text-sm font-bold text-foreground">Record a service</h2>
        <form
          action={recordAttendance}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <label className="flex flex-col gap-1.5 lg:col-span-2">
            <span className="text-xs font-medium text-foreground">Service</span>
            <select
              name="serviceType"
              defaultValue="sunday_service"
              className={inputClass}
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Date</span>
            <input
              name="date"
              type="date"
              defaultValue={today}
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Male</span>
            <input
              name="maleCount"
              type="number"
              min={0}
              defaultValue={0}
              className={`${inputClass} font-numeric`}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Female</span>
            <input
              name="femaleCount"
              type="number"
              min={0}
              defaultValue={0}
              className={`${inputClass} font-numeric`}
            />
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-5">
            <Button type="submit">Record attendance</Button>
          </div>
        </form>
      </Card>
      )}

      {rows.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardLabel>Services recorded</CardLabel>
            <CardStat>{rows.length}</CardStat>
          </Card>
          <Card>
            <CardLabel>Total attendance</CardLabel>
            <CardStat>{total}</CardStat>
          </Card>
          <Card>
            <CardLabel>Average per service</CardLabel>
            <CardStat>{average}</CardStat>
          </Card>
        </div>
      )}

      <Card className="p-0">
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No services recorded yet. Add your first one above, this is what
            fills the weekly figure on your dashboard.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Service</th>
                  <th className="px-5 py-3 text-right font-semibold">Male</th>
                  <th className="px-5 py-3 text-right font-semibold">Female</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-muted-foreground">
                      {dateFmt.format(new Date(r.date))}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      <Link
                        href={`/attendance/${r.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {labelFor(SERVICE_TYPES, r.service_type)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-right font-numeric text-muted-foreground">
                      {r.male_count}
                    </td>
                    <td className="px-5 py-3 text-right font-numeric text-muted-foreground">
                      {r.female_count}
                    </td>
                    <td className="px-5 py-3 text-right font-numeric font-bold text-foreground">
                      {r.male_count + r.female_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
