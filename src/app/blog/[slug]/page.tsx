import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import { SectionBg } from "@/components/marketing/section-bg";
import { POSTS, getPost, sortedPosts } from "@/lib/posts";

/*
  Only the slugs in generateStaticParams exist. Without this, dynamicParams
  defaults to true and ANY url matching this pattern is rendered on demand
  and written to the ISR cache, so a scanner probing random paths runs up
  unbounded ISR writes for pages that only ever 404. With it, an unknown
  slug is refused from the static shell: no render, no cache write.
*/
export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found, Fold" };
  return {
    title: `${post.title}, Fold`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Two others to read next, never this one.
  const more = sortedPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/*
        Article structured data, so the piece can be quoted by a search
        engine or an assistant rather than only crawled.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.published,
            articleSection: post.category,
            author: { "@type": "Organization", name: "Fold" },
            publisher: { "@type": "Organization", name: "Fold" },
          }),
        }}
      />

      <main id="main">
        <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
            All posts
          </Link>

          <header className="mt-6 border-b border-border pb-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {post.category}
              </span>
              <time
                dateTime={post.published}
                className="font-numeric text-xs text-muted-foreground"
              >
                {post.date}
              </time>
            </div>
            <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          </header>

          <div className="mt-8 flex flex-col gap-5">
            {post.body.map((block, i) => {
              if (block.type === "h2") {
                return (
                  <h2
                    key={i}
                    className="mt-4 text-balance text-xl font-bold tracking-tight text-foreground sm:text-2xl"
                  >
                    {block.text}
                  </h2>
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
                        <span className="text-[17px] leading-relaxed text-foreground/85">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="m-0 border-l-2 border-primary bg-surface py-4 pl-5 pr-4 text-[17px] font-medium leading-relaxed text-foreground"
                  >
                    {block.text}
                  </blockquote>
                );
              }
              return (
                <p
                  key={i}
                  className="text-[17px] leading-relaxed text-foreground/85"
                >
                  {block.text}
                </p>
              );
            })}
          </div>

          {/* ---------- close ---------- */}
          <div className="mt-12 rounded-2xl border border-primary/25 bg-primary-soft p-6 sm:p-8">
            <h2 className="text-balance text-xl font-bold tracking-tight text-foreground">
              Fold does this for you
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Register, attendance, giving and the statistical return in one
              place, built for how churches in Ghana actually work. Thirty days
              free, no card, no commitment.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg">Start your free trial</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  Ask us a question
                </Button>
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
                Read next
              </h2>
              <ul className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
                {more.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/blog/${p.slug}`}
                      className="group block rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <span className="text-xs font-semibold text-primary">
                        {p.category}
                      </span>
                      <h3 className="mt-1.5 text-balance text-base font-bold leading-snug text-foreground group-hover:text-primary">
                        {p.title}
                      </h3>
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
