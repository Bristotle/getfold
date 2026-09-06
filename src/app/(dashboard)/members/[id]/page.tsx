import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardLabel, CardStat } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { CONTRIBUTION_TYPES, labelFor } from "@/lib/constants";
import { updateMember, archiveMember, restoreMember } from "../actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const cedis = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function MemberDetailPage({
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

  const { data: member } = await supabase
    .from("members")
    .select(
      "id, full_name, gender, date_of_birth, phone, email, address, member_type, status, joined_at, member_group_id"
    )
    .eq("id", id)
    .maybeSingle();

  if (!member) notFound();

  const [{ data: groupList }, { data: giving }] = await Promise.all([
    supabase.from("member_groups").select("id, name").order("name"),
    supabase
      .from("contributions")
      .select("id, type, amount, created_at")
      .eq("member_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const groups = (groupList ?? []) as { id: string; name: string }[];
  const contributions = (giving ?? []) as {
    id: string;
    type: string;
    amount: string | number;
    created_at: string;
  }[];

  const givenTotal = contributions.reduce((s, c) => s + Number(c.amount), 0);
  const isArchived = member.status === "archived";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/members"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← All members
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            {member.full_name}
          </h1>
          {isArchived && (
            <span className="rounded bg-surface-soft px-2 py-1 text-xs font-semibold text-muted-foreground">
              Archived
            </span>
          )}
        </div>
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
          <CardLabel>Member since</CardLabel>
          <CardStat className="text-xl">
            {dateFmt.format(new Date(member.joined_at))}
          </CardStat>
        </Card>
        <Card>
          <CardLabel>Recorded giving</CardLabel>
          <CardStat className="text-xl">{cedis.format(givenTotal)}</CardStat>
        </Card>
        <Card>
          <CardLabel>Entries</CardLabel>
          <CardStat className="text-xl">{contributions.length}</CardStat>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-bold text-foreground">Details</h2>
        <form
          action={updateMember}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <input type="hidden" name="id" value={member.id} />
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Full name
            </span>
            <input
              name="fullName"
              defaultValue={member.full_name}
              required
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Gender</span>
            <select
              name="gender"
              defaultValue={member.gender ?? ""}
              className={inputClass}
            >
              <option value="">Not stated</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Date of birth
            </span>
            <input
              name="dateOfBirth"
              type="date"
              defaultValue={member.date_of_birth?.slice(0, 10) ?? ""}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Phone</span>
            <input
              name="phone"
              type="tel"
              defaultValue={member.phone ?? ""}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={member.email ?? ""}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Member type
            </span>
            <input
              name="memberType"
              defaultValue={member.member_type ?? ""}
              placeholder="e.g. Full Member"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Group</span>
            <select
              name="memberGroupId"
              defaultValue={member.member_group_id ?? ""}
              className={inputClass}
            >
              <option value="">No group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-foreground">Address</span>
            <input
              name="address"
              defaultValue={member.address ?? ""}
              className={inputClass}
            />
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-3">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Card>

      <Card className="p-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold text-foreground">Giving history</h2>
        </div>
        {contributions.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Nothing recorded against this member yet.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <tbody>
              {contributions.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-muted-foreground">
                    {dateFmt.format(new Date(c.created_at))}
                  </td>
                  <td className="px-5 py-3 font-medium text-foreground">
                    {labelFor(CONTRIBUTION_TYPES, c.type)}
                  </td>
                  <td className="px-5 py-3 text-right font-numeric font-bold text-foreground">
                    {cedis.format(Number(c.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <h2 className="text-sm font-bold text-foreground">
          {isArchived ? "Restore this member" : "Archive this member"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isArchived
            ? "Bring them back into the active register and the dashboard count."
            : "They leave the active register but keep their giving and attendance history. Nothing is deleted."}
        </p>
        <form action={isArchived ? restoreMember : archiveMember} className="mt-3">
          <input type="hidden" name="id" value={member.id} />
          <button
            className={
              isArchived
                ? "text-sm font-medium text-primary hover:underline"
                : "text-sm font-medium text-danger hover:underline"
            }
          >
            {isArchived
              ? `Restore ${member.full_name}`
              : `Archive ${member.full_name}`}
          </button>
        </form>
      </Card>
    </div>
  );
}
