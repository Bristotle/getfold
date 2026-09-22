import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg, CtaBand } from "@/components/marketing/section-bg";
import { Shot } from "@/components/marketing/product-shots";
import { MODULES, moduleBySlug, ACCENT } from "@/lib/modules";
import { getPost } from "@/lib/posts";

/*
  Only the slugs in generateStaticParams exist. Without this, dynamicParams
  defaults to true and any url matching this pattern is rendered on demand
  and written to the ISR cache, so a scanner probing random paths runs up
  unbounded ISR writes for pages that only ever 404.
*/
export const dynamicParams = false;

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = moduleBySlug(slug);
  if (!m) return { title: "Not found, Fold" };
  return {
    title: `${m.title} for churches in Ghana, Fold`,
    description: m.summary,
    keywords: m.keywords,
    alternates: { canonical: `/features/${m.slug}` },
    openGraph: {
      // Next replaces the parent openGraph rather than merging it, so the
      // default share image has to be restated here or it is lost.
      images: ["/og-default.png"],
      title: `${m.title}, Fold`,
      description: m.summary,
    },
  };
}

/**
 * One area of the product.
 *
 * The FAQ structured data is generated from the same constant the page
 * renders, so the two cannot drift apart. That is the rule for every FAQ on
 * this site: a marked up question that no longer matches the visible answer
 * is worse than no markup at all.
 */
export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = moduleBySlug(slug);
  if (!m) notFound();
  const a = ACCENT[m.accent];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: m.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main id="main">
        {/* ---------- hero ---------- */}
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          {/* The page's colour, as a rule along the top. */}
          <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 ${a.rule}`} />
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
              All features
            </Link>

            <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {m.title}
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              {m.summary}
            </p>
            <p className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 font-numeric text-xs font-semibold uppercase tracking-wide ${a.soft} ${a.text}`}>
              In the app: {m.where}
            </p>
          </div>
        </section>

        {/* ---------- the page itself ---------- */}
        {m.shot && (
          <section className="border-b border-border bg-surface">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
              <Shot id={m.shot} />
            </div>
          </section>
        )}

        {/* ---------- the argument ---------- */}
        <section className="relative isolate overflow-hidden">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            {m.intro.map((p) => (
              <p
                key={p}
                className="mt-4 text-[17px] leading-relaxed text-foreground/85 first:mt-0"
              >
                {p}
              </p>
            ))}

            <h2 className="mt-12 text-balance text-xl font-bold text-foreground">
              What it does
            </h2>
            <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
              {m.does.map((d) => (
                <li key={d} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[0.75em] h-px w-3.5 shrink-0 bg-primary" />
                  <span className="text-[16px] leading-relaxed text-foreground/85">
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- what is different ---------- */}
        <section className="relative isolate overflow-hidden border-y border-border bg-surface">
          <SectionBg variant="grid" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground">
              What is different about ours
            </h2>
            <div className="mt-8 flex flex-col gap-8">
              {m.different.map((d) => (
                <div key={d.title} className="border-t border-border pt-5">
                  <h3 className="text-base font-bold text-foreground">
                    {d.title}
                  </h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
                    {d.body}
                  </p>
                </div>
              ))}
            </div>

            {/*
              Said plainly rather than left out. A church that signs up
              expecting something and finds it missing costs more than the
              signup was worth.
            */}
            {m.notYet && (
              <div className="mt-10 flex gap-3.5 rounded-xl border border-border bg-background p-5">
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-muted-foreground"
                >
                  <Info size={18} strokeWidth={2} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    What we have not built
                  </h3>
                  {m.notYet.map((n) => (
                    <p
                      key={n}
                      className="mt-2 text-[15px] leading-relaxed text-muted-foreground"
                    >
                      {n}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ---------- questions ---------- */}
        <section className="relative isolate overflow-hidden">
          <SectionBg variant="orbs" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground">
              Questions churches ask
            </h2>
            <dl className="m-0 mt-8 flex flex-col gap-7">
              {m.faqs.map((f) => (
                <div key={f.q} className="border-t border-border pt-5">
                  <dt className="text-base font-bold text-foreground">{f.q}</dt>
                  <dd className="m-0 mt-2 text-[16px] leading-relaxed text-muted-foreground">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>

            {/*
              The posts on this subject. A feature page that argues for a
              way of working and a post that explains that way of working
              should point at each other, or a search engine sees two pages
              that happen to share words.
            */}
            {m.reading && m.reading.length > 0 && (
              <div className="mt-12 border-t border-border pt-6">
                <h2 className="text-sm font-bold text-foreground">Further reading</h2>
                <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
                  {m.reading.map((slug) => {
                    const post = getPost(slug);
                    if (!post) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={`/blog/${slug}`}
                          className="rounded text-[15px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          {post.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Sideways links, so a reader lands somewhere useful next. */}
            <div className="mt-12 border-t border-border pt-6">
              <h2 className="text-sm font-bold text-foreground">
                The rest of Fold
              </h2>
              <ul className="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
                {MODULES.filter((o) => o.slug !== m.slug).map((o) => (
                  <li key={o.slug}>
                    <Link
                      href={`/features/${o.slug}`}
                      className="rounded text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {o.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <CtaBand>
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-16">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              See it with your own register
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-primary-foreground/85">
              Thirty days free, no card, and nothing to cancel. Bring the
              register you already keep and we will help you move it across.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary-foreground px-6 text-base font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Start your free trial
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primary-foreground/40 px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Ask us a question
              </Link>
            </div>
          </div>
        </CtaBand>
      </main>

      <SiteFooter />
    </div>
  );
}
