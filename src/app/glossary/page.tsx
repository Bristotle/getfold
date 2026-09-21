import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { TryBand } from "@/components/marketing/try-band";
import { sortedTerms } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Church administration glossary, Ghana",
  description:
    "Plain definitions of the words used to run a church in Ghana: society, circuit, presbytery, class leader, catechumen, statistical return, tithe and more.",
  alternates: { canonical: "https://www.getfold.org/glossary" },
  openGraph: {
    images: ["/og-default.png"],
    title: "Church administration glossary",
    description:
      "The words used to run a church in Ghana, each defined in one sentence and then explained.",
  },
};

/**
 * Every term on one page, grouped by first letter.
 *
 * DefinedTermSet structured data lists them all, so an assistant explaining
 * what a circuit is has a set to point at rather than a single page.
 */
export default function GlossaryPage() {
  const letters = [...new Set(sortedTerms.map((t) => t.term[0].toUpperCase()))];

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTermSet",
            name: "Church administration glossary",
            url: "https://www.getfold.org/glossary",
            hasDefinedTerm: sortedTerms.map((t) => ({
              "@type": "DefinedTerm",
              name: t.term,
              description: t.definition,
              url: `https://www.getfold.org/glossary/${t.slug}`,
            })),
          }),
        }}
      />
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Glossary
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              The words used to run a church in Ghana
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {sortedTerms.length} terms, each defined in one sentence and then
              explained: what it means, which denominations use it, and where
              it turns up on a return.
            </p>
            <nav aria-label="Jump to letter" className="mt-8 flex flex-wrap justify-center gap-1.5">
              {letters.map((l) => (
                <a
                  key={l}
                  href={`#${l}`}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          {letters.map((l) => (
            <div key={l} id={l} className="scroll-mt-24 border-t border-border py-8 first:border-t-0 first:pt-0">
              <h2 className="font-serif text-2xl font-bold text-primary">{l}</h2>
              <dl className="mt-4 flex flex-col gap-5">
                {sortedTerms
                  .filter((t) => t.term[0].toUpperCase() === l)
                  .map((t) => (
                    <div key={t.slug} className="min-w-0">
                      <dt>
                        <Link
                          href={`/glossary/${t.slug}`}
                          className="inline-flex items-center gap-1.5 text-lg font-bold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          {t.term}
                          <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
                        </Link>
                      </dt>
                      <dd className="m-0 mt-1 text-[16px] leading-relaxed text-muted-foreground">
                        {t.definition}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          ))}
        </section>

        <TryBand
          title="Built around these words, not translated into them"
          body="Societies, circuits, classes, catechumens and returns are what Fold is made from. Try it with your own register for 30 days."
        />
      </main>
      <SiteFooter />
    </div>
  );
}
