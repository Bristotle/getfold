import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { HelpIcon } from "@/components/marketing/help-icon";
import { HelpSearch } from "@/components/marketing/help-search";
import { Button } from "@/components/ui/button";
import { CATEGORIES, ALL_ARTICLES, searchArticles } from "@/lib/help";

export const metadata: Metadata = {
  title: "Help centre, answers for churches using Fold",
  description:
    "Answers on importing your register, recording attendance and giving, producing your statistical return, and managing who on your team can see what.",
};

/**
 * The five people ask for most, by our own reckoning of what a church hits
 * in its first fortnight. Kept as a hand picked list rather than a view
 * count, because a view count on a young help centre mostly measures which
 * article we happened to link first.
 */
const POPULAR = [
  ["members", "import-from-excel"],
  ["getting-started", "create-your-church"],
  ["reports", "statistical-return"],
  ["team", "what-each-role-can-do"],
  ["attendance", "record-a-service"],
] as const;

export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? searchArticles(query) : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        {/* ---------- hero and search ---------- */}
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
              Help centre
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              How can we help?
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              {ALL_ARTICLES.length} answers on running your church in Fold. If
              none of them fits, a real person replies within a day.
            </p>

            <div className="mt-8">
              <HelpSearch defaultValue={query} />
            </div>
          </div>
        </section>

        {/* ---------- search results ---------- */}
        {results !== null ? (
          <section className="relative isolate overflow-hidden bg-surface">
            <SectionBg variant="dots" />
            <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
              <h2 className="text-xl font-bold text-foreground">
                {results.length === 0
                  ? `Nothing matched "${query}"`
                  : `${results.length} ${
                      results.length === 1 ? "answer" : "answers"
                    } for "${query}"`}
              </h2>

              {results.length === 0 ? (
                <div className="mt-5 rounded-xl border border-border bg-background p-6">
                  <p className="text-[15px] leading-relaxed text-muted-foreground">
                    Try fewer words, or a word your church would use rather
                    than ours. Failing that, ask us directly and we will
                    answer, then write the article so the next church finds it.
                  </p>
                  <div className="mt-5">
                    <Link href="/contact">
                      <Button>Ask us your question</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="m-0 mt-6 flex list-none flex-col gap-3 p-0">
                  {results.map((a) => (
                    <li key={`${a.category.slug}/${a.slug}`}>
                      <Link
                        href={`/help/${a.category.slug}/${a.slug}`}
                        className="group block rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {a.category.title}
                        </span>
                        <h3 className="mt-1.5 text-balance text-base font-bold text-foreground group-hover:text-primary">
                          {a.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {a.summary}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-8 text-sm text-muted-foreground">
                <Link
                  href="/help"
                  className="rounded font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Back to all categories
                </Link>
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* ---------- categories ---------- */}
            <section className="relative isolate overflow-hidden bg-surface">
              <SectionBg variant="grid" />
              <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
                <h2 className="sr-only">Categories</h2>
                <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {CATEGORIES.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/help/${c.slug}`}
                        className="group flex h-full flex-col rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <span
                          aria-hidden="true"
                          className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"
                        >
                          <HelpIcon name={c.icon} />
                        </span>
                        <h3 className="mt-5 text-balance text-base font-bold text-foreground group-hover:text-primary">
                          {c.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {c.description}
                        </p>
                        <span className="mt-4 font-numeric text-xs text-muted-foreground">
                          {c.articles.length}{" "}
                          {c.articles.length === 1 ? "article" : "articles"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ---------- popular ---------- */}
            <section className="relative isolate overflow-hidden border-y border-border">
              <SectionBg variant="dots" />
              <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Asked most often
                </h2>
                <ul className="m-0 mt-5 flex list-none flex-col p-0">
                  {POPULAR.map(([cat, slug]) => {
                    const a = ALL_ARTICLES.find(
                      (x) => x.category.slug === cat && x.slug === slug
                    );
                    if (!a) return null;
                    return (
                      <li key={`${cat}/${slug}`} className="border-b border-border last:border-0">
                        <Link
                          href={`/help/${cat}/${slug}`}
                          className="group flex min-h-14 items-center justify-between gap-4 rounded py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <span className="text-[15px] font-medium text-foreground group-hover:text-primary">
                            {a.title}
                          </span>
                          <ArrowRight
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                            className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          </>
        )}

        {/* ---------- still stuck ---------- */}
        <section className="relative isolate overflow-hidden bg-primary text-primary-foreground">
          <SectionBg variant="mesh" />
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <span
              aria-hidden="true"
              className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-foreground/15"
            >
              <MessageSquare size={22} strokeWidth={1.8} />
            </span>
            <h2 className="mt-5 text-balance font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Still stuck?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-primary-foreground/85">
              A real person reads every message and replies within a day. Tell
              us what you were trying to do and we will walk you through it.
            </p>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary-foreground px-6 text-base font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Ask us a question
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
