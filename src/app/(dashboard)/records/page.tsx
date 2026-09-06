import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { DataList, DataRow, TableWrap, metaLine } from "@/components/ui/data-list";
import { Card, CardLabel, CardStat } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { VITAL_RECORD_TYPES, labelFor } from "@/lib/constants";
import { createVitalRecord, deleteVitalRecord } from "./actions";

type RecordRow = {
  id: string;
  type: string;
  date: string;
  note: string | null;
  members: { full_name: string } | { full_name: string }[] | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const one = <T,>(v: T | T[] | null): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : v;

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; type?: string }>;
}) {
  const { error, message, type: filter } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const canWrite = can(membership.role, "records.write");

  const supabase = await createClient();

  let query = supabase
    .from("vital_records")
    .select("id, type, date, note, members ( full_name )")
    .order("date", { ascending: false })
    .limit(200);

  const validFilter = VITAL_RECORD_TYPES.some((t) => t.value === filter)
    ? filter
    : undefined;
  if (validFilter) query = query.eq("type", validFilter);

  const [{ data, error: loadError }, { data: memberList }, { data: allTypes }] =
    await Promise.all([
      query,
      supabase
        .from("members")
        .select("id, full_name")
        .eq("status", "active")
        .order("full_name"),
      supabase.from("vital_records").select("type"),
    ]);

  const records = (data ?? []) as RecordRow[];
  const members = (memberList ?? []) as { id: string; full_name: string }[];

  const countByType = new Map<string, number>();
  for (const r of (allTypes ?? []) as { type: string }[]) {
    countByType.set(r.type, (countByType.get(r.type) ?? 0) + 1);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vital records</h1>
        <p className="text-sm text-muted-foreground">
          Baptisms, confirmations, weddings and deaths, the register a church
          is most often asked to produce.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success-text">
          {message}
        </p>
      )}
      {loadError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
          Could not load records: {loadError.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {VITAL_RECORD_TYPES.map((t) => (
          <Card key={t.value}>
            <CardLabel>{t.label}s</CardLabel>
            <CardStat>{countByType.get(t.value) ?? 0}</CardStat>
          </Card>
        ))}
      </div>

      {canWrite && (
      <Card>
        <h2 className="text-sm font-bold text-foreground">Add a record</h2>
        <form
          action={createVitalRecord}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Type</span>
            <select name="type" defaultValue="baptism" className={inputClass}>
              {VITAL_RECORD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
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
            <span className="text-xs font-medium text-foreground">
              Member{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <select name="memberId" defaultValue="" className={inputClass}>
              <option value="">Not on the register</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Note{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <input
              name="note"
              placeholder="e.g. names, officiating minister"
              className={inputClass}
            />
          </label>
          <div className="flex items-end">
            <SubmitButton className="w-full">
              Save record
            </SubmitButton>
          </div>
        </form>
      </Card>
      )}

      <div className="flex flex-wrap gap-1">
        <Link
          href="/records"
          className={
            validFilter
              ? "rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              : "rounded-lg bg-surface-soft px-3 py-1.5 text-sm font-medium text-foreground"
          }
        >
          All
        </Link>
        {VITAL_RECORD_TYPES.map((t) => (
          <Link
            key={t.value}
            href={`/records?type=${t.value}`}
            className={
              validFilter === t.value
                ? "rounded-lg bg-surface-soft px-3 py-1.5 text-sm font-medium text-foreground"
                : "rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {t.label}s
          </Link>
        ))}
      </div>

      <Card className="p-0">
        {records.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No records{validFilter ? " of this type" : ""} yet.
          </p>
        ) : (
          <>
            <DataList>
              {records.map((r) => (
                <DataRow
                  key={r.id}
                  title={labelFor(VITAL_RECORD_TYPES, r.type)}
                  meta={metaLine(
                    dateFmt.format(new Date(r.date)),
                    one(r.members)?.full_name,
                    r.note
                  )}
                  action={
                    <form action={deleteVitalRecord}>
                      <input type="hidden" name="id" value={r.id} />
                      <SubmitButton variant="destructive" size="xs" pendingLabel="…">
                        Delete
                      </SubmitButton>
                    </form>
                  }
                />
              ))}
            </DataList>

            <TableWrap>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Date</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Member</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Note</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-muted-foreground">
                      {dateFmt.format(new Date(r.date))}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {labelFor(VITAL_RECORD_TYPES, r.type)}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {one(r.members)?.full_name ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {r.note ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <form action={deleteVitalRecord}>
                        <input type="hidden" name="id" value={r.id} />
                        <Button type="submit" variant="destructive" size="xs">
                          Delete
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </TableWrap>
          </>
        )}
      </Card>
    </div>
  );
}
