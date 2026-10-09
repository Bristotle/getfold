"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { friendly } from "@/lib/errors";

/**
 * Opening and closing a church for support.
 *
 * The permission check, the time limit and the entry in the church's own
 * activity log all happen inside start_platform_view() in the database, so
 * nothing here can widen them. These only call it and say what happened.
 */

const UUID = /^[0-9a-f-]{36}$/i;

export async function openChurch(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/churches");

  const supabase = await createClient();
  const { error } = await supabase.rpc("start_platform_view", { org_id: id });
  if (error) {
    redirect(`/admin/churches/${id}?error=${encodeURIComponent(friendly(error))}`);
  }
  redirect(`/admin/churches/${id}`);
}

export async function closeChurch(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/churches");

  const supabase = await createClient();
  await supabase.rpc("end_platform_view", { org_id: id });
  redirect("/admin/churches?message=Closed. You can no longer see that church.");
}
