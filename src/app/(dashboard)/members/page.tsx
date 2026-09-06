import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { createMember, archiveMember, restoreMember } from "./actions";

type MemberRow = {
  id: string;
  full_name: string;
  gender: string | null;
  phone: string | null;
  email: string | null;
  member_type: string | null;
  status: string;
  joined_at: string;
  member_groups: { name: string } | { name: string }[] | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const one = <T,>(v: T | T[] | null): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : v;

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; show?: string }>;
}) {
  const { error, message, show } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const canWrite = can(membership.role, "people.write");

  const showArchived = show === "archived";

  const supabase = await createClient();
  const { data, error: loadError } = await supabase
    .from("members")
    .select(
      "id, full_name, gender, phone, email, member_type, status, joined_at, member_groups!members_member_group_id_fkey ( name )"
    )
    .eq("status", showArchived ? "archived" : "active")
    .order("full_name", { ascending: true });

  const members = (data ?? []) as MemberRow[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground">
            The register for {membership.organization.name}.
          </p>
        </div>
        <div className="flex gap-1">
          <Link
            href="/members"
            className={
              showArchived
                ? "rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                : "rounded-lg bg-surface-soft px-3 py-1.5 text-sm font-medium text-foreground"
            }
          >
            Active
          </Link>
          <Link
            href="/members?show=archived"
            className={
              showArchived
                ? "rounded-lg bg-surface-soft px-3 py-1.5 text-sm font-medium text-foreground"
                : "rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            Archived
          </Link>
        </div>
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
          Could not load members: {loadError.message}
        </p>
      )}

      {!showArchived && canWrite && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">Add a member</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Only the name is required, the rest can be filled in later.
          </p>
          <form
            action={createMember}
            className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-medium text-foreground">
                Full name
              </span>
              <input
                name="fullName"
                required
                placeholder="e.g. Ama Owusu"
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
              <span className="text-xs font-medium text-foreground">
                Date of birth
              </span>
              <input name="dateOfBirth" type="date" className={inputClass} />
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
              <span className="text-xs font-medium text-foreground">Email</span>
              <input name="email" type="email" className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">
                Member type
              </span>
              <input
                name="memberType"
                placeholder="e.g. Full Member, Catechumen"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-foreground">
                Address
              </span>
              <input name="address" className={inputClass} />
            </label>
            <div className="flex items-end">
              <SubmitButton className="w-full">
                Add member
              </SubmitButton>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-0">
        {members.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            {showArchived
              ? "No archived members."
              : "No members yet. Add your first one above."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Name</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Group</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Joined</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      <Link
                        href={`/members/${m.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {m.full_name}
                      </Link>
                      {m.email && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {m.email}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {m.member_type ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {one(m.member_groups)?.name ?? "-"}
                    </td>
                    <td className="px-5 py-3 font-numeric text-muted-foreground">
                      {m.phone ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {dateFmt.format(new Date(m.joined_at))}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <form action={showArchived ? restoreMember : archiveMember}>
                        <input type="hidden" name="id" value={m.id} />
                        <button
                          className={
                            showArchived
                              ? "text-xs font-medium text-muted-foreground hover:text-primary"
                              : "text-xs font-medium text-muted-foreground hover:text-danger-text"
                          }
                        >
                          {showArchived ? "Restore" : "Archive"}
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

      {members.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {members.length} {showArchived ? "archived" : "active"}{" "}
          {members.length === 1 ? "member" : "members"}.
        </p>
      )}
    </div>
  );
}
