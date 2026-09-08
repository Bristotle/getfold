import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Layers, Users, FileBarChart, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { DENOMINATIONS, getDenomination } from "@/lib/denominations";

export const dynamicParams = false;

export function generateStaticParams() {
  return DENOMINATIONS.map((d) => ({ denomination: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ denomination: string }>;
}): Promise<Metadata> {
  const { denomination } = await params;
  const d = getDenomination(denomination);
  if (!d) return { title: "Not found, Fold" };
  return {
    title: d.title,
    description: d.description,
    keywords: d.keywords,
    openGraph: { title: d.title, description: d.description },
  };
}

export default async function DenominationPage({
  params,
}: {
  params: Promise<{ denomination: string }>;
}) {
  const { denomination } = await params;
  const d = getDenomination(denomination);
  if (!d) notFound();

  const others = DENOMINATIONS.filter((x) => x.slug !== d.slug);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/*
        FAQPage on the three questions this denomination actually asks.
        Generated from the same data the page renders, so the two cannot
        drift apart.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `Does Fold understand the ${d.short} structure?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Yes. Fold is built around ${d.hierarchy.join(", ")}, with your ${d.groups} and the offices you actually use: ${d.offices.join(", ")}.`,
                },
              },
              {
                "@type": "Question",
                name: `Can Fold produce our ${d.returnName}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Yes. Membership by group, attendance measured against services actually held, baptisms and confirmations, and income by type, for any period, ready to print or save as PDF for ${d.returnTo}.`,
                },
              },
              {
                "@type": "Question",
                name: `Can we use our own membership categories?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Yes. Member types are the words your church uses, such as ${d.memberTypes.join(", ")}, rather than a fixed list written for somebody else's church.`,
                },
              },
            ],
          }),
        }}
      />

      <main id="main">
        {/* ---------- hero ---------- */}
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              {d.name}
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              {d.title}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {d.intro[0]}
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
                Ask us about your {d.unit}
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- the structure ---------- */}
        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="grid" />
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                Your structure, not a template
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
                {d.intro[1]}
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-6 sm:p-7">
                <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Layers size={22} strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-foreground">
                  Levels of oversight
                </h3>
                <ol className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
                  {d.hierarchy.map((level, i) => (
                    <li key={level} className="flex items-center gap-3" style={{ paddingLeft: `${i * 1.1}rem` }}>
                      <span aria-hidden="true" className="font-numeric text-xs text-muted-foreground">
                        {i === d.hierarchy.length - 1 ? "⤷" : "⤷"}
                      </span>
                      <span className={`text-[15px] ${i === d.hierarchy.length - 1 ? "font-bold text-foreground" : "text-foreground/80"}`}>
                        {level}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                  Branches let one account oversee several {d.unit}s, each keeping its own register.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 sm:p-7">
                <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Users size={22} strokeWidth={1.7} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-foreground">
                  Your words, not ours
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">Membership categories</p>
                <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
                  {d.memberTypes.map((t) => (
                    <li key={t} className="rounded-full bg-surface-soft px-3 py-1 text-[13px] font-medium text-foreground">
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm text-muted-foreground">Offices your church fills</p>
                <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
                  {d.offices.map((o) => (
                    <li key={o} className="rounded-full bg-surface-soft px-3 py-1 text-[13px] font-medium text-foreground">
                      {o}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                  These are examples from {d.short} practice. You type your own, and nothing is a fixed list.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- the return ---------- */}
        <section className="relative isolate overflow-hidden border-y border-border">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <FileBarChart size={22} strokeWidth={1.7} />
            </span>
            <h2 className="mt-5 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              Your {d.returnName}, already filled in
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              The evening somebody in your {d.unit} loses every period, assembling figures that were all written down somewhere already. Fold counts them from the records your team kept as they went.
            </p>
            <ul className="m-0 mt-6 flex list-none flex-col gap-3 p-0">
              {[
                `Membership totalled and broken down by ${d.groups.split(",")[0]}`,
                "Attendance averaged against services actually held, not against Sundays on a calendar",
                "Baptisms, confirmations, weddings and funerals recorded the week they happen",
                "Income split by tithe, offering and any fund you keep",
                `Ready to print or save as PDF for ${d.returnTo}`,
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span aria-hidden="true" className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-[16px] leading-relaxed text-foreground/85">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- who sees what ---------- */}
        <section className="relative isolate overflow-hidden">
          <SectionBg variant="orbs" />
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <span aria-hidden="true" className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck size={22} strokeWidth={1.7} />
            </span>
            <h2 className="mt-5 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              Who sees the giving
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              The minister, an administrator and a finance officer. Nobody else. A {d.offices[2].toLowerCase()} can keep their own people and record attendance without ever opening the giving records, and that is enforced by the database itself rather than by hiding a menu item.
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              Each {d.unit}&apos;s records are separated from every other church&apos;s in the same way. Under the Data Protection Act, 2012 (Act 843) your church is a data controller and must register with the Data Protection Commission, and choosing software that separates records properly is part of meeting that duty.
            </p>
          </div>
        </section>

        {/* ---------- other denominations ---------- */}
        <section className="relative isolate overflow-hidden border-t border-border bg-surface">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Other denominations
            </h2>
            <ul className="m-0 mt-5 flex list-none flex-wrap gap-2.5 p-0">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/for/${o.slug}`}
                    className="inline-flex min-h-11 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {o.short}
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
