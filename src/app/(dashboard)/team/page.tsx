import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { DataList, DataRow, TableWrap, metaLine } from "@/components/ui/data-list";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can, ROLE_LABELS, ROLE_DESCRIPTIONS, assignableRoles } from "@/lib/permissions";
import {
  inviteMember,
  revokeInvitation,
  changeRole,
  removeMember, resetChurch, resendInvitation } from "./actions";

type MemberRow = {
  id: string;
  role: string;
  profile_id: string;
  created_at: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

type InviteRow = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  accepted_at: string | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

// super_admin is platform support access, not a church role to hand out.


const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const one = <T,>(v: T | T[] | null): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : v;

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { userId, membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  // RLS returns nothing here to a non-admin; redirecting is clearer than an
  // empty page.
  if (!can(membership.role, "org.manage")) redirect("/dashboard");

  // Only the pastor sees "Pastor" in the list.
  const roleOptions = assignableRoles(membership.role);

  const supabase = await createClient();

  const [{ data: memberData, error: loadError }, { data: inviteData }] =
    await Promise.all([
      supabase
        .from("organization_members")
        .select("id, role, profile_id, created_at, profiles ( full_name )")
        .order("created_at"),
      supabase
        .from("organization_invitations")
        .select("id, email, role, created_at, accepted_at")
        .is("accepted_at", null)
        .order("created_at", { ascending: false }),
    ]);

  const members = (memberData ?? []) as MemberRow[];
  const invites = (inviteData ?? []) as InviteRow[];
  const adminCount = members.filter((m) =>
    ["super_admin", "admin"].includes(m.role)
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground">
          Who can use Fold for {membership.organization.name}, and what each
          person is allowed to do.
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
          Could not load the team: {loadError.message}
        </p>
      )}

      <Card>
        <h2 className="text-sm font-bold text-foreground">Invite someone</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          They don&rsquo;t need an account yet. We email them a link to sign
          up, and they join this church with the role you pick as soon as they
          do.
        </p>
        <form
          action={inviteMember}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="person@example.com"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Role</span>
            <select name="role" defaultValue="elder" className={inputClass}>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r] ?? r}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <SubmitButton className="w-full">
              Send invitation
            </SubmitButton>
          </div>
        </form>

        <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-border pt-4 text-xs sm:grid-cols-2">
          {roleOptions.map((r) => (
            <div key={r} className="flex flex-col">
              <dt className="font-semibold text-foreground">
                {ROLE_LABELS[r] ?? r}
              </dt>
              <dd className="text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {invites.length > 0 && (
        <Card className="p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold text-foreground">
              Pending invitations ({invites.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <tbody>
              {invites.map((i) => (
                <tr key={i.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">
                    {i.email}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {ROLE_LABELS[i.role] ?? i.role}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    Invited {dateFmt.format(new Date(i.created_at))}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center gap-1">
                      <form action={resendInvitation}>
                        <input type="hidden" name="id" value={i.id} />
                        <SubmitButton variant="quiet" size="xs" pendingLabel="Sending…">
                          Send again
                        </SubmitButton>
                      </form>
                      <form action={revokeInvitation}>
                        <input type="hidden" name="id" value={i.id} />
                        <Button type="submit" variant="destructive" size="xs">
                          Revoke
                        </Button>
                      </form>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            Each person is emailed a link to sign up. They join this church as
            soon as they sign up with the address you invited.
          </p>
        </Card>
      )}

      <Card className="p-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold text-foreground">
            Members ({members.length})
          </h2>
        </div>
        <>
          <DataList>
            {members.map((m) => {
              const isSelf = m.profile_id === userId;
              const isLastAdmin =
                ["super_admin", "admin"].includes(m.role) && adminCount === 1;
              return (
                <DataRow
                  key={m.id}
                  title={
                    <>
                      {one(m.profiles)?.full_name ?? "Unnamed"}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </>
                  }
                  meta={metaLine(
                    ROLE_LABELS[m.role] ?? m.role,
                    `Joined ${dateFmt.format(new Date(m.created_at))}`,
                    isLastAdmin ? "Last administrator" : undefined
                  )}
                  action={
                    isLastAdmin ? null : (
                      <form action={removeMember}>
                        <input type="hidden" name="id" value={m.id} />
                        <SubmitButton variant="destructive" size="xs" pendingLabel="…">
                          Remove
                        </SubmitButton>
                      </form>
                    )
                  }
                />
              );
            })}
          </DataList>
          <TableWrap>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Name</th>
                <th scope="col" className="px-5 py-3 font-semibold">Role</th>
                <th scope="col" className="px-5 py-3 font-semibold">Joined</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isSelf = m.profile_id === userId;
                const isLastAdmin =
                  ["super_admin", "admin"].includes(m.role) && adminCount === 1;

                return (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      {one(m.profiles)?.full_name ?? "Unnamed"}
                      {isSelf && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <form action={changeRole} className="flex gap-2">
                        <input type="hidden" name="id" value={m.id} />
                        <select
                          name="role"
                          defaultValue={m.role}
                          disabled={isLastAdmin}
                          className="h-8 rounded-lg border border-border bg-surface px-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                        >
                          {roleOptions.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r] ?? r}
                            </option>
                          ))}
                        </select>
                        {!isLastAdmin && (
                          <SubmitButton size="sm" variant="secondary">
                            Save
                          </SubmitButton>
                        )}
                      </form>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {dateFmt.format(new Date(m.created_at))}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isLastAdmin ? (
                        <span className="text-xs text-muted-foreground">
                          Last administrator
                        </span>
                      ) : (
                        <form action={removeMember}>
                          <input type="hidden" name="id" value={m.id} />
                          <Button type="submit" variant="destructive" size="xs">
                          Remove
                        </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </TableWrap>
        </>
        <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
          A church must always keep at least one administrator, the database
          refuses the change otherwise, so you cannot lock yourself out.
        </p>
      </Card>

      {can(membership.role, "org.transfer") && (
        <Card className="border-danger/30">
          <h2 className="text-sm font-bold text-foreground">Start again</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Clears every member, class, visitor, service, gift, fund, message
            and meeting reminder, so you can begin with a clean register. It
            cannot be undone.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Kept: your church, its settings, your team and their roles, your
            invoices, and records of giving paid online. The activity log
            notes that you cleared it.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Want a copy first?{" "}
            <Link href="/members/export" prefetch={false} className="font-medium text-primary underline">
              Export your members
            </Link>{" "}
            before you clear them.
          </p>
          <form action={resetChurch} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">
                Type <span className="font-semibold">{membership.organization.name}</span> to confirm
              </span>
              <input
                name="confirmName"
                required
                autoComplete="off"
                className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-danger/40"
              />
            </label>
            <SubmitButton variant="destructive" pendingLabel="Clearing…">
              Clear everything and start again
            </SubmitButton>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Only the pastor sees this.
          </p>
        </Card>
      )}
    </div>
  );
}
