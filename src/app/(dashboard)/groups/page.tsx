import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { GROUP_TYPES, labelFor } from "@/lib/constants";
import { createGroup } from "./actions";

type GroupRow = {
  id: string;
  name: string;
  type: string;
  leader: { full_name: string } | { full_name: string }[] | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const one = <T,>(v: T | T[] | null): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : v;

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const canWrite = can(membership.role, "people.write");

  const supabase = await createClient();

  const [{ data, error: loadError }, { data: memberList }, { data: counts }] =
    await Promise.all([
      supabase
        .from("member_groups")
        .select("id, name, type, leader:members!member_groups_leader_id_fkey ( full_name )")
        .order("name"),
      supabase
        .from("members")
        .select("id, full_name")
        .eq("status", "active")
        .order("full_name"),
      supabase
        .from("members")
        .select("member_group_id")
        .eq("status", "active")
        .not("member_group_id", "is", null),
    ]);

  const groups = (data ?? []) as GroupRow[];
  const members = (memberList ?? []) as { id: string; full_name: string }[];

  // Counted client-side: PostgREST can return an aggregate count on an
  // embedded resource, but not without enabling aggregates project-wide.
  const sizeOf = new Map<string, number>();
  for (const r of (counts ?? []) as { member_group_id: string }[]) {
    sizeOf.set(r.member_group_id, (sizeOf.get(r.member_group_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Groups</h1>
        <p className="text-sm text-muted-foreground">
          Bible classes, fellowships, choirs and ministries. Name them however
          your church does — the type is only for grouping.
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
          Could not load groups: {loadError.message}
        </p>
      )}

      {canWrite && (
      <Card>
        <h2 className="text-sm font-bold text-foreground">Create a group</h2>
        <form
          action={createGroup}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Name</span>
            <input
              name="name"
              required
              placeholder="e.g. Wesley Bible Class"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Type</span>
            <select name="type" defaultValue="bible_class" className={inputClass}>
              {GROUP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Leader{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <select name="leaderId" defaultValue="" className={inputClass}>
              <option value="">No leader yet</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Create group
            </Button>
          </div>
        </form>
        {members.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Add members first if you want to assign a leader.
          </p>
        )}
      </Card>
      )}

      {groups.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            No groups yet. Create your first one above.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const leader = one(g.leader);
            return (
              <Link key={g.id} href={`/groups/${g.id}`} className="block">
                <Card className="h-full transition-colors hover:border-primary/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {labelFor(GROUP_TYPES, g.type)}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-foreground">
                    {g.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {sizeOf.get(g.id) ?? 0}{" "}
                    {(sizeOf.get(g.id) ?? 0) === 1 ? "member" : "members"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {leader ? `Led by ${leader.full_name}` : "No leader set"}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
