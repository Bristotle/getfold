import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/admin-header";
import { STATUS_LABEL, ago, type DirectoryRow } from "@/lib/platform";

export const dynamic = "force-dynamic";
export const metadata = { title: "Churches, Fold", robots: { index: false, follow: false } };

/**
 * Every church on Fold, for support.
 *
 * Only the directory: name, status, size and the pastor's email, from
 * platform_church_directory(), which refuses anybody without
 * app_admins.can_view_churches. Nothing inside a church is shown here.
 * Looking inside one is a separate, deliberate step that the church can
 * see in its own activity log.
 */
const day = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function ChurchesPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("platform_church_directory");
  // Same answer as the enquiries page gives a non administrator, so this
  // page does not confirm its own existence.
  if (error) redirect("/dashboard");

  const rows = (data ?? []) as DirectoryRow[];

  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <AdminHeader current="/admin/churches" />

      <h1 className="mt-8 text-xl font-bold text-foreground">Churches</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every church on Fold. Opening one shows its records read only for
        up to an hour, and is written into that church&rsquo;s own activity
        log as &ldquo;Fold support&rdquo;.
      </p>

      <p className="mt-3 text-sm text-foreground">
        <span className="font-numeric">{rows.length}</span> churches ·{" "}
        <span className="font-numeric">
          {rows.filter((r) => r.changes_this_week > 0).length}
        </span>{" "}
        active this week ·{" "}
        <span className="font-numeric">
          {rows.reduce((n, r) => n + Number(r.member_count), 0)}
        </span>{" "}
        members in all
      </p>

      {message && (
        <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success-text">
          {message}
        </p>
      )}

      <Card className="mt-6 p-0">
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.organization_id}>
              <Link
                href={`/admin/churches/${r.organization_id}`}
                className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4 hover:bg-surface-soft"
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">{r.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {r.pastor_email ?? "No pastor"} · joined{" "}
                    {day.format(new Date(r.created_at))}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    Last change {ago(r.last_active_at)} ·{" "}
                    <span className="font-numeric">{r.changes_this_week}</span> this week ·
                    signed in {ago(r.last_sign_in_at)} ·{" "}
                    <span className="font-numeric">{r.team_count}</span> on the team
                  </span>
                </span>
                <span className="flex items-center gap-3 text-xs">
                  <span className="font-numeric text-muted-foreground">
                    {r.member_count} members
                  </span>
                  <span className="rounded bg-surface-soft px-2 py-1 font-semibold text-foreground">
                    {STATUS_LABEL[r.subscription_status] ?? r.subscription_status}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
