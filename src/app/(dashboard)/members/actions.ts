"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { ownsOptionalRow } from "@/lib/owns";
import { parseMembersCsv } from "@/lib/csv";
import { can } from "@/lib/permissions";
import { queueMessage } from "@/lib/notify";
import { renderTemplate, DEFAULT_TEMPLATES } from "@/lib/messaging";

const GENDERS = ["male", "female"];

function clean(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

export async function createMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/members?error=${encodeURIComponent("You do not have permission to change members.")}`);
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) {
    redirect("/members?error=A member needs a full name.");
  }

  const gender = clean(formData, "gender");
  const dateOfBirth = clean(formData, "dateOfBirth");

  const supabase = await createClient();

  // organization_id is set from the server-side membership, never from the
  // form, a client-supplied value would be an obvious tenant-crossing hole.
  // RLS would reject it anyway (the insert policy checks org_role against
  // this column), but not sending it at all is the stronger guarantee.
  const { error } = await supabase.from("members").insert({
    organization_id: membership.organization.id,
    full_name: fullName,
    gender: gender && GENDERS.includes(gender) ? gender : null,
    date_of_birth: dateOfBirth,
    phone: clean(formData, "phone"),
    email: clean(formData, "email"),
    address: clean(formData, "address"),
    member_type: clean(formData, "memberType"),
  });

  if (error) {
    redirect(`/members?error=${encodeURIComponent(error.message)}`);
  }

  /*
    Only when the person adding them says so.

    A church adds members for all sorts of reasons: a new convert on
    Sunday, but also a thirty year member somebody finally got round to
    recording, or a correction after a bad import. Welcoming the second two
    to a church they have belonged to for decades is embarrassing, so the
    form asks rather than assuming.
  */
  const sendWelcome = formData.get("sendWelcome") === "on";

  const { data: orgTemplates } = sendWelcome
    ? await supabase
        .from("organizations")
        .select("sms_template_welcome")
        .eq("id", membership.organization.id)
        .maybeSingle<{ sms_template_welcome: string | null }>()
    : { data: null };

  // Best-effort: a failure to queue the welcome must not undo adding the
  // member, so queueMessage swallows its own errors.
  if (sendWelcome) await queueMessage({
    organizationId: membership.organization.id,
    type: "welcome",
    automatic: true,
    sendNow: true,
    phone: clean(formData, "phone"),
    body: renderTemplate(
      orgTemplates?.sms_template_welcome ?? DEFAULT_TEMPLATES.welcome,
      { name: fullName, church: membership.organization.name }
    ),
  });

  revalidatePath("/members");
  revalidatePath("/dashboard");
  redirect(`/members?message=${encodeURIComponent(`${fullName} added.`)}`);
}

export async function archiveMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/members?error=${encodeURIComponent("You do not have permission to change members.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/members?error=Missing member id.");

  const supabase = await createClient();

  // Archive rather than delete: contributions, attendance and vital records
  // reference members, and a church's history shouldn't disappear because
  // someone left. The scoping .eq on organization_id is belt-and-braces on
  // top of the RLS update policy.
  const { error } = await supabase
    .from("members")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) {
    redirect(`/members?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/members");
  revalidatePath("/dashboard");
  redirect("/members?message=Member archived.");
}

