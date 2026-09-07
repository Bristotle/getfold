import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { createMember, archiveMember, restoreMember, importMembers } from "./actions";

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
          <a
            href={`/members/export${showArchived ? "?show=archived" : ""}`}
            className="inline-flex min-h-9 items-center rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Export CSV
          </a>
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

      {canWrite && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">
            Import from a spreadsheet
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Already have your register in Excel or Google Sheets? Save it as
            CSV and upload it here. The first row should be column names. We
            look for Name, Gender, Date of Birth, Phone, Email, Address,
            Member Type and Group, and we are not fussy about how they are
            spelled.
          </p>
          <form
            action={importMembers}
            className="mt-4 flex flex-wrap items-end gap-3"
          >
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">
                CSV file
              </span>
              <input
                type="file"
                name="file"
                accept=".csv,text/csv"
                required
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-surface-soft file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </label>
            <SubmitButton variant="secondary" pendingLabel="Importing…">
              Import members
            </SubmitButton>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Groups are matched to ones you have already created. Rows without a
            name are skipped and reported, never guessed at.
          </p>
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
          <>
            {/* Phone: one card per member. A six column table on a 390px
                screen means horizontal scrolling to reach the action, which
                is the wrong shape for the device most of these users have. */}
            <ul className="m-0 flex list-none flex-col p-0 sm:hidden">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/members/${m.id}`}
                      className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {m.full_name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {[
                        m.member_type,
                        one(m.member_groups)?.name,
                        m.phone,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "No details yet"}
                    </p>
                  </div>
                  <form action={showArchived ? restoreMember : archiveMember}>
                    <input type="hidden" name="id" value={m.id} />
                    <SubmitButton
                      variant={showArchived ? "quiet" : "destructive"}
                      size="xs"
                      pendingLabel="…"
                    >
                      {showArchived ? "Restore" : "Archive"}
                    </SubmitButton>
                  </form>
                </li>
              ))}
            </ul>

            {/* Tablet and up: the full table. */}
            <div className="hidden overflow-x-auto sm:block">
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
                        <SubmitButton
                          variant={showArchived ? "quiet" : "destructive"}
                          size="xs"
                          pendingLabel="…"
                        >
                          {showArchived ? "Restore" : "Archive"}
                        </SubmitButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
                      </div>
          </>
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
