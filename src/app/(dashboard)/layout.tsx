import { redirect } from "next/navigation";
import { getMembership } from "@/lib/org";
import { signOut } from "@/app/(auth)/login/actions";
import { Nav } from "@/components/nav";
import { ROLE_LABELS } from "@/lib/permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, membership } = await getMembership();

  if (!email) redirect("/login");

  // A signed-in user with no church hasn't finished signing up. Send them
  // to onboarding rather than rendering a dashboard with nothing behind it.
  if (!membership) redirect("/onboarding");

  const { organization, role } = membership;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-bold text-foreground">
              {organization.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {ROLE_LABELS[role] ?? role}
              {organization.denomination
                ? ` · ${organization.denomination}`
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {email}
            </span>
            <form action={signOut}>
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <Nav role={role} />
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
