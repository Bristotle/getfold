import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { TryBand } from "@/components/marketing/try-band";
import { STAT_SECTIONS, STAT_COUNT, STATS_UPDATED, STATS_NEXT } from "@/lib/stats";
import { metaDescription } from "@/lib/seo";

const TITLE = "Church statistics Ghana 2026: denominations, membership, mobile money";
const DESCRIPTION =
  "The numbers on the church in Ghana with their sources: religion from the 2021 census, the Methodist, Presbyterian, Assemblies of God, Catholic, Adventist and E.P. churches in figures, mobile money and giving fees, and the Data Protection Act. Updated quarterly.";

export const metadata: Metadata = {
  title: "Church statistics Ghana 2026",
  description: metaDescription(DESCRIPTION),
  keywords: ["church statistics Ghana", "Christianity in Ghana statistics", "Methodist Church Ghana membership", "mobile money statistics Ghana 2025", "religion Ghana census 2021"],
  alternates: { canonical: "https://www.getfold.org/church-statistics-ghana" },
  openGraph: { images: ["/og-default.png"], title: TITLE, description: DESCRIPTION },
};

const longDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

/**
 * The statistics page. Every figure with a source and a date, the update
 * date at the top, and the next one promised. Dataset structured data so
 * the page is findable as data, not only as prose.
 */
export default function StatsPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Dataset",
              name: "Church statistics, Ghana",
              description: DESCRIPTION,
              url: "https://www.getfold.org/church-statistics-ghana",
              dateModified: STATS_UPDATED,
              creator: { "@type": "Organization", name: "Fold", url: "https://www.getfold.org" },
              license: "https://creativecommons.org/licenses/by/4.0/",
              keywords: ["Ghana", "church", "religion", "census", "mobile money"],
              citation: STAT_SECTIONS.flatMap((s) => s.stats.map((x) => x.source.url)).filter((u, i, a) => a.indexOf(u) === i),
            },
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: TITLE,
              description: DESCRIPTION,
              datePublished: "2026-09-21",
              dateModified: STATS_UPDATED,
              author: { "@type": "Organization", name: "Fold" },
              publisher: { "@type": "Organization", name: "Fold", logo: { "@type": "ImageObject", url: "https://www.getfold.org/brand/fold-icon@512.png" } },
              mainEntityOfPage: "https://www.getfold.org/church-statistics-ghana",
            },
          ]),
        }}
      />
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Statistics</p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              The church in Ghana, in figures
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {STAT_COUNT} figures on religion, the denominations, mobile money and the law a church register sits under, each with the source it came from and the date it is for. Cite them, with the source.
            </p>
            <p className="mt-5 inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border bg-surface px-4 py-2.5 font-numeric text-sm text-foreground">
              <span>Checked {longDate(STATS_UPDATED)}</span>
              <span className="text-muted-foreground">Next update {longDate(STATS_NEXT)}</span>
            </p>
            <nav aria-label="Sections" className="mt-6 flex flex-wrap gap-2">
              {STAT_SECTIONS.map((s) => (
                <a key={s.slug} href={`#${s.slug}`} className="inline-flex min-h-9 items-center rounded-full border border-border bg-surface px-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          {STAT_SECTIONS.map((s) => (
            <div key={s.slug} id={s.slug} className="mt-14 scroll-mt-24 first:mt-0">
              <h2 className="text-balance font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{s.title}</h2>
              <p className="mt-3 font-serif text-[20px] leading-snug text-foreground">{s.intro}</p>
              <dl className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
                {s.stats.map((x) => (
                  <div key={x.label} className="grid min-w-0 gap-1 px-5 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
                    <div className="min-w-0">
                      <dt className="text-[15px] font-medium text-foreground">{x.label}</dt>
                      <dd className="m-0 mt-1 text-xs text-muted-foreground">
                        {x.asOf}.{" "}
                        <a href={x.source.url} target="_blank" rel="noopener nofollow" className="inline-flex items-center gap-1 text-primary hover:underline">
                          {x.source.label}
                          <ExternalLink size={11} strokeWidth={2.2} aria-hidden="true" />
                        </a>
                        {x.note && <span className="block mt-0.5">{x.note}</span>}
                      </dd>
                    </div>
                    <dd className="m-0 font-numeric text-2xl font-bold text-foreground sm:text-right">{x.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}

          <div className="mt-14 rounded-2xl border border-border bg-surface-soft p-6 text-[15px] leading-relaxed text-muted-foreground">
            <h2 className="text-base font-bold text-foreground">Using these figures</h2>
            <p className="mt-2">
              Quote the figure with its original source, which is linked beside it. This page is a collection, not the origin. If a source has moved or a figure is out of date, <Link href="/contact" className="font-medium text-primary hover:underline">tell us</Link> and it will be corrected at the next check or sooner. Figures are removed when their source disappears rather than kept on trust.
            </p>
            <p className="mt-3">
              Related reading:{" "}
              <Link href="/blog/what-mobile-money-costs-a-church" className="font-medium text-primary hover:underline">what mobile money costs a church</Link>,{" "}
              <Link href="/glossary" className="font-medium text-primary hover:underline">the glossary</Link>, and{" "}
              <Link href="/for/methodist-churches" className="font-medium text-primary hover:underline">Fold by denomination</Link>.
            </p>
          </div>
        </section>

        <TryBand title="Your own church's figures, without the counting" body="Membership, attendance and giving as they stand, and the return produced from them. Thirty days free." />
      </main>
      <SiteFooter />
    </div>
  );
}
