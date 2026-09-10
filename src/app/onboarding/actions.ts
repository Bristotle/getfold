"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ORG_TYPES = ["local_church", "circuit", "diocese", "denomination_hq"];

export async function createOrganization(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "local_church");
  const denomination = String(formData.get("denomination") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const heardChannel = String(formData.get("heardAbout") ?? "").trim();
  const heardDetail = String(formData.get("heardDetail") ?? "").trim();

  if (!name) {
    redirect("/onboarding?error=Please enter your church name.");
  }

  // Guard the enum here as well as in the DB: an invalid value would
  // otherwise surface as a raw Postgres cast error.
  const orgType = ORG_TYPES.includes(type) ? type : "local_church";

  const supabase = await createClient();

  // Goes through the create_organization SECURITY DEFINER function rather
  // than a direct insert. RLS gives `organizations` no INSERT policy, so a
  // plain .insert() here would always be refused, see
  // supabase/migrations/0003_onboarding.sql for why.
  const { data, error } = await supabase.rpc("create_organization", {
    heard_channel: heardChannel || null,
    heard_detail: heardDetail || null,
    org_name: name,
    org_type: orgType,
    org_denomination: denomination || null,
    org_phone: phone || null,
    org_address: address || null,
  });

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  if (!data) {
    redirect("/onboarding?error=Could not create the church. Please try again.");
  }

  // Deliberately NOT revalidatePath("/", "layout"). Every authenticated
  // page is already rendered per request, so revalidating them changes
  // nothing, while "/" with "layout" invalidated all ~50 static marketing
  // and help pages on every single sign in. That was the largest source of
  // ISR writes on the project and none of it was needed.
  redirect("/dashboard");
}
