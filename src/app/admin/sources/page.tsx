import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { AdminHeader } from "@/components/admin/admin-header";

export const dynamic = "force-dynamic";
export const metadata = { title: "Where churches come from, Fold", robots: { index: false, follow: false } };

/**
 * Which pages and which sites bring signups, churches and enquiries.
 *
 * The measure the content is judged by: not how many people read a post,
 * but how many churches it brought. From platform_attribution(), which only
 * Fold staff may call. Counts only, no names.
 */
type Row = {
  kind: "signup" | "enquiry";
  happened_at: string;
  from_page: string | null;
  from_site: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  has_church: boolean | null;
};

type Tally = { key: string; signups: number; churches: number; enquiries: number };

function tally(rows: Row[], keyOf: (r: Row) => string): Tally[] {
  const map = new Map<string, Tally>();
  for (const r of rows) {
    const key = keyOf(r);
    const t = map.get(key) ?? { key, signups: 0, churches: 0, enquiries: 0 };
    if (r.kind === "signup") {
      t.signups++;
      if (r.has_church) t.churches++;
    } else t.enquiries++;
    map.set(key, t);
  }
  return [...map.values()].sort(
    (a, b) => b.churches - a.churches || b.signups - a.signups || b.enquiries - a.enquiries
  );
}

function TallyTable({ title, rows, first }: { title: string; rows: Tally[]; first: string }) {
  return (
    <Card className="mt-4 min-w-0 p-0">
      <h2 className="px-5 pt-4 text-sm font-bold text-foreground">{title}</h2>
      {rows.length === 0 ? (
        <p className="px-5 pb-4 pt-2 text-sm text-muted-foreground">Nothing yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-2 font-semibold">{first}</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Signups</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">Churches</th>
                <th scope="col" className="px-5 py-2 text-right font-semibold">Enquiries</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.key} className="border-b border-border last:border-0">
                  <th scope="row" className="max-w-xs truncate px-5 py-2 font-normal text-foreground">
                    {t.key}
                  </th>
                  <td className="px-3 py-2 text-right font-numeric">{t.signups}</td>
                  <td className="px-3 py-2 text-right font-numeric font-semibold">{t.churches}</td>
                  <td className="px-5 py-2 text-right font-numeric">{t.enquiries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const days = [30, 90, 365].includes(Number((await searchParams).days))
    ? Number((await searchParams).days)
    : 90;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("platform_attribution", { days });
  if (error) redirect("/dashboard");
  const rows = (data ?? []) as Row[];

  // Older signups predate tracking; say so rather than calling them "direct".
  const known = (r: Row) => r.from_page || r.from_site || r.utm_source;
  const tracked = rows.filter(known);

  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <AdminHeader current="/admin/sources" />

      <h1 className="mt-8 text-xl font-bold text-foreground">Where churches come from</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Which page and which site led to each signup and enquiry. Judge the
        content by the churches column: a post read by forty pastors who all
        signed up beats one read by thousands who did not.
      </p>

      <div className="mt-4 flex gap-2 text-sm">
        {[30, 90, 365].map((d) => (
          <Link
            key={d}
            href={`/admin/sources?days=${d}`}
            className={
              d === days
                ? "rounded-lg bg-surface-soft px-3 py-1.5 font-medium text-foreground"
                : "rounded-lg px-3 py-1.5 text-muted-foreground hover:text-foreground"
            }
          >
            Last {d} days
          </Link>
        ))}
      </div>

      <p className="mt-4 text-sm text-foreground">
        <span className="font-numeric">{rows.filter((r) => r.kind === "signup").length}</span> signups,{" "}
        <span className="font-numeric">{rows.filter((r) => r.has_church).length}</span> went on to
        create a church,{" "}
        <span className="font-numeric">{rows.filter((r) => r.kind === "enquiry").length}</span> enquiries.{" "}
        <span className="text-muted-foreground">
          <span className="font-numeric">{rows.length - tracked.length}</span> arrived before
          tracking began on 21 October 2026, or with the browser not saying.
        </span>
      </p>

      <TallyTable
        title="By the page that led there"
        first="Page"
        rows={tally(tracked.filter((r) => r.from_page), (r) => r.from_page!)}
      />
      <TallyTable
        title="By the site that sent them"
        first="Site"
        rows={tally(tracked, (r) => r.from_site ?? "getfold.org directly, or a link with no referrer")}
      />
      <TallyTable
        title="By campaign tag (utm_source / utm_campaign)"
        first="Campaign"
        rows={tally(
          tracked.filter((r) => r.utm_source),
          (r) => [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(" / ")
        )}
      />

      <p className="mt-6 text-xs text-muted-foreground">
        To tag a link you share, add <code className="font-numeric">?utm_source=whatsapp&amp;utm_campaign=pastors-group</code>{" "}
        to it, for example{" "}
        <code className="font-numeric">getfold.org/?utm_source=whatsapp&amp;utm_campaign=pastors-group</code>.
        Nothing is stored in a visitor&rsquo;s browser to do any of this.
      </p>
    </main>
  );
}
