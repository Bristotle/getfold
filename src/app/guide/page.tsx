import type { Metadata, Route } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { TryBand } from "@/components/marketing/try-band";
import { GUIDE, GUIDE_ANSWER } from "@/lib/guide";
import { POSTS, AUTHORS } from "@/lib/posts";
import { CATEGORIES } from "@/lib/help";
import { MODULES } from "@/lib/modules";
import { TOOLS } from "@/lib/tools";
import { INTEGRATIONS } from "@/lib/integrations";
import { COMPARISONS } from "@/lib/compare";
import { TERMS } from "@/lib/glossary";
import { DENOMINATIONS } from "@/lib/denominations";
import { ROLES } from "@/lib/roles";

const URL_ = "https://www.getfold.org/guide";

export const metadata: Metadata = {
  title: "Running a church in Ghana: the complete guide",
  description:
    "The register, attendance, tithes and mobile money, the statistical return, branches and messages: every part of church administration in Ghana, with guides, free templates and plain definitions.",
  alternates: { canonical: URL_ },
  openGraph: {
    images: ["/og-default.png"],
    title: "Running a church in Ghana: the complete guide",
    description:
      "Every part of church administration in Ghana in one place, each answered first and then linked to the detail.",
  },
};

type Link_ = { href: string; label: string; note?: string; kind: string };

/** Resolves a topic's slugs to the pages that exist today. */
function linksFor(t: (typeof GUIDE)[number]): Link_[] {
  const out: Link_[] = [];
  for (const s of t.posts ?? []) {
    const p = POSTS.find((x) => x.slug === s);
    if (p) out.push({ href: `/blog/${p.slug}`, label: p.title, note: p.excerpt, kind: "Guide" });
  }
  for (const s of t.help ?? []) {
    const c = CATEGORIES.find((x) => x.slug === s);
    if (c) out.push({ href: `/help/${c.slug}`, label: `Help: ${c.title}`, note: c.description, kind: "Help" });
  }
  for (const s of t.features ?? []) {
    const m = MODULES.find((x) => x.slug === s);
    if (m) out.push({ href: `/features/${m.slug}`, label: m.title, note: m.summary, kind: "In Fold" });
  }
  for (const s of t.tools ?? []) {
    const x = TOOLS.find((y) => y.slug === s);
    if (x) out.push({ href: `/tools/${x.slug}`, label: x.title, note: x.description, kind: "Free tool" });
  }
  for (const s of t.integrations ?? []) {
    const x = INTEGRATIONS.find((y) => y.slug === s);
    if (x) out.push({ href: `/works-with/${x.slug}`, label: x.title, note: x.description, kind: "Works with" });
  }
  for (const s of t.compare ?? []) {
    const x = COMPARISONS.find((y) => y.slug === s);
    if (x) out.push({ href: `/compare/${x.slug}`, label: x.title, note: x.description, kind: "Comparison" });
  }
  for (const p of t.pages ?? []) out.push({ ...p, kind: "Page" });
  return out;
}

const termsFor = (t: (typeof GUIDE)[number]) =>
  (t.terms ?? []).map((s) => TERMS.find((x) => x.slug === s)).filter((x) => x !== undefined);

/**
 * The pillar: every part of church administration on one page, each part
 * answered first and then linked to the articles, help, tools and terms
 * that go deeper. See src/lib/guide.ts.
 */
export default function GuidePage() {
  const author = AUTHORS.founder;

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Running a church in Ghana: the complete guide",
            description: GUIDE_ANSWER,
            abstract: GUIDE_ANSWER,
            inLanguage: "en-GH",
            mainEntityOfPage: URL_,
            dateModified: "2026-10-21",
            author: { "@type": "Person", name: author.name, jobTitle: author.role },
            publisher: {
              "@type": "Organization",
              name: "Fold",
              logo: { "@type": "ImageObject", url: "https://www.getfold.org/brand/fold-icon@512.png" },
            },
            hasPart: GUIDE.map((t) => ({
              "@type": "WebPageElement",
              name: t.title,
              url: `${URL_}#${t.id}`,
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: GUIDE.map((t) => ({
              "@type": "Question",
              name: t.question,
              acceptedAnswer: { "@type": "Answer", text: t.answer },
            })),
          }),
        }}
      />
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              The complete guide
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Running a church in Ghana
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              By{" "}
              <Link href={author.url} className="font-semibold text-foreground hover:underline">
                {author.name}
              </Link>
              , {author.role}. Updated 21 October 2026.
            </p>
            <div className="mt-6 rounded-xl border border-primary/25 bg-primary-soft p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">In short</p>
              <p className="mt-2 text-[17px] leading-relaxed text-foreground">{GUIDE_ANSWER}</p>
            </div>
            <nav aria-label="Contents" className="mt-8">
              <ol className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
                {GUIDE.map((t, n) => (
                  <li key={t.id} className="min-w-0">
                    <a href={`#${t.id}`} className="flex gap-2 text-sm text-foreground hover:text-primary">
                      <span className="font-numeric text-muted-foreground">{n + 1}.</span>
                      {t.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          {GUIDE.map((t, n) => {
            const links = linksFor(t);
            const terms = termsFor(t);
            return (
              <section key={t.id} id={t.id} className="scroll-mt-24 border-b border-border py-10 first:pt-0 last:border-0">
                <p className="font-numeric text-xs font-semibold text-primary">{n + 1}</p>
                <h2 className="mt-1 text-balance text-2xl font-bold tracking-tight text-foreground">
                  {t.title}
                </h2>
                <h3 className="mt-4 text-base font-bold text-foreground">{t.question}</h3>
                <p className="mt-2 text-[17px] leading-relaxed text-foreground/85">{t.answer}</p>

                {links.length > 0 && (
                  <ul className="m-0 mt-6 flex list-none flex-col gap-3 p-0">
                    {links.map((l) => (
                      <li key={l.href} className="min-w-0 rounded-lg border border-border bg-surface p-4">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {l.kind}
                        </span>
                        <Link href={l.href as Route} className="mt-1 block font-semibold text-foreground hover:text-primary hover:underline">
                          {l.label}
                        </Link>
                        {l.note && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.note}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {terms.length > 0 && (
                  <p className="mt-5 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Words to know: </span>
                    {terms.map((x, i) => (
                      <span key={x.slug}>
                        {i > 0 && ", "}
                        <Link href={`/glossary/${x.slug}`} className="text-primary hover:underline">
                          {x.term}
                        </Link>
                      </span>
                    ))}
                    .
                  </p>
                )}

                {t.id === "structure" && (
                  <p className="mt-5 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">By denomination: </span>
                    {DENOMINATIONS.map((d, i) => (
                      <span key={d.slug}>
                        {i > 0 && ", "}
                        <Link href={`/for/${d.slug}`} className="text-primary hover:underline">
                          {d.short}
                        </Link>
                      </span>
                    ))}
                    .
                  </p>
                )}

                {t.id === "choosing" && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">By role: </span>
                    {ROLES.map((r, i) => (
                      <span key={r.slug}>
                        {i > 0 && ", "}
                        <Link href={`/for/${r.slug}`} className="text-primary hover:underline">
                          {r.who}
                        </Link>
                      </span>
                    ))}
                    .
                  </p>
                )}
              </section>
            );
          })}
        </div>

        <TryBand
          title="All four records in one place"
          body="The register, attendance, giving and vital events, kept once and turned into your return. Try Fold with your own register for 30 days."
        />
      </main>
      <SiteFooter />
    </div>
  );
}
