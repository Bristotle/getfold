import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { CATEGORIES, getCategory, getArticle } from "@/lib/help";

export function generateStaticParams() {
  return CATEGORIES.flatMap((c) =>
    c.articles.map((a) => ({ category: c.slug, slug: a.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const a = getArticle(category, slug);
  if (!a) return { title: "Not found, Fold" };
  return { title: `${a.title}, Fold help centre`, description: a.summary };
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const c = getCategory(category);
  const a = getArticle(category, slug);
  if (!c || !a) notFound();

  const more = c.articles.filter((x) => x.slug !== a.slug).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/*
        HowTo structured data where the article is a set of steps, so an
        assistant asked "how do I import my church register" has something
        it can quote rather than prose it has to reconstruct.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.summary,
            articleSection: c.title,
            author: { "@type": "Organization", name: "Fold" },
            publisher: { "@type": "Organization", name: "Fold" },
          }),
        }}
      />

      <main id="main">
        <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
            <Link
              href="/help"
              className="inline-flex items-center gap-1.5 rounded font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
              Help centre
            </Link>
            <span aria-hidden="true" className="text-muted-foreground">
              /
            </span>
            <Link
              href={`/help/${c.slug}`}
              className="rounded font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {c.title}
            </Link>
          </nav>

          <header className="mt-6 border-b border-border pb-8">
            <h1 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {a.title}
            </h1>
            <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
              {a.summary}
            </p>
          </header>

          <div className="mt-8 flex flex-col gap-5">
            {a.body.map((block, i) => {
              if (block.type === "h2") {
                return (
                  <h2
                    key={i}
                    className="mt-4 text-balance text-xl font-bold tracking-tight text-foreground"
                  >
                    {block.text}
                  </h2>
                );
              }

              if (block.type === "steps") {
                return (
                  <ol key={i} className="m-0 flex list-none flex-col gap-4 p-0">
                    {block.items.map((item, n) => (
                      <li key={item} className="flex gap-4">
                        <span
                          aria-hidden="true"
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 font-numeric text-xs font-bold text-primary"
                        >
                          {n + 1}
                        </span>
                        <span className="pt-0.5 text-[16px] leading-relaxed text-foreground/85">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ol>
                );
              }

              if (block.type === "list") {
                return (
                  <ul key={i} className="m-0 flex list-none flex-col gap-3 p-0">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        />
                        <span className="text-[16px] leading-relaxed text-foreground/85">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              }

              if (block.type === "note") {
                return (
                  <div
                    key={i}
                    className="flex gap-3.5 rounded-xl border border-primary/25 bg-primary-soft p-5"
                  >
                    <span aria-hidden="true" className="mt-0.5 shrink-0 text-primary">
                      <Info size={18} strokeWidth={2} />
                    </span>
                    <p className="text-[15px] leading-relaxed text-foreground/85">
                      {block.text}
                    </p>
                  </div>
                );
              }

              return (
                <p
                  key={i}
                  className="text-[16px] leading-relaxed text-foreground/85"
                >
                  {block.text}
                </p>
              );
            })}
          </div>

          {/* ---------- did this help ---------- */}
          <div className="mt-12 rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-base font-bold text-foreground">
              Did this answer your question?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              If not, tell us what you were trying to do. A real person replies
              within a day, and we write the missing article so the next church
              finds it.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Ask us a question
              </Link>
              <Link
                href={`/help/${c.slug}`}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                More on {c.title.toLowerCase()}
              </Link>
            </div>
          </div>
        </article>

        {/* ---------- read next ---------- */}
        {more.length > 0 && (
          <section className="relative isolate overflow-hidden border-t border-border bg-surface">
            <SectionBg variant="dots" />
            <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Also in {c.title.toLowerCase()}
              </h2>
              <ul className="m-0 mt-5 flex list-none flex-col p-0">
                {more.map((x) => (
                  <li key={x.slug} className="border-b border-border last:border-0">
                    <Link
                      href={`/help/${c.slug}/${x.slug}`}
                      className="group flex min-h-14 items-center justify-between gap-4 rounded py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <span className="text-[15px] font-medium text-foreground group-hover:text-primary">
                        {x.title}
                      </span>
                      <ArrowRight
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                        className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
