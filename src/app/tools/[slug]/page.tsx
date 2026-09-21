import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { TryBand } from "@/components/marketing/try-band";
import { PrintButton } from "@/components/tools/print-button";
import { FeeCalculator } from "@/components/tools/fee-calculator";
import { StatisticalReturnSheet, AttendanceSheet, OfferingCountSheet, MembershipForm } from "@/components/tools/sheets";
import { TOOLS, getTool } from "@/lib/tools";
import { metaTitle, metaDescription } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) return { title: "Not found, Fold" };
  return {
    title: metaTitle(t.title),
    description: metaDescription(t.description),
    keywords: t.keywords,
    alternates: { canonical: `https://www.getfold.org/tools/${t.slug}` },
    openGraph: { images: ["/og-default.png"], title: t.title, description: metaDescription(t.description) },
  };
}

const SHEETS: Record<string, React.ComponentType> = {
  "statistical-return-template": StatisticalReturnSheet,
  "attendance-sheet": AttendanceSheet,
  "offering-count-sheet": OfferingCountSheet,
  "membership-form": MembershipForm,
  "giving-fee-calculator": FeeCalculator,
};

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) notFound();
  const Sheet = SHEETS[t.slug];
  const others = TOOLS.filter((x) => x.slug !== t.slug);

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: t.title,
              description: t.description,
              step: t.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: t.faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getfold.org/" },
                { "@type": "ListItem", position: 2, name: "Free tools", item: "https://www.getfold.org/tools" },
                { "@type": "ListItem", position: 3, name: t.name },
              ],
            },
          ]),
        }}
      />
      <div className="print-hide">
        <SiteHeader />
      </div>
      <main id="main">
        <section className="print-hide relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <nav aria-label="Breadcrumb" className="text-sm">
              <Link href="/tools" className="inline-flex items-center gap-1.5 rounded font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
                Free tools
              </Link>
            </nav>
            <h1 className="mt-5 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {t.title}
            </h1>
            {t.intro.map((p) => (
              <p key={p} className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{p}</p>
            ))}
            {t.printable && (
              <div className="mt-6">
                <PrintButton />
              </div>
            )}
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 sm:py-14">
          <Sheet />
        </section>

        <section className="print-hide relative isolate overflow-hidden border-t border-border bg-surface">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <h2 className="text-balance font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">How to use it</h2>
            <ol className="m-0 mt-6 flex list-none flex-col gap-4 p-0">
              {t.steps.map((s, n) => (
                <li key={s} className="flex gap-4">
                  <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 font-numeric text-xs font-bold text-primary">{n + 1}</span>
                  <span className="pt-0.5 text-[16px] leading-relaxed text-foreground/85">{s}</span>
                </li>
              ))}
            </ol>

            <h2 className="mt-12 text-balance font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Questions</h2>
            <dl className="mt-6 flex flex-col gap-5">
              {t.faq.map((f) => (
                <div key={f.q} className="min-w-0">
                  <dt className="text-lg font-bold text-foreground">{f.q}</dt>
                  <dd className="m-0 mt-2 text-[16px] leading-relaxed text-foreground/85">{f.a}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-10 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 text-[15px] leading-relaxed text-foreground">
              <Link href={t.inFold.href as "/"} className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
                {t.inFold.label}
                <ArrowRight size={15} strokeWidth={2.4} aria-hidden="true" />
              </Link>
            </p>

            <h2 className="mt-12 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Other free tools</h2>
            <ul className="m-0 mt-4 flex list-none flex-wrap gap-2.5 p-0">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/tools/${o.slug}`} className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                    {o.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="print-hide">
          <TryBand
            title="This sheet, filled in for you"
            body="Fold produces the return, the attendance and the count from records your team keeps as they go. Thirty days free, no card."
          />
        </div>
      </main>
      <div className="print-hide">
        <SiteFooter />
      </div>
    </div>
  );
}
