import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionBg } from "@/components/marketing/section-bg";

/**
 * Getting started, as three steps.
 *
 * The numbered discs, the timing pill and the reassurance line under each
 * step all do one job: answer "how much of my evening is this going to
 * take" before a pastor has to guess. Each pill is a real claim, not
 * decoration, so none of them says anything the product cannot do.
 */
const STEPS = [
  {
    n: "1",
    pill: "Under a minute",
    title: "Set up your church",
    body: "Your church name, and the denomination if you want the right defaults. That is the whole of it. Nothing else is compulsory.",
    note: "No card. No sales call.",
  },
  {
    n: "2",
    pill: "Upload your file",
    title: "Bring the register you already have",
    body: "Export from Excel or Google Sheets and upload it. We read your column headings rather than making you rename them, and tell you about any row we could not use.",
    note: "Your groups and classes come across too.",
  },
  {
    n: "3",
    pill: "This Sunday",
    title: "Record the service",
    body: "Tick who came, log the offering. Your dashboard, your insights and your statistical return fill themselves in from that point on.",
    note: "Works on the phone in your pocket.",
  },
];

function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="hidden self-start pt-8 text-border lg:block"
    >
      <svg width="46" height="12" viewBox="0 0 46 12" fill="none">
        <path
          d="M0 6h38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 5"
        />
        <path
          d="M38 1.5 44 6l-6 4.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function GettingStarted() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-surface">
      <SectionBg variant="orbs" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Getting started
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your church running in{" "}
            <span className="text-primary">three simple steps</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            No installation, no training day, and nothing to pay while you make
            up your mind.
          </p>
        </div>

        <ol className="m-0 mt-14 flex list-none flex-col items-stretch gap-10 p-0 lg:flex-row lg:justify-center lg:gap-0">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className="flex flex-1 items-start justify-center gap-0"
            >
              <div className="flex max-w-sm flex-1 flex-col items-center px-2 text-center lg:px-5">
                <span
                  aria-hidden="true"
                  className="grid h-16 w-16 place-items-center rounded-full bg-primary font-numeric text-xl font-bold text-primary-foreground shadow-[0_0_0_6px_var(--color-primary-soft)]"
                >
                  {s.n}
                </span>

                <span className="mt-5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  {s.pill}
                </span>

                <h3 className="mt-4 text-balance text-lg font-bold text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
                <p className="mt-3 text-sm font-semibold text-primary">
                  {s.note}
                </p>
              </div>

              {i < STEPS.length - 1 && <Arrow />}
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg">Start your 30 day free trial</Button>
          </Link>
          <Link href="#contact">
            <Button size="lg" variant="secondary">
              Talk to us first
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
