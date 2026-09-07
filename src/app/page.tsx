import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { OnYourPhone, Modules, Faq } from "@/components/marketing/sections";
import { GettingStarted } from "@/components/marketing/getting-started";
import { WhyTrust } from "@/components/marketing/why-trust";
import { Proof } from "@/components/marketing/proof";
import { SectionBg } from "@/components/marketing/section-bg";
import { Contact } from "@/components/marketing/contact";

export const metadata: Metadata = {
  title: "Fold, church software that speaks your denomination's language",
  description:
    "Members, Bible classes, attendance and giving in your own words, and the statistical return your circuit asks for already filled in. Built in Ghana, cash first. 30 day free trial, no card.",
};

const FEATURES = [
  {
    title: "The register, properly kept",
    body: "Members, Bible classes and fellowships, visitors, transfers. Member types are your words. Full Member, Catechumen, Covenant Member, not a fixed list someone else chose.",
  },
  {
    title: "Attendance in seconds",
    body: "A head count per service is enough. Tick off who came by name when you want to, and the register starts telling you who has quietly stopped coming.",
  },
  {
    title: "Tithes, offerings and funds",
    body: "Cash is the default, because that is how most people give. Mobile money sits alongside it for those ready, never in place of it.",
  },
  {
    title: "Returns without the spreadsheet",
    body: "Membership, attendance averages, baptisms and income for any period, laid out to print or save as PDF. Drawn from what your team already recorded.",
  },
];

const RETURN_ROWS = [
  ["Total active members", "248"],
  ["Male / Female", "104 / 144"],
  ["Joined in period", "31"],
  ["Average attendance", "312"],
  ["Baptisms", "17"],
  ["Confirmations", "9"],
  ["Weddings", "4"],
  ["Total income", "GHS 61,240"],
];

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* ---------- hero ---------- */}
      {/*
        min-w-0 on both tracks. A grid item defaults to min-width:auto, so a
        single wide descendant makes its track refuse to shrink and the
        section overflows the viewport instead of wrapping.
      */}
      <section className="relative isolate overflow-hidden">
        <SectionBg variant="aurora" />
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:py-24">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            For societies, circuits and congregations across Ghana
          </p>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            Church software that speaks your denomination&apos;s language.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Members, Bible classes, attendance and giving recorded in your own
            words, and the statistical return your circuit asks for already
            filled in. No spreadsheet, and no rebuilding it every quarter.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/signup">
              <Button size="lg">Start your 30 day free trial</Button>
            </Link>
            <span className="text-sm text-muted-foreground">
              No credit card. No commitment.
            </span>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-1 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-3">
            {[
              ["Your structure", "Society, circuit or diocese"],
              ["Your return", "Already filled in"],
              ["Cash first", "Mobile money optional"],
            ].map(([term, desc]) => (
              <div key={term}>
                <dt className="text-sm font-semibold text-foreground">{term}</dt>
                <dd className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {desc}
                </dd>
              </div>
            ))}
          </dl>
        </div>

          <div className="min-w-0 lg:pl-4">
            <DashboardPreview />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Example figures, shown to illustrate the dashboard.
            </p>
          </div>
        </div>
      </section>

      <Proof />

      <WhyTrust />

      <OnYourPhone />

      {/* ---------- the argument ---------- */}
      {/* Sits on the page ground: the sections either side of it are on
          surface, and three raised bands in a row read as one long block. */}
      <section className="relative isolate overflow-hidden border-y border-border">
        <SectionBg variant="dots" />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Every other church system is built for one independent
              congregation.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              None of them knows what a circuit is, or a society, or a Bible
              class, or a catechumen, or a quarterly return to a
              superintendent. They offer you a fixed list of member types
              somebody else wrote and a small group model borrowed from
              somewhere else. Fold starts from how your denomination is
              actually organised, and stays out of the way of the parts that
              already work.
            </p>
          </div>

          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-t border-border pt-5">
                <h3 className="text-base font-bold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GettingStarted />

      {/* ---------- the differentiator ---------- */}
      <section className="relative isolate overflow-hidden">
        <SectionBg variant="orbs" />
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              The part that saves a whole evening
            </p>
            <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Your statistical return, already filled in.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Membership by class, attendance averages, baptisms and
              confirmations, income by type, for whatever period you choose.
              Print it, or save it as a PDF. Nothing is entered twice, because
              it comes from the records your team kept through the quarter.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Class leaders see their class. Finance officers see the money.
              Ministers see both. That separation is enforced by the database
              itself, not just hidden in the interface.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold text-foreground">
              Shekinah Prayer Ministry International
            </p>
            <p className="text-xs text-muted-foreground">
              Statistical return, 1 January to 30 September
            </p>
            <div className="mt-5 grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {RETURN_ROWS.map(([label, value], i) => (
                <div
                  key={label}
                  className={`flex items-baseline justify-between gap-4 py-2 ${
                    i < RETURN_ROWS.length - 2 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="font-numeric text-sm font-semibold tabular-nums text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Example figures.
            </p>
          </div>
        </div>
        </div>
      </section>

      <Modules />

      <Faq />

      <Contact sent={sent === "1"} error={error} />

      {/* ---------- close ---------- */}
      <section className="relative isolate overflow-hidden border-t border-border bg-surface">
        <SectionBg variant="orbs" />
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16 lg:py-20">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Set up your church tonight, use it on Sunday.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Start with your members. Add attendance and giving when you are
            ready. Nothing is compulsory, and nothing depends on mobile money or
            a fast connection.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link href="/signup">
              <Button size="lg">Start your 30 day free trial</Button>
            </Link>
            <span className="text-sm text-muted-foreground">
              Free for 30 days. No credit card required, and no commitment.
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
