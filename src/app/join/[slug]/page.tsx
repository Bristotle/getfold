import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Clock, Check } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { OPPORTUNITIES, getOpportunity } from "@/lib/join";

/** A titled list of ticked points. Hoisted out of the page so it is not
 *  recreated on every render. */
function Points({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-9">
      <h2 className="text-balance text-lg font-bold text-foreground">{title}</h2>
      <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
        {items.map((i) => (
          <li key={i} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
            >
              <Check size={12} strokeWidth={3} />
            </span>
            <span className="text-[16px] leading-relaxed text-foreground/85">
              {i}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function generateStaticParams() {
  return OPPORTUNITIES.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const o = getOpportunity(slug);
  if (!o) return { title: "Not found, Fold" };
  return {
    title: `${o.title} in Ghana, Fold`,
    description: `${o.summary} ${o.location}`,
    keywords: o.keywords,
    openGraph: { title: `${o.title}, Fold`, description: o.summary },
  };
}

/**
 * One opportunity.
 *
 * There is deliberately no JobPosting structured data. Google expects that
 * markup to describe a real vacancy with a closing date, and these are open
 * invitations. Marking up an invitation as a job advert is how a domain
 * loses its rich results.
 */
export default async function JoinDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const o = getOpportunity(slug);
  if (!o) notFound();

  const others = OPPORTUNITIES.filter((x) => x.slug !== o.slug).slice(0, 4);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
            <Link
              href="/join"
              className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
              All opportunities
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {o.kind}
            </p>
            <h1 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              {o.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {o.summary}
            </p>

            <dl className="mt-7 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              <div className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 shrink-0 text-primary">
                  <MapPin size={17} strokeWidth={1.9} />
                </span>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Where
                  </dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-foreground/85">
                    {o.location}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 shrink-0 text-primary">
                  <Clock size={17} strokeWidth={1.9} />
                </span>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Commitment
                  </dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-foreground/85">
                    {o.commitment}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </section>

        <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-14">
          {o.intro.map((p) => (
            <p key={p} className="mb-4 text-[17px] leading-relaxed text-foreground/85">
              {p}
            </p>
          ))}

          <Points title="What you would be doing" items={o.doing} />
          <Points title="What we are looking for" items={o.looking} />
          <Points title="What you get" items={o.offer} />

          <div className="mt-12 rounded-2xl border border-primary/25 bg-primary-soft p-6 sm:p-8">
            <h2 className="text-balance text-xl font-bold tracking-tight text-foreground">
              Interested?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Write to us and say which of these you mean and why. A person
              reads every message and replies within a day. There is no form
              with twenty fields, and no closing date.
            </p>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </article>

        {others.length > 0 && (
          <section className="relative isolate overflow-hidden border-t border-border bg-surface">
            <SectionBg variant="dots" />
            <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Other ways to work with us
              </h2>
              <ul className="m-0 mt-5 flex list-none flex-col p-0">
                {others.map((x) => (
                  <li key={x.slug} className="border-b border-border last:border-0">
                    <Link
                      href={`/join/${x.slug}`}
                      className="group flex min-h-14 items-center justify-between gap-4 rounded py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      <span className="text-[15px] font-medium text-foreground group-hover:text-primary">
                        {x.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {x.kind}
                      </span>
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
