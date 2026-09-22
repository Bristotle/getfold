import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { SectionBg } from "./section-bg";
import { TryBand } from "./try-band";
import type { Role } from "@/lib/roles";
import { ROLES } from "@/lib/roles";
import { getTerm } from "@/lib/glossary";

/**
 * The role page. Hero, what the job is like now, what changes, the
 * questions people in that job ask, and the other roles. FAQPage is
 * generated from the same faq array the page renders.
 */
export function RolePage({ r }: { r: Role }) {
  const others = ROLES.filter((x) => x.slug !== r.slug);
  const terms = r.terms.map(getTerm).filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: r.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              Fold for {r.who}
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              {r.title}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {r.intro[0]}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Start your 30 day free trial
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface px-6 text-base font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Talk to us first
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- the job now ---------- */}
        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="grid" />
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                The job as it is
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{r.intro[1]}</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {r.pains.map((p) => (
                <div key={p.title} className="min-w-0 rounded-2xl border border-border bg-background p-6">
                  <h3 className="text-lg font-bold text-foreground">{p.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- what changes ---------- */}
        <section className="relative isolate overflow-hidden border-y border-border">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              What changes with Fold
            </h2>
            <ul className="m-0 mt-8 flex list-none flex-col gap-6 p-0">
              {r.does.map((d) => (
                <li key={d.title} className="flex gap-4">
                  <span aria-hidden="true" className="mt-[0.75em] h-px w-3.5 shrink-0 bg-primary" />
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-foreground">{d.title}</h3>
                    <p className="mt-1.5 text-[16px] leading-relaxed text-foreground/85">{d.text}</p>
                    <Link
                      href={d.href as "/"}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      See how
                      <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- questions ---------- */}
        <section className="relative isolate overflow-hidden">
          <SectionBg variant="orbs" />
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              Questions {r.who} ask
            </h2>
            <dl className="mt-8 flex flex-col gap-6">
              {r.faq.map((f) => (
                <div key={f.q} className="min-w-0">
                  <dt className="text-lg font-bold text-foreground">{f.q}</dt>
                  <dd className="m-0 mt-2 text-[16px] leading-relaxed text-foreground/85">{f.a}</dd>
                </div>
              ))}
            </dl>
            {terms.length > 0 && (
              <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
                Words on this page, defined:{" "}
                {terms.map((t, i) => (
                  <span key={t.slug}>
                    <Link href={`/glossary/${t.slug}`} className="font-medium text-primary hover:underline">
                      {t.term.toLowerCase()}
                    </Link>
                    {i < terms.length - 1 ? ", " : "."}
                  </span>
                ))}
              </p>
            )}
          </div>
        </section>

        {/* ---------- other roles ---------- */}
        <section className="relative isolate overflow-hidden border-t border-border bg-surface">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Fold for other people in the church
            </h2>
            <ul className="m-0 mt-5 flex list-none flex-wrap gap-2.5 p-0">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/for/${o.slug}`}
                    className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {o.who[0].toUpperCase() + o.who.slice(1)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/for/methodist-churches"
                  className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  By denomination
                </Link>
              </li>
            </ul>
          </div>
        </section>

        <TryBand
          title={`Built for ${r.who}, not adapted for them`}
          body="Thirty days free with your own register, no card, and your records leave as easily as they arrive."
        />
      </main>
      <SiteFooter />
    </div>
  );
}
