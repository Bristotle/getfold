import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import { POSTS, getPost, sortedPosts, AUTHORS } from "@/lib/posts";
import { metaTitle, metaDescription } from "@/lib/seo";
import { RichText, plainText } from "@/components/marketing/rich-text";

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
    title: metaTitle(post.title),
    description: metaDescription(post.excerpt),
    openGraph: {
      // Next replaces the parent openGraph rather than merging it, so the
      // default share image has to be restated here or it is lost.
      images: ["/og-default.png"],
      title: post.title,
      description: metaDescription(post.excerpt, 200),
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
  const faq = post.body.find((b) => b.type === "faq");
  const author = AUTHORS[post.author ?? "founder"];

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
            dateModified: post.updated ?? post.published,
            articleSection: post.category,
            inLanguage: "en-GH",
            mainEntityOfPage: `https://www.getfold.org/blog/${post.slug}`,
            image: "https://www.getfold.org/og-default.png",
            abstract: post.answer,
            author: {
              "@type": "Person",
              name: author.name,
              jobTitle: author.role,
              url: `https://www.getfold.org${author.url}`,
              worksFor: { "@type": "Organization", name: "Fold", url: "https://www.getfold.org" },
            },
            publisher: {
              "@type": "Organization",
              name: "Fold",
              logo: { "@type": "ImageObject", url: "https://www.getfold.org/brand/fold-icon@512.png" },
            },
          }),
        }}
      />

      {/*
        FAQPage from the post's own faq block, when it has one. Same array
        renders the visible questions below, so they cannot disagree.
      */}
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faq.items.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
              })),
            }),
          }}
        />
      )}

      {/* Breadcrumbs, so a result can show Blog > Post rather than a bare URL. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getfold.org/" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.getfold.org/blog" },
              { "@type": "ListItem", position: 3, name: post.title },
            ],
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
            <p className="mt-4 text-sm text-muted-foreground">
              By{" "}
              <Link href={author.url} className="font-semibold text-foreground hover:underline">
                {author.name}
              </Link>
              , {author.role}
            </p>
          </header>

          {/*
            The post opens by answering its own question, in the writer's
            voice rather than in a labelled box. It is the paragraph a
            search engine or an assistant quotes, and also given to them as
            the article's abstract above.
          */}
          <p className="mt-8 text-lg leading-relaxed text-foreground">
            <RichText text={post.answer} />
          </p>

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
                          <RichText text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.type === "h3") {
                return (
                  <h3
                    key={i}
                    className="mt-2 text-balance text-lg font-bold text-foreground"
                  >
                    {block.text}
                  </h3>
                );
              }
              if (block.type === "steps") {
                return (
                  <ol key={i} className="m-0 flex list-none flex-col gap-3 p-0">
                    {block.items.map((item, n) => (
                      <li key={item} className="flex gap-3.5">
                        <span
                          aria-hidden="true"
                          className="font-numeric mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                        >
                          {n + 1}
                        </span>
                        <span className="text-[17px] leading-relaxed text-foreground/85">
                          <RichText text={item} />
                        </span>
                      </li>
                    ))}
                  </ol>
                );
              }
              if (block.type === "faq") {
                return (
                  <section key={i} className="mt-6 border-t border-border pt-8">
                    <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      Questions people ask
                    </h2>
                    <dl className="m-0 mt-6 flex flex-col gap-6">
                      {block.items.map((f) => (
                        <div key={f.q}>
                          <dt className="text-base font-bold text-foreground">{f.q}</dt>
                          <dd className="m-0 mt-1.5 text-[16px] leading-relaxed text-muted-foreground">
                            <RichText text={f.a} />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                );
              }
              if (block.type === "sources") {
                return (
                  <section key={i} className="mt-4 border-t border-border pt-6">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      Sources
                    </h2>
                    <ol className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0">
                      {block.items.map((src, n) => (
                        <li key={src.url} className="flex gap-2 text-sm">
                          <span className="font-numeric shrink-0 text-muted-foreground">{n + 1}.</span>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            {src.label}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </section>
                );
              }
              if (block.type === "quote") {
                return (
                  <figure key={i} className="m-0 border-l-2 border-primary bg-surface py-4 pl-5 pr-4">
                    <blockquote className="m-0 text-[17px] font-medium leading-relaxed text-foreground">
                      {block.text}
                    </blockquote>
                    {block.by && (
                      <figcaption className="mt-2 text-sm text-muted-foreground">
                        {block.by}
                        {block.role && `, ${block.role}`}
                      </figcaption>
                    )}
                  </figure>
                );
              }
              if (block.type === "table") {
                return (
                  <figure key={i} className="m-0 min-w-0">
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full min-w-[28rem] text-left text-sm">
                        <caption className="border-b border-border bg-surface px-4 py-3 text-left text-sm font-bold text-foreground">
                          {block.caption}
                        </caption>
                        <thead className="bg-surface-soft text-xs uppercase tracking-wide text-muted-foreground">
                          <tr>
                            {block.head.map((h) => (
                              <th key={h} scope="col" className="px-4 py-2.5 font-semibold">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows.map((row, r) => (
                            <tr key={r} className="border-t border-border">
                              {row.map((cell, c) =>
                                c === 0 ? (
                                  <th key={c} scope="row" className="px-4 py-2.5 font-medium text-foreground">
                                    <RichText text={cell} />
                                  </th>
                                ) : (
                                  <td key={c} className="px-4 py-2.5 text-foreground/85">
                                    <RichText text={cell} />
                                  </td>
                                )
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {block.note && (
                      <figcaption className="mt-2 text-xs text-muted-foreground">
                        <RichText text={block.note} />
                      </figcaption>
                    )}
                  </figure>
                );
              }
              if (block.type === "image") {
                return (
                  <figure key={i} className="m-0 min-w-0">
                    <Image
                      src={block.src}
                      alt={block.alt}
                      width={block.width}
                      height={block.height}
                      sizes="(max-width: 672px) 100vw, 672px"
                      className="h-auto w-full rounded-xl border border-border"
                    />
                    <figcaption className="mt-2 text-xs text-muted-foreground">
                      {block.caption}
                    </figcaption>
                  </figure>
                );
              }
              if (block.type === "chart") {
                const max = Math.max(...block.rows.map((r) => r.value), 1);
                return (
                  <figure key={i} className="m-0 min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
                    <figcaption className="text-sm font-bold text-foreground">{block.title}</figcaption>
                    {/* A real table underneath, so a screen reader and a
                        crawler get the numbers, not a picture of them. */}
                    <table className="mt-4 w-full text-sm">
                      <tbody>
                        {block.rows.map((r) => (
                          <tr key={r.label}>
                            <th scope="row" className="w-2/5 py-1.5 pr-3 text-left align-middle font-normal text-foreground/85">
                              {r.label}
                            </th>
                            <td className="py-1.5 align-middle">
                              <span className="flex min-w-0 items-center gap-2">
                                <span
                                  aria-hidden="true"
                                  className="h-3 shrink-0 rounded-sm bg-primary"
                                  style={{ width: `${Math.max(2, (r.value / max) * 100) * 0.7}%` }}
                                />
                                <span className="font-numeric text-foreground">
                                  {r.value.toLocaleString("en-GB")}
                                  {block.unit}
                                </span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {block.source && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Source: <RichText text={block.source} />
                      </p>
                    )}
                  </figure>
                );
              }
              return (
                <p
                  key={i}
                  className="text-[17px] leading-relaxed text-foreground/85"
                >
                  <RichText text={(block as { text: string }).text} />
                </p>
              );
            })}
          </div>

          {/* Every post belongs to the pillar, and says so. */}
          <p className="mt-10 rounded-xl border border-border bg-surface p-4 text-sm text-muted-foreground">
            Part of{" "}
            <Link href="/guide" className="font-semibold text-primary hover:underline">
              Running a church in Ghana: the complete guide
            </Link>
            , which covers the register, attendance, giving, the statistical
            return and more, each with free templates.
          </p>

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
