import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { HelpIcon } from "@/components/marketing/help-icon";
import { HelpSearch } from "@/components/marketing/help-search";
import { CATEGORIES, getCategory } from "@/lib/help";

/*
  Only the slugs in generateStaticParams exist. Without this, dynamicParams
  defaults to true and ANY url matching this pattern is rendered on demand
  and written to the ISR cache, so a scanner probing random paths runs up
  unbounded ISR writes for pages that only ever 404. With it, an unknown
  slug is refused from the static shell: no render, no cache write.
*/
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) return { title: "Not found, Fold" };
  return {
    title: `${c.title}, Fold help centre`,
    description: c.description,
  };
}

export default async function HelpCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();

  const others = CATEGORIES.filter((x) => x.slug !== c.slug);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            <Link
              href="/help"
              className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
              Help centre
            </Link>

            <div className="mt-6 flex items-start gap-4">
              <span
                aria-hidden="true"
                className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
              >
                <HelpIcon name={c.icon} size={26} />
              </span>
              <div className="min-w-0">
                <h1 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                  {c.title}
                </h1>
                <p className="mt-2 text-[16px] leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <HelpSearch />
            </div>
          </div>
        </section>

        {/* ---------- articles ---------- */}
        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {c.articles.length}{" "}
              {c.articles.length === 1 ? "article" : "articles"}
            </h2>
            <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
              {c.articles.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/help/${c.slug}/${a.slug}`}
                    className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span className="min-w-0">
                      <span className="block text-balance text-base font-bold text-foreground group-hover:text-primary">
                        {a.title}
                      </span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                        {a.summary}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- other categories ---------- */}
        <section className="relative isolate overflow-hidden border-t border-border">
          <SectionBg variant="orbs" />
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Other categories
            </h2>
            <ul className="m-0 mt-5 flex list-none flex-wrap gap-2.5 p-0">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/help/${o.slug}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span aria-hidden="true" className="text-primary">
                      <HelpIcon name={o.icon} size={16} />
                    </span>
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
