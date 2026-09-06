import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardLabel, CardStat } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { SERVICE_TYPES, labelFor } from "@/lib/constants";
import { toggleCheckIn } from "../actions";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function AttendanceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { id } = await params;
  const { error, message } = await searchParams;

  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const canWrite = can(membership.role, "attendance.write");
  const supabase = await createClient();

  const { data: record } = await supabase
    .from("attendance_records")
    .select("id, service_type, date, male_count, female_count")
    .eq("id", id)
    .maybeSingle();

  if (!record) notFound();

  const [{ data: memberRows }, { data: checkInRows }] = await Promise.all([
    supabase
      .from("members")
      .select("id, full_name, member_groups!members_member_group_id_fkey ( name )")
      .eq("status", "active")
      .order("full_name"),
    supabase
      .from("attendance_check_ins")
      .select("member_id")
      .eq("attendance_record_id", id),
  ]);

  const members = (memberRows ?? []) as {
    id: string;
    full_name: string;
    member_groups: { name: string } | { name: string }[] | null;
  }[];
  const present = new Set(
    ((checkInRows ?? []) as { member_id: string }[]).map((c) => c.member_id)
  );

  const headCount = record.male_count + record.female_count;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/attendance"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All services
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          {labelFor(SERVICE_TYPES, record.service_type)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dateFmt.format(new Date(record.date))}
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardLabel>Head count</CardLabel>
          <CardStat>{headCount}</CardStat>
        </Card>
        <Card>
          <CardLabel>Named present</CardLabel>
          <CardStat>{present.size}</CardStat>
        </Card>
        <Card>
          <CardLabel>Unnamed</CardLabel>
          <CardStat>{Math.max(0, headCount - present.size)}</CardStat>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-bold text-foreground">Who was here</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Optional. The head count above stands on its own — naming people is
          what makes it possible to notice someone quietly drifting away.
        </p>

        {members.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No active members yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => {
              const isPresent = present.has(m.id);
              const group = Array.isArray(m.member_groups)
                ? m.member_groups[0]
                : m.member_groups;
              return (
                <form key={m.id} action={toggleCheckIn}>
                  <input type="hidden" name="recordId" value={record.id} />
                  <input type="hidden" name="memberId" value={m.id} />
                  <input
                    type="hidden"
                    name="present"
                    value={isPresent ? "1" : "0"}
                  />
                  <button
                    disabled={!canWrite}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      isPresent
                        ? "border-primary/40 bg-primary/5 font-medium text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <span>
                      {m.full_name}
                      {group && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {group.name}
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs ${
                        isPresent
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border"
                      }`}
                    >
                      {isPresent ? "✓" : ""}
                    </span>
                    <span className="sr-only">
                      {isPresent ? "Mark absent" : "Mark present"}
                    </span>
                  </button>
                </form>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
