import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { createVisitor, convertVisitor } from "./actions";

type VisitorRow = {
  id: string;
  full_name: string;
  gender: string | null;
  phone: string | null;
  date_of_visit: string;
  how_heard: string | null;
  converted_member_id: string | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const canWrite = can(membership.role, "people.write");

  const supabase = await createClient();
  const { data, error: loadError } = await supabase
    .from("visitors")
    .select(
      "id, full_name, gender, phone, date_of_visit, how_heard, converted_member_id"
    )
    .order("date_of_visit", { ascending: false })
    .limit(100);

  const visitors = (data ?? []) as VisitorRow[];
  const pending = visitors.filter((v) => !v.converted_member_id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Visitors</h1>
        <p className="text-sm text-muted-foreground">
          First-timers and returning guests. Convert someone to a member when
          they commit, their details carry over.
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
          Could not load visitors: {loadError.message}
        </p>
      )}

      {canWrite && (
      <Card>
        <h2 className="text-sm font-bold text-foreground">Record a visitor</h2>
        <form
          action={createVisitor}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Full name
            </span>
            <input
              name="fullName"
              required
              placeholder="e.g. Yaw Darko"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Gender</span>
            <select name="gender" defaultValue="" className={inputClass}>
              <option value="">Not stated</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Phone</span>
            <input
              name="phone"
              type="tel"
              placeholder="0244 000 000"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Date of visit
            </span>
            <input
              name="dateOfVisit"
              type="date"
              defaultValue={today}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              How they heard
            </span>
            <input
              name="howHeard"
              placeholder="e.g. Invited by Ama"
              className={inputClass}
            />
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-5">
            <Button type="submit">Record visitor</Button>
          </div>
        </form>
      </Card>
      )}

      <Card className="p-0">
        {visitors.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No visitors recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Visited</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">How they heard</th>
                  <th className="px-5 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground">
                      {v.full_name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {dateFmt.format(new Date(v.date_of_visit))}
                    </td>
                    <td className="px-5 py-3 font-numeric text-muted-foreground">
                      {v.phone ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {v.how_heard ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {v.converted_member_id ? (
                        <span className="rounded bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                          Member
                        </span>
                      ) : (
                        <form action={convertVisitor}>
                          <input type="hidden" name="id" value={v.id} />
                          <button className="text-xs font-semibold text-primary hover:underline">
                            Convert to member
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {visitors.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {visitors.length} recorded · {pending.length} not yet a member.
        </p>
      )}
    </div>
  );
}