export async function updateMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/members?error=${encodeURIComponent("You do not have permission to change members.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/members?error=Missing member id.");

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) redirect(`/members/${id}?error=A member needs a full name.`);

  const gender = clean(formData, "gender");
  const groupId = String(formData.get("memberGroupId") ?? "").trim();

  const supabase = await createClient();

  if (!(await ownsOptionalRow("member_groups", groupId || null, membership.organization.id))) {
    redirect(`/members/${id}?error=${encodeURIComponent("That group is not in your church.")}`);
  }

  const { error } = await supabase
    .from("members")
    .update({
      full_name: fullName,
      gender: gender && GENDERS.includes(gender) ? gender : null,
      date_of_birth: clean(formData, "dateOfBirth"),
      phone: clean(formData, "phone"),
      email: clean(formData, "email"),
      address: clean(formData, "address"),
      member_type: clean(formData, "memberType"),
      member_group_id: groupId || null,
    })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) {
    redirect(`/members/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/members");
  revalidatePath(`/members/${id}`);
  redirect(`/members/${id}?message=Changes saved.`);
}

export async function restoreMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/members?error=${encodeURIComponent("You do not have permission to change members.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/members?error=Missing member id.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ status: "active", archived_at: null })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) {
    redirect(`/members?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/members");
  revalidatePath("/dashboard");
  redirect("/members?message=Member restored.");
}

/**
 * Bulk import from a spreadsheet.
 *
 * Churches arrive with their register already in Excel or Google Sheets, and
 * retyping 400 names is the reason software like this gets abandoned in week
 * two. Column names are matched loosely, because no two churches label them
 * the same way.
 *
 * Rows that cannot be imported are reported with their line number rather
 * than silently dropped: a church needs to know which three of its 400
 * members did not arrive.
 */
export async function importMembers(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "people.write")) {
    redirect(`/members?error=${encodeURIComponent("You do not have permission to add members.")}`);
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect(`/members?error=${encodeURIComponent("Choose a CSV file to import.")}`);
  }

  // Guard against someone uploading a 200MB spreadsheet by accident.
  if (file.size > 2 * 1024 * 1024) {
    redirect(
      `/members?error=${encodeURIComponent("That file is larger than 2MB. Split it, or export just the columns you need.")}`
    );
  }

  const { rows, skipped, unmatchedHeaders } = parseMembersCsv(await file.text());

  if (rows.length === 0) {
    redirect(
      `/members?error=${encodeURIComponent(
        "No members found in that file. The first row should be column names, with one called Name or Full Name."
      )}`
    );
  }

  const supabase = await createClient();

  // Groups named in the file are matched to existing ones. We do not create
  // groups here: a typo would otherwise litter the church with near
  // duplicates like "Wesley Class" and "wesley class".
  const { data: groupRows } = await supabase
    .from("member_groups")
    .select("id, name");
  const groupByName = new Map(
    (groupRows ?? []).map((g) => [g.name.toLowerCase().trim(), g.id as string])
  );

  const payload = rows.map((r) => ({
    organization_id: membership.organization.id,
    full_name: r.full_name,
    gender: r.gender,
    date_of_birth: r.date_of_birth,
    phone: r.phone,
    email: r.email,
    address: r.address,
    member_type: r.member_type,
    member_group_id: r.group
      ? (groupByName.get(r.group.toLowerCase().trim()) ?? null)
      : null,
  }));

  // Inserted in batches so one large file does not exceed the request limit,
  // and so a failure halfway still leaves the earlier batches in place.
  let inserted = 0;
  for (let i = 0; i < payload.length; i += 200) {
    const batch = payload.slice(i, i + 200);
    const { error } = await supabase.from("members").insert(batch);
    if (error) {
      redirect(
        `/members?error=${encodeURIComponent(
          `${inserted} members imported, then row ${i + 2} failed: ${error.message}`
        )}`
      );
    }
    inserted += batch.length;
  }

  revalidatePath("/members");
  revalidatePath("/dashboard");

  const notes = [
    `${inserted} member${inserted === 1 ? "" : "s"} imported.`,
    skipped.length
      ? `${skipped.length} row${skipped.length === 1 ? "" : "s"} skipped (line ${skipped
          .slice(0, 3)
          .map((s) => s.line)
          .join(", ")}${skipped.length > 3 ? "…" : ""}): no name.`
      : "",
    unmatchedHeaders.length
      ? `Ignored column${unmatchedHeaders.length === 1 ? "" : "s"}: ${unmatchedHeaders.join(", ")}.`
      : "",
  ].filter(Boolean);

  redirect(`/members?message=${encodeURIComponent(notes.join(" "))}`);
}
