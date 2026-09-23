"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { friendly } from "@/lib/errors";

const back = (params: Record<string, string>) =>
  redirect(`/profile?${new URLSearchParams(params).toString()}`);

/**
 * A person's own name and phone number.
 *
 * Nothing here is an administrative action: the RLS policy
 * "profiles: self update" already restricts it to the caller's own row, so
 * there is no role to check. A pastor and a class leader change their own
 * details the same way.
 */
export async function updateProfile(formData: FormData) {
  const { userId } = await getMembership();
  if (!userId) redirect("/login");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (fullName.length < 2) {
    back({ error: "Put in the name your church knows you by." });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName.slice(0, 120), phone: phone.slice(0, 40) || null })
    .eq("id", userId);

  if (error) back({ error: friendly(error) });

  /*
    The name appears on the team list and against everything this person
    records, so the whole dashboard is stale once it changes.
  */
  revalidatePath("/", "layout");
  back({ message: "Your details are saved." });
}

/**
 * A new password.
 *
 * Supabase requires a live session to change a password, which this has,
 * so the current password is not re-asked for. The confirmation field is
 * there to catch a typo, not to authenticate.
 */
export async function updatePassword(formData: FormData) {
  const { userId } = await getMembership();
  if (!userId) redirect("/login");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    back({ error: "A password needs at least 8 characters." });
  }
  if (password !== confirm) {
    back({ error: "The two passwords are not the same. Type the new one twice." });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) back({ error: friendly(error, "That password was not accepted. Try a longer one.") });

  back({ message: "Your password is changed. It applies the next time you sign in." });
}

/**
 * A new email address.
 *
 * Supabase sends a confirmation to the NEW address and does not move the
 * account until it is clicked, which is the behaviour we want: somebody
 * who mistypes an address cannot lock themselves out, and somebody who
 * borrows an unlocked laptop cannot take the account over.
 */
export async function updateEmail(formData: FormData) {
  const { userId, email: current } = await getMembership();
  if (!userId) redirect("/login");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@") || email.length < 5) {
    back({ error: "That does not look like an email address." });
  }
  if (email === current) {
    back({ error: "That is already your address." });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });
  if (error) back({ error: friendly(error, "We could not change that address. Try again.") });

  back({
    message: `Check ${email} and click the link we sent. Your address changes only after that, and until then you sign in with the old one.`,
  });
}
