import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { DataList, DataRow, TableWrap } from "@/components/ui/data-list";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";

export const metadata = { title: "Activity, Fold" };

/**
 * Who changed what, and when.
 *
 * Written by database triggers rather than by the pages that make the
 * changes, so it records what actually happened rather than what the
 * application remembered to mention. Nobody can edit or delete an entry,
 * including the pastor reading it, which is the only thing that makes a log
 * worth having.
 *
 * Leadership only. A class leader seeing that the treasurer corrected a
 * contribution is not oversight, it is gossip.
 */
type Entry = {
  id: string;
  actor_name: string;
  action: string;
  entity: string;
  summary: string;
  created_at: string;
};

/** The table name as a church would say it. */
const ENTITY_LABEL: Record<string, string> = {
  members: "Register",
  contributions: "Giving",
  attendance_records: "Attendance",
  vital_records: "Vital records",
  organization_members: "Team",
};

const ACTION_TONE: Record<string, string> = {
  created: "bg-success/15 text-success-text",
  updated: "bg-primary/10 text-primary",
  deleted: "bg-danger/10 text-danger-text",
};

const when = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function ActivityPage() {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  // RLS would return nothing anyway; saying so beats an empty page that
  // looks broken.
  // org.manage is LEADERSHIP, which is exactly the role list in the
  // activity_log select policy. The two must not drift.
  if (!can(membership.role, "org.manage")) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">
          Only the pastor or an administrator can see the activity log.
        </p>
      </Card>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, actor_name, action, entity, summary, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const entries = (data ?? []) as Entry[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Activity</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every change to your register, giving, attendance and team, with who
          made it. Nobody can edit or remove an entry, including you.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
          Could not load the activity log: {error.message}
        </p>
      )}

      <Card className="p-0">
        {entries.length === 0 ? (
          <p className="p-5 text-sm leading-relaxed text-muted-foreground">
            Nothing recorded yet. The next time somebody adds a member, logs a
            service or records giving, it will appear here.
          </p>
        ) : (
          <>
            <DataList>
              {entries.map((e) => (
                <DataRow
                  key={e.id}
                  title={e.summary}
                  meta={`${e.actor_name} ${e.action} · ${when.format(new Date(e.created_at))}`}
                  trailing={
                    <span className="text-xs font-semibold text-muted-foreground">
                      {ENTITY_LABEL[e.entity] ?? e.entity}
                    </span>
                  }
                />
              ))}
            </DataList>

            <TableWrap>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">When</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Who</th>
                    <th scope="col" className="px-5 py-3 font-semibold">What</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Where</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id} className="border-b border-border last:border-0">
                      <td className="whitespace-nowrap px-5 py-3 font-numeric text-muted-foreground">
                        {when.format(new Date(e.created_at))}
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {e.actor_name}
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        <span
                          className={`mr-2 rounded px-1.5 py-0.5 text-xs font-semibold capitalize ${
                            ACTION_TONE[e.action] ?? "bg-surface-soft text-muted-foreground"
                          }`}
                        >
                          {e.action}
                        </span>
                        {e.summary}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {ENTITY_LABEL[e.entity] ?? e.entity}
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
