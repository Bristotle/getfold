import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { TryBand } from "@/components/marketing/try-band";
import { COMPARISONS, getComparison } from "@/lib/compare";
import { metaTitle, metaDescription } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) return { title: "Not found, Fold" };
  return {
    title: metaTitle(c.title),
    description: metaDescription(c.description),
    keywords: c.keywords,
    alternates: { canonical: `https://www.getfold.org/compare/${c.slug}` },
    openGraph: { images: ["/og-default.png"], title: c.title, description: metaDescription(c.description) },
  };
}

const checkedOn = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

/**
 * The head-to-head. The verdict comes first because it is the answer; the
 * table is the evidence; the two "choose" boxes are the part that makes
 * the rest believable.
 */
export default async function ComparisonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) notFound();
  const others = COMPARISONS.filter((x) => x.slug !== c.slug);

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Article",
              headline: c.title,
              description: c.description,
              datePublished: c.checked,
              dateModified: c.checked,
              author: { "@type": "Organization", name: "Fold" },
              publisher: { "@type": "Organization", name: "Fold", logo: { "@type": "ImageObject", url: "https://www.getfold.org/brand/fold-icon@512.png" } },
              mainEntityOfPage: `https://www.getfold.org/compare/${c.slug}`,
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ]),
        }}
      />
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <nav aria-label="Breadcrumb" className="text-sm">
              <Link href="/compare" className="inline-flex items-center gap-1.5 rounded font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
                All comparisons
              </Link>
            </nav>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Fold and {c.them}</p>
            <h1 className="mt-2 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">{c.title}</h1>
            <p className="mt-5 border-l-4 border-primary pl-4 text-[17px] leading-relaxed text-foreground">{c.verdict}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              What is said about {c.them} here was read from its own public material on {checkedOn(c.checked)}. Where that material does not say, this page says so.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-balance font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">What {c.them} is</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-foreground/85">{c.about}</p>
          <p className="mt-3 text-[16px] leading-relaxed text-foreground/85">
            <strong className="font-semibold text-foreground">Pricing:</strong> {c.theirPricing}
          </p>

          <h2 className="mt-12 text-balance font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Side by side</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-background">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-border px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question</th>
                  <th className="border-b border-border px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.them}</th>
                  <th className="border-b border-border px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-primary">Fold</th>
                </tr>
              </thead>
              <tbody>
                {c.rows.map((r) => (
                  <tr key={r.question}>
                    <td className="border-b border-border/60 px-4 py-3.5 align-top font-medium text-foreground">{r.question}</td>
                    <td className="border-b border-border/60 px-4 py-3.5 align-top leading-relaxed text-foreground/85">{r.them}</td>
                    <td className="border-b border-border/60 px-4 py-3.5 align-top leading-relaxed text-foreground/85">{r.fold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-lg font-bold text-foreground">{c.chooseThem.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{c.chooseThem.text}</p>
            </div>
            <div className="min-w-0 rounded-2xl border border-primary/40 bg-primary/5 p-6">
              <h2 className="text-lg font-bold text-foreground">{c.chooseFold.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{c.chooseFold.text}</p>
            </div>
          </div>

          <h2 className="mt-12 text-balance font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Questions</h2>
          <dl className="mt-6 flex flex-col gap-5">
            {c.faq.map((f) => (
              <div key={f.q} className="min-w-0">
                <dt className="text-lg font-bold text-foreground">{f.q}</dt>
                <dd className="m-0 mt-2 text-[16px] leading-relaxed text-foreground/85">{f.a}</dd>
              </div>
            ))}
          </dl>

          {c.sources.length > 0 && (
            <div className="mt-10 border-t border-border pt-6">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sources</h2>
              <ul className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0 text-sm">
                {c.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} rel="noopener nofollow" target="_blank" className="text-primary hover:underline">{s.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="mt-12 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Other comparisons</h2>
          <ul className="m-0 mt-4 flex list-none flex-wrap gap-2.5 p-0">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/compare/${o.slug}`} className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                  Fold and {o.them}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/compare" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                The full table
                <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </section>

        <TryBand title="Decide with your own register in it" body="Thirty days free, no card, and your records export the day you choose something else." />
      </main>
      <SiteFooter />
    </div>
  );
}
