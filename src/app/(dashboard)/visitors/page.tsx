import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { DataList, DataRow, TableWrap, metaLine } from "@/components/ui/data-list";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { createVisitor, convertVisitor, deleteVisitor } from "./actions";

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

/*
  Removing asks once, in place: the row turns into "Remove this visitor?"
  with Yes and Cancel. A link rather than a dialog, so it works with no
  JavaScript on a weak connection, and so one stray tap cannot delete.
*/
function RemoveLink({ id }: { id: string }) {
  return (
    <Link
      href={`/visitors?remove=${id}`}
      scroll={false}
      className="inline-flex h-9 items-center rounded-lg px-2 text-xs font-medium text-danger-text hover:bg-danger/10"
    >
      Remove
    </Link>
  );
}

function RemoveConfirm({ id, name }: { id: string; name: string }) {
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1 text-xs">
      <span className="text-foreground">Remove {name}?</span>
      <form action={deleteVisitor}>
        <input type="hidden" name="id" value={id} />
        <SubmitButton variant="destructive" size="xs" pendingLabel="Removing…">
          Yes, remove
        </SubmitButton>
      </form>
      <Link
        href="/visitors"
        scroll={false}
        className="inline-flex h-9 items-center rounded-lg px-2 font-medium text-muted-foreground hover:bg-surface-soft"
      >
        Cancel
      </Link>
    </span>
  );
}

export default async function VisitorsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; remove?: string }>;
}) {
  const { error, message, remove } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const canWrite = can(membership.role, "people.write");
  const canDelete = can(membership.role, "people.delete");

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
            <SubmitButton>Record visitor</SubmitButton>
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
          <>
            <DataList>
              {visitors.map((v) => (
                <DataRow
                  key={v.id}
                  title={v.full_name}
                  meta={metaLine(
                    dateFmt.format(new Date(v.date_of_visit)),
                    v.phone,
                    v.how_heard
                  )}
                  action={
                    canDelete && remove === v.id ? (
                      <RemoveConfirm id={v.id} name={v.full_name} />
                    ) : (
                      <span className="flex items-center gap-1">
                        {v.converted_member_id ? (
                          <span className="rounded bg-success/10 px-2 py-1 text-xs font-semibold text-success-text">
                            Member
                          </span>
                        ) : (
                          <form action={convertVisitor}>
                            <input type="hidden" name="id" value={v.id} />
                            <SubmitButton variant="quiet" size="xs" pendingLabel="…">
                              Convert
                            </SubmitButton>
                          </form>
                        )}
                        {canDelete && <RemoveLink id={v.id} />}
                      </span>
                    )
                  }
                />
              ))}
            </DataList>

            <TableWrap>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Visited</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
                  <th scope="col" className="px-5 py-3 font-semibold">How they heard</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Status</th>
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
                      {canDelete && remove === v.id ? (
                        <RemoveConfirm id={v.id} name={v.full_name} />
                      ) : (
                        <span className="inline-flex items-center justify-end gap-1">
                          {v.converted_member_id ? (
                            <span className="rounded bg-success/10 px-2 py-1 text-xs font-semibold text-success-text">
                              Member
                            </span>
                          ) : (
                            <form action={convertVisitor}>
                              <input type="hidden" name="id" value={v.id} />
                              <SubmitButton variant="quiet" size="xs" pendingLabel="Converting…">
                                Convert to member
                              </SubmitButton>
                            </form>
                          )}
                          {canDelete && <RemoveLink id={v.id} />}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </TableWrap>
          </>
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
