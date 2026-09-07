import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { toCsv } from "@/lib/csv";

/**
 * Exports the member register as CSV.
 *
 * A route rather than a server action because the response is a file
 * download, and because opening it in a new tab is how people expect this to
 * work. Opens directly in Excel, Numbers and Google Sheets.
 *
 * The columns are deliberately the same names the importer recognises, so a
 * church can export, edit in a spreadsheet, and import the result back
 * without renaming anything.
 */
export async function GET(request: Request) {
  const { membership } = await getMembership();
  if (!membership) {
    return new Response("Not signed in", { status: 401 });
  }
  // Reading the register is open to any member of the church, matching what
  // the members page itself shows. RLS scopes the rows regardless.
  if (!can(membership.role, "people.write")) {
    return new Response("Not permitted", { status: 403 });
  }

  const url = new URL(request.url);
  const archived = url.searchParams.get("show") === "archived";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select(
      "full_name, gender, date_of_birth, phone, email, address, member_type, joined_at, member_groups!members_member_group_id_fkey ( name )"
    )
    .eq("status", archived ? "archived" : "active")
    .order("full_name");

  if (error) {
    return new Response(`Could not build the export: ${error.message}`, {
      status: 500,
    });
  }

  type Row = {
    full_name: string;
    gender: string | null;
    date_of_birth: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    member_type: string | null;
    joined_at: string;
    member_groups: { name: string } | { name: string }[] | null;
  };

  const rows = (data ?? []) as Row[];

  const csv = toCsv(
    [
      "Full Name",
      "Gender",
      "Date of Birth",
      "Phone",
      "Email",
      "Address",
      "Member Type",
      "Group",
      "Joined",
    ],
    rows.map((m) => {
      const g = Array.isArray(m.member_groups)
        ? m.member_groups[0]
        : m.member_groups;
      return [
        m.full_name,
        m.gender ?? "",
        m.date_of_birth ? m.date_of_birth.slice(0, 10) : "",
        // Leading apostrophe keeps Excel from eating the leading zero on an
        // 0244 number, or rendering it in scientific notation.
        m.phone ? `'${m.phone}` : "",
        m.email ?? "",
        m.address ?? "",
        m.member_type ?? "",
        g?.name ?? "",
        m.joined_at.slice(0, 10),
      ];
    })
  );

  const slug = membership.organization.slug;
  const date = new Date().toISOString().slice(0, 10);
  const name = `${slug}-members${archived ? "-archived" : ""}-${date}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      // Never cache a church's member list at the edge.
      "Cache-Control": "no-store",
    },
  });
}
