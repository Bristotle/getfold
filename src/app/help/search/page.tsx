import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { HelpSearch } from "@/components/marketing/help-search";
import { Button } from "@/components/ui/button";
import { searchArticles } from "@/lib/help";

/**
 * Search results, on a route of their own.
 *
 * The help index used to read ?q= and render results in place, which made
 * the whole index dynamic and uncacheable. Search needs the server, because
 * it works with no JavaScript, and that is worth keeping. So the server
 * rendered part lives here and the index becomes static HTML.
 *
 * Not indexed: a results page for an arbitrary query is not a page a
 * search engine should hold on to.
 */
export const metadata: Metadata = {
  title: "Search the help centre, Fold",
  robots: { index: false, follow: true },
};

export default async function HelpSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = searchArticles(query);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
            <h1 className="text-balance font-serif text-3xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-4xl">
              Search the help centre
            </h1>
            <div className="mt-6">
              <HelpSearch defaultValue={query} />
            </div>
          </div>
        </section>

        {/* ---------- search results ---------- */}
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
      </main>

      <SiteFooter />
    </div>
  );
}
