import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { TryBand } from "@/components/marketing/try-band";
import { INTEGRATIONS, getIntegration } from "@/lib/integrations";
import { metaTitle, metaDescription } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return INTEGRATIONS.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const i = getIntegration(slug);
  if (!i) return { title: "Not found, Fold" };
  return {
    title: metaTitle(`Fold + ${i.name}`),
    description: metaDescription(i.description),
    keywords: i.keywords,
    alternates: { canonical: `https://www.getfold.org/works-with/${i.slug}` },
    openGraph: { images: ["/og-default.png"], title: i.title, description: metaDescription(i.description) },
  };
}

export default async function IntegrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = getIntegration(slug);
  if (!i) notFound();
  const others = INTEGRATIONS.filter((x) => x.slug !== i.slug);

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                { "@type": "Question", name: `Does Fold work with ${i.name}?`, acceptedAnswer: { "@type": "Answer", text: `${i.what} ${i.how[0]}` } },
                ...i.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "HowTo",
              name: `Set up ${i.name} with Fold`,
              step: i.steps.map((s, n) => ({ "@type": "HowToStep", position: n + 1, text: s })),
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://www.getfold.org/" },
                { "@type": "ListItem", position: 2, name: "Works with", item: "https://www.getfold.org/works-with" },
                { "@type": "ListItem", position: 3, name: i.name },
              ],
            },
          ]),
        }}
      />
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <nav aria-label="Breadcrumb" className="text-sm">
              <Link href="/works-with" className="inline-flex items-center gap-1.5 rounded font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
                Works with
              </Link>
            </nav>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Fold + {i.short}</p>
            <h1 className="mt-2 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">{i.title}</h1>
            <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">{i.what}</p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-balance font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">How it works</h2>
          <div className="mt-5 flex flex-col gap-4 text-[16px] leading-relaxed text-foreground/85">
            {i.how.map((p) => <p key={p}>{p}</p>)}
          </div>

          <dl className="mt-10 grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2 sm:p-6">
            {i.facts.map((f) => (
              <div key={f.label} className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{f.label}</dt>
                <dd className="m-0 mt-0.5 text-[15px] font-medium text-foreground">{f.value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-12 text-balance font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Setting it up</h2>
          <ol className="m-0 mt-6 flex list-none flex-col gap-4 p-0">
            {i.steps.map((s, n) => (
              <li key={s} className="flex gap-4">
                <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 font-numeric text-xs font-bold text-primary">{n + 1}</span>
                <span className="pt-0.5 text-[16px] leading-relaxed text-foreground/85">{s}</span>
              </li>
            ))}
          </ol>

          <h2 className="mt-12 text-balance font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Questions</h2>
          <dl className="mt-6 flex flex-col gap-5">
            {i.faq.map((f) => (
              <div key={f.q} className="min-w-0">
                <dt className="text-lg font-bold text-foreground">{f.q}</dt>
                <dd className="m-0 mt-2 text-[16px] leading-relaxed text-foreground/85">{f.a}</dd>
              </div>
            ))}
          </dl>

          <ul className="m-0 mt-10 flex list-none flex-col gap-2 border-t border-border p-0 pt-6">
            {i.related.map((r) => (
              <li key={r.href}>
                <Link href={r.href as "/"} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
                  {r.label}
                  <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-12 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Fold also works with</h2>
          <ul className="m-0 mt-4 flex list-none flex-wrap gap-2.5 p-0">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/works-with/${o.slug}`} className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                  {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <TryBand title={`${i.short} and your register, together`} body="Thirty days free with your own church, no card, and nothing to install." />
      </main>
      <SiteFooter />
    </div>
  );
}
