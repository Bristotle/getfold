"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getMembership, ACTIVE_ORG_COOKIE } from "@/lib/org";
import { can } from "@/lib/permissions";

/**
 * Creates a branch under the church the user is currently in.
 *
 * The capability check here is a courtesy so the error is readable. The
 * real refusal happens inside create_branch(), which reads the caller's
 * own membership row and raises if they do not lead the parent.
 */
export async function createBranch(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  if (!can(membership.role, "org.manage")) {
    redirect(
      `/branches?error=${encodeURIComponent("Only the pastor or an administrator can add a branch.")}`
    );
  }
  if (!name) {
    redirect(`/branches?error=${encodeURIComponent("Give the branch a name.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_branch", {
    parent_id: membership.organization.id,
    branch_name: name,
  });

  if (error) {
    redirect(`/branches?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/branches");
  redirect(
    `/branches?message=${encodeURIComponent(`${name} added. Switch to it whenever you want to work in it.`)}`
  );
}

/**
 * Switches which church the user is looking at.
 *
 * The cookie is only a preference. getMembership() ignores it unless the
 * user genuinely belongs to the church it names, and RLS would refuse the
 * data even if that check were removed.
 */
export async function switchOrg(formData: FormData) {
  const orgId = String(formData.get("orgId") ?? "");

  const store = await cookies();
  store.set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
