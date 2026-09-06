"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";

const GENDERS = ["male", "female"];

function clean(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

export async function createVisitor(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/visitors?error=${encodeURIComponent("You do not have permission to change visitors.")}`);
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) redirect("/visitors?error=A visitor needs a name.");

  const gender = clean(formData, "gender");
  const dateOfVisit = clean(formData, "dateOfVisit");

  const supabase = await createClient();
  const { error } = await supabase.from("visitors").insert({
    organization_id: membership.organization.id,
    full_name: fullName,
    gender: gender && GENDERS.includes(gender) ? gender : null,
    phone: clean(formData, "phone"),
    how_heard: clean(formData, "howHeard"),
    // date_of_visit defaults to now() in the database; only override it when
    // someone is recording a visit after the fact.
    ...(dateOfVisit ? { date_of_visit: dateOfVisit } : {}),
  });

  if (error) redirect(`/visitors?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/visitors");
  redirect(`/visitors?message=${encodeURIComponent(`${fullName} recorded.`)}`);
}

export async function convertVisitor(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/visitors?error=${encodeURIComponent("You do not have permission to change visitors.")}`);
  }

  const visitorId = String(formData.get("id") ?? "");
  if (!visitorId) redirect("/visitors?error=Missing visitor id.");

  const supabase = await createClient();

  const { data: visitor, error: findError } = await supabase
    .from("visitors")
    .select("id, full_name, gender, phone, converted_member_id")
    .eq("id", visitorId)
    .maybeSingle();

  if (findError || !visitor) {
    redirect("/visitors?error=Could not find that visitor.");
  }

  // converted_member_id is UNIQUE, so a double submission would otherwise
  // fail on a constraint violation rather than telling the user anything
  // useful.
  if (visitor.converted_member_id) {
    redirect("/visitors?error=That visitor has already become a member.");
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .insert({
      organization_id: membership.organization.id,
      full_name: visitor.full_name,
      gender: visitor.gender,
      phone: visitor.phone,
    })
    .select("id")
    .single();

  if (memberError || !member) {
    redirect(
      `/visitors?error=${encodeURIComponent(
        memberError?.message ?? "Could not create the member."
      )}`
    );
  }

  const { error: linkError } = await supabase
    .from("visitors")
    .update({ converted_member_id: member.id })
    .eq("id", visitorId)
    .eq("organization_id", membership.organization.id);

  if (linkError) {
    // The member exists but the link failed. Say so plainly rather than
    // implying nothing happened, otherwise a retry creates a duplicate.
    redirect(
      `/visitors?error=${encodeURIComponent(
        `${visitor.full_name} was added to members, but could not be linked back to the visitor record: ${linkError.message}`
      )}`
    );
  }

  revalidatePath("/visitors");
  revalidatePath("/members");
  revalidatePath("/dashboard");
  redirect(
    `/visitors?message=${encodeURIComponent(
      `${visitor.full_name} is now a member.`
    )}`
  );
}
