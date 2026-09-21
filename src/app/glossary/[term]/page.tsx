import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { TryBand } from "@/components/marketing/try-band";
import { TERMS, getTerm } from "@/lib/glossary";
import { metaTitle, metaDescription } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return TERMS.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term } = await params;
  const t = getTerm(term);
  if (!t) return { title: "Not found, Fold" };
  const title = `What is a ${t.term.toLowerCase()}?`;
  return {
    title: metaTitle(title, "Church glossary"),
    description: metaDescription(t.definition),
    alternates: { canonical: `https://www.getfold.org/glossary/${t.slug}` },
    openGraph: {
      images: ["/og-default.png"],
      title,
      description: metaDescription(t.definition),
    },
  };
}

/**
 * One term. The definition is the first thing on the page and the first
 * thing in the structured data, because a definition page is judged on
 * its first sentence and nothing else.
 */
export default async function TermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term } = await params;
  const t = getTerm(term);
  if (!t) notFound();

  const related = t.related.map(getTerm).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const question = `What is a ${t.term.toLowerCase()}?`;

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "DefinedTerm",
              name: t.term,
              description: t.definition,
              url: `https://www.getfold.org/glossary/${t.slug}`,
              inDefinedTermSet: "https://www.getfold.org/glossary",
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: question,
                  acceptedAnswer: { "@type": "Answer", text: `${t.definition} ${t.detail[0]}` },
                },
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getfold.org/" },
                { "@type": "ListItem", position: 2, name: "Glossary", item: "https://www.getfold.org/glossary" },
                { "@type": "ListItem", position: 3, name: t.term },
              ],
            },
          ]),
        }}
      />
      <SiteHeader />
      <main id="main">
        <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-sm">
            <Link
              href="/glossary"
              className="inline-flex items-center gap-1.5 rounded font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
              Glossary
            </Link>
          </nav>

          <header className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {question}
            </p>
            <h1 className="mt-2 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {t.term}
            </h1>
            <p className="mt-5 border-l-4 border-primary pl-4 text-[19px] leading-relaxed text-foreground">
              {t.definition}
            </p>
          </header>

          <div className="mt-8 flex flex-col gap-5 text-[17px] leading-relaxed text-foreground/85">
            {t.detail.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {t.usedBy && (
              <p className="rounded-lg bg-surface-soft px-4 py-3 text-[15px] text-muted-foreground">
                <strong className="font-semibold text-foreground">Used by:</strong> {t.usedBy}
              </p>
            )}
          </div>

          {t.see.length > 0 && (
            <section className="mt-10 border-t border-border pt-8">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Where this turns up
              </h2>
              <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
                {t.see.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href as "/"}
                      className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {s.label}
                      <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-8 border-t border-border pt-8">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Related terms
              </h2>
              <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/glossary/${r.slug}`}
                      className="inline-flex min-h-9 items-center rounded-full border border-border bg-surface px-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {r.term}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <TryBand
          title={`Software that already knows what a ${t.term.toLowerCase()} is`}
          body="Fold is built around the structure and vocabulary of Ghanaian churches. Thirty days free with your own register."
        />
      </main>
      <SiteFooter />
    </div>
  );
}
