import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card } from "@/components/ui/card";
import { getMembership } from "@/lib/org";
import { signOut } from "@/app/(auth)/login/actions";
import { createOrganization } from "./actions";
import { acceptInvitations } from "@/app/(dashboard)/team/actions";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS } from "@/lib/permissions";

const inputClass =
  "h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const ORG_TYPES = [
  { value: "local_church", label: "Local church / society" },
  { value: "circuit", label: "Circuit" },
  { value: "diocese", label: "Diocese" },
  { value: "denomination_hq", label: "Denomination HQ" },
];

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { email, membership } = await getMembership();

  // Middleware already blocks anonymous access; this also covers the case
  // where the session expires between the middleware check and render.
  if (!email) redirect("/login");

  // Onboarding is a one-time step, someone who already has a church has
  // no business here.
  if (membership) redirect("/dashboard");

  // Someone invited by an existing church should be joining it, not starting
  // a second one. The RLS policy on organization_invitations lets a user read
  // rows addressed to their own verified email.
  const supabase = await createClient();
  const { data: invites } = await supabase
    .from("organization_invitations")
    .select("id, role, organizations ( name )")
    .is("accepted_at", null);

  const invite = (invites?.[0] ?? null) as
    | { id: string; role: string; organizations: { name: string } | { name: string }[] | null }
    | null;
  const inviteOrg = Array.isArray(invite?.organizations)
    ? invite?.organizations[0]
    : invite?.organizations;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Step 1 of 1
        </p>
        <h1 className="mt-1 text-xl font-bold text-foreground">
          Set up your church
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This creates your church and puts it in your hands. You can invite
          administrators, elders and class leaders afterwards, and decide what
          each of them can see.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
            {error}
          </p>
        )}

        {invite && inviteOrg && (
          <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-bold text-foreground">
              You&rsquo;ve been invited to {inviteOrg.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Joining as {(ROLE_LABELS[invite.role] ?? invite.role).toLowerCase()}.
              You don&rsquo;t need to create a church.
            </p>
            <form action={acceptInvitations} className="mt-3">
              <SubmitButton>Join {inviteOrg.name}</SubmitButton>
            </form>
          </div>
        )}

        <form action={createOrganization} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Church name
            </span>
            <input
              name="name"
              type="text"
              required
              autoFocus
              placeholder="e.g. Bethel Methodist Society"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Organization type
            </span>
            <select name="type" defaultValue="local_church" className={inputClass}>
              {ORG_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              Most users are a local church. Circuits and dioceses sit above
              local churches in the hierarchy.
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Denomination{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <input
              name="denomination"
              type="text"
              placeholder="e.g. Methodist, Presbyterian, Pentecostal"
              className={inputClass}
            />
            <span className="text-xs text-muted-foreground">
              Used to pick sensible defaults for member types and reports.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                Phone{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </span>
              <input
                name="phone"
                type="tel"
                placeholder="0244 000 000"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                Town / city{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </span>
              <input
                name="address"
                type="text"
                placeholder="e.g. Kumasi"
                className={inputClass}
              />
            </label>
          </div>

          <SubmitButton size="lg" className="mt-2">
            Create church
          </SubmitButton>
        </form>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            Signed in as {email}
          </span>
          <form action={signOut}>
            <SubmitButton variant="quiet" size="xs">
                          Sign out
                        </SubmitButton>
          </form>
        </div>
      </Card>
    </main>
  );
}
