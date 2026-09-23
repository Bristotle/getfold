import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { ROLE_LABELS } from "@/lib/permissions";
import { updateProfile, updatePassword, updateEmail } from "./actions";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const labelClass = "block text-sm font-medium text-foreground";

/**
 * Your own details.
 *
 * The database has allowed a person to update their own profile row since
 * migration 0002, and until now there was nowhere to do it: a secretary who
 * married and changed her name, or who got a new number, had to ask an
 * administrator to do it in the members list, which is a different table
 * and did not change her sign in at all.
 *
 * Three separate forms rather than one, because they fail differently. A
 * name saves instantly; a password applies next time; an email does not
 * change until a link in the inbox is clicked. One combined Save button
 * could not honestly report all three.
 */
export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { userId, email, membership } = await getMembership();
  if (!userId || !email) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", userId)
    .maybeSingle<{ full_name: string | null; phone: string | null }>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Your details</h1>
        <p className="text-sm text-muted-foreground">
          Your name, your number and how you sign in. These are yours, not
          your church&rsquo;s, and only you can change them.
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

      {/* ---------- who you are here ---------- */}
      {membership && (
        <Card>
          <h2 className="text-base font-bold text-foreground">Where you belong</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Church
              </dt>
              <dd className="m-0 mt-1 text-sm font-medium text-foreground">
                {membership.organization.name}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your role
              </dt>
              <dd className="m-0 mt-1 text-sm font-medium text-foreground">
                {ROLE_LABELS[membership.role] ?? membership.role}
              </dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            Your role decides what you can see and change. Only the pastor or
            an administrator can alter it, from the Team page.
          </p>
        </Card>
      )}

      {/* ---------- name and phone ---------- */}
      <Card>
        <h2 className="text-base font-bold text-foreground">Name and phone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your name appears on the team list and against everything you
          record, so your church knows who did what.
        </p>
        <form action={updateProfile} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="p-name" className={labelClass}>
              Full name
            </label>
            <input
              id="p-name"
              name="fullName"
              required
              defaultValue={profile?.full_name ?? ""}
              autoComplete="name"
              placeholder="Abena Owusu"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div>
            <label htmlFor="p-phone" className={labelClass}>
              Phone{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="p-phone"
              name="phone"
              type="tel"
              defaultValue={profile?.phone ?? ""}
              autoComplete="tel"
              placeholder="0244 000 000"
              className={`mt-1.5 font-numeric ${inputClass}`}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              So your own team can reach you. It is never shown to members and
              never used for texts to the congregation.
            </p>
          </div>
          <div>
            <SubmitButton pendingLabel="Saving…">Save details</SubmitButton>
          </div>
        </form>
      </Card>

      {/* ---------- password ---------- */}
      <Card>
        <h2 className="text-base font-bold text-foreground">Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Change it here whenever you like. You will stay signed in on this
          device; the new one applies the next time you sign in.
        </p>
        <form action={updatePassword} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="p-pass" className={labelClass}>
              New password
            </label>
            <input
              id="p-pass"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={`mt-1.5 ${inputClass}`}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              At least 8 characters. A short phrase you will remember beats a
              short word you will not.
            </p>
          </div>
          <div>
            <label htmlFor="p-confirm" className={labelClass}>
              Type it again
            </label>
            <input
              id="p-confirm"
              name="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div>
            <SubmitButton pendingLabel="Changing…">Change password</SubmitButton>
          </div>
        </form>
      </Card>

      {/* ---------- email ---------- */}
      <Card>
        <h2 className="text-base font-bold text-foreground">
          Email address
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You sign in with{" "}
          <span className="font-numeric font-medium text-foreground">{email}</span>
          . To change it, put the new address below. We send a link there, and
          nothing changes until you click it.
        </p>
        <form action={updateEmail} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="p-email" className={labelClass}>
              New email address
            </label>
            <input
              id="p-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@yourchurch.org"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
          <div>
            <SubmitButton pendingLabel="Sending…">Send the link</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
