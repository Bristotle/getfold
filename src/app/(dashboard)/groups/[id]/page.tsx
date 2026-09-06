import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { GROUP_TYPES } from "@/lib/constants";
import {
  updateGroup,
  assignMember,
  unassignMember,
  deleteGroup,
} from "../actions";

type Member = { id: string; full_name: string; phone: string | null };

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

export default async function GroupDetailPage({
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

  const supabase = await createClient();

  const { data: group } = await supabase
    .from("member_groups")
    .select("id, name, type, leader_id")
    .eq("id", id)
    .maybeSingle();

  // RLS makes another church's group indistinguishable from a deleted one.
  // Both come back empty, which is exactly the behaviour we want.
  if (!group) notFound();

  const [{ data: inGroup }, { data: available }] = await Promise.all([
    supabase
      .from("members")
      .select("id, full_name, phone")
      .eq("member_group_id", id)
      .eq("status", "active")
      .order("full_name"),
    supabase
      .from("members")
      .select("id, full_name, phone")
      .is("member_group_id", null)
      .eq("status", "active")
      .order("full_name"),
  ]);

  const memberRows = (inGroup ?? []) as Member[];
  const availableRows = (available ?? []) as Member[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/groups"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All groups
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-foreground">
          {group.name}
        </h1>
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

      <Card>
        <h2 className="text-sm font-bold text-foreground">Group details</h2>
        <form
          action={updateGroup}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input type="hidden" name="id" value={group.id} />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Name</span>
            <input
              name="name"
              defaultValue={group.name}
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Type</span>
            <select
              name="type"
              defaultValue={group.type}
              className={inputClass}
            >
              {GROUP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Leader</span>
            <select
              name="leaderId"
              defaultValue={group.leader_id ?? ""}
              className={inputClass}
            >
              <option value="">No leader</option>
              {/* Only members of this group can lead it. */}
              {memberRows.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Save changes
            </Button>
          </div>
        </form>
        {memberRows.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Add members to this group before choosing a leader.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-foreground">Add a member</h2>
        {availableRows.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Every active member already belongs to a group. A member can be in
            one group at a time.
          </p>
        ) : (
          <form action={assignMember} className="mt-4 flex flex-wrap gap-3">
            <input type="hidden" name="groupId" value={group.id} />
            <select
              name="memberId"
              className={`${inputClass} max-w-xs flex-1`}
              defaultValue=""
            >
              <option value="" disabled>
                Choose a member…
              </option>
              {availableRows.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary">
              Add to group
            </Button>
          </form>
        )}
      </Card>

      <Card className="p-0">
        {memberRows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No members in this group yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {memberRows.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground">
                      {m.full_name}
                      {m.id === group.leader_id && (
                        <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                          Leader
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-numeric text-muted-foreground">
                      {m.phone ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <form action={unassignMember}>
                        <input type="hidden" name="groupId" value={group.id} />
                        <input type="hidden" name="memberId" value={m.id} />
                        <button className="text-xs font-medium text-muted-foreground hover:text-danger">
                          Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-foreground">Delete this group</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Members are never deleted, they simply stop belonging to a group.
        </p>
        <form action={deleteGroup} className="mt-3">
          <input type="hidden" name="id" value={group.id} />
          <button className="text-sm font-medium text-danger hover:underline">
            Delete {group.name}
          </button>
        </form>
      </Card>
    </div>
  );
}
