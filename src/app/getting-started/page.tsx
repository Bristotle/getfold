import type { Metadata } from "next";
import Link from "next/link";
import { FileSpreadsheet, Users, ClipboardCheck, HandCoins } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { GettingStarted } from "@/components/marketing/getting-started";
import { Button } from "@/components/ui/button";
import { SectionBg, CtaBand } from "@/components/marketing/section-bg";

export const metadata: Metadata = {
  title: "Getting started with Fold, set up in an evening",
  description:
    "What setting up Fold actually involves: under a minute to create your church, upload the register you already keep, and record your first service this Sunday.",
};

/**
 * What to have ready.
 *
 * Answers the question a pastor asks before agreeing to try anything: what
 * is this going to ask of me. Each item says plainly that it is optional,
 * because the honest answer is that only the church name is required.
 */
const PREPARE = [
  {
    Icon: FileSpreadsheet,
    title: "Your register, if it is already typed",
    body: "An Excel or Google Sheets file with your members. Any column names will do, we read yours. If it is still in a book, that is fine too, start with the people who come every week and add the rest over time.",
    tag: "Optional",
  },
  {
    Icon: Users,
    title: "Your classes and fellowships",
    body: "The names of your Bible classes, fellowships or groups, and who leads each one. Create these first and your import will drop members straight into the right one.",
    tag: "Optional",
  },
  {
    Icon: ClipboardCheck,
    title: "Last Sunday's head count",
    body: "One number for men and one for women is enough to start. You can name individuals later, and only when you want to.",
    tag: "Takes a second",
  },
  {
    Icon: HandCoins,
    title: "Nothing at all for giving",
    body: "Cash entry works from the first minute. Mobile money is there when you want it and ignored entirely when you do not.",
    tag: "No setup",
  },
];

/**
 * The first week, told as what actually happens rather than as a sales
 * timeline. The last line matters most: attrition detection needs history,
 * and pretending otherwise would set a church up to be disappointed.
 */
const TIMELINE = [
  {
    when: "Day one",
    what: "Your church exists and your members are in it",
    body: "Create the church, upload or type your register, and you have a searchable membership list that everyone with a login can reach from their phone.",
  },
  {
    when: "First Sunday",
    what: "The dashboard stops being empty",
    body: "Record the service and log the offering. Attendance and giving figures appear, and your statistical return starts filling itself in.",
  },
  {
    when: "First month",
    what: "The return writes itself",
    body: "Membership by class, attendance averages, baptisms and income for the period, ready to print. The evening you used to spend on it is yours again.",
  },
  {
    when: "After a few weeks of naming who attended",
    what: "It starts telling you things you did not know",
    body: "Once there is enough history to compare against, the insights page begins surfacing members whose attendance has quietly fallen away. This one genuinely needs time, there is no way to know who is drifting until there is a pattern to drift from.",
  },
];

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        {/* ---------- hero ---------- */}
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Getting started
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              You can be using it this Sunday
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              No installation, no training day, no consultant. Here is exactly
              what setting up involves, and what it will ask of you.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg">Start your 30 day free trial</Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  Ask us a question first
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* the same three steps as the homepage, deliberately identical */}
        <GettingStarted />

        {/* ---------- what to have ready ---------- */}
        <section className="relative isolate overflow-hidden">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Before you begin
              </p>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                What to have ready
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Honestly, only your church name is required. Everything below
                makes the first hour smoother, and none of it stops you
                starting.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {PREPARE.map(({ Icon, title, body, tag }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
                    >
                      <Icon size={21} strokeWidth={1.7} />
                    </span>
                    <span className="rounded-full bg-surface-soft px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-balance text-base font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- the first month ---------- */}
        <section className="relative isolate overflow-hidden border-y border-border bg-surface">
          <SectionBg variant="grid" />
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              What to expect
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your first month
            </h2>

            <ol className="m-0 mt-10 flex list-none flex-col p-0">
              {TIMELINE.map((t, i) => (
                <li key={t.when} className="flex gap-5">
                  {/* the rail: a dot per stage, a line between them */}
                  <div
                    aria-hidden="true"
                    className="flex flex-col items-center"
                  >
                    <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-primary" />
                    {i < TIMELINE.length - 1 && (
                      <span className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-9">
                    <p className="font-numeric text-xs font-semibold uppercase tracking-wide text-primary">
                      {t.when}
                    </p>
                    <h3 className="mt-1 text-balance text-lg font-bold text-foreground">
                      {t.what}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                      {t.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- close ---------- */}
        <CtaBand>
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Set it up tonight
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-primary-foreground/85">
              Thirty days free, no card, and nothing to cancel if it turns out
              not to suit your church. If you would rather we walked you
              through it, say so and we will.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary-foreground px-6 text-base font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Create your church
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primary-foreground/40 px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Talk to a person
              </Link>
            </div>
          </div>
        </CtaBand>
      </main>

      <SiteFooter />
    </div>
  );
}
