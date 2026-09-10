import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  Landmark,
  Smartphone,
  Download,
  MessageSquare,
  ShieldCheck,
  KeyRound,
  Database,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Button } from "@/components/ui/button";
import { SectionBg, CtaBand } from "@/components/marketing/section-bg";

export const metadata: Metadata = {
  title: "About Fold, built around your denomination",
  description:
    "Fold is church software built in Ghana around how a denomination actually works: societies, circuits, Bible classes and the quarterly return. Cash before card, phones before office computers.",
};

/**
 * What we believe.
 *
 * Each value is written so you could check it against the product and catch
 * us out if it were untrue. A value nobody could disagree with, "we care
 * about quality", tells a church nothing and costs us nothing to claim.
 */
const VALUES = [
  {
    Icon: Banknote,
    title: "Cash is not a fallback",
    body: "Most giving in Ghana is cash, so cash is the default on every form in Fold and mobile money is the option beside it. Software that treats cash as the awkward case is software that was designed for somewhere else.",
  },
  {
    Icon: Landmark,
    title: "Your structure, not ours",
    body: "A Methodist society, a Presbyterian congregation and an independent assembly are not the same shape, and none of them is a US style small group. Member types, classes and fellowships use your words.",
  },
  {
    Icon: Smartphone,
    title: "The phone is the computer",
    body: "The person recording a service is standing at the back of it holding a phone, often on a weak signal. That is the machine we design for, and the office computer is the afterthought rather than the reverse.",
  },
  {
    Icon: Download,
    title: "Your records are yours",
    body: "You can export your whole register at any time, in a file you can open in Excel or Google Sheets. Software that makes leaving difficult is relying on something other than being good.",
  },
  {
    Icon: MessageSquare,
    title: "A person, not a ticket",
    body: "A real person reads every message and replies within a day. If you would rather we sat with you and moved your register across ourselves, ask and we will.",
  },
];

/**
 * How the separation actually works. This is the section a pastor's most
 * careful trustee reads, so it says what enforces each promise rather than
 * only that we promise it.
 */
const SAFEGUARDS = [
  {
    Icon: Database,
    title: "Separated in the database, not the menu",
    body: "Every read and write passes through row level security in Postgres. Another church cannot reach your records even if it went round the interface entirely, because the database refuses the query rather than the page hiding the button.",
  },
  {
    Icon: KeyRound,
    title: "The pastor holds the church",
    body: "The main account belongs to the pastor or minister, who delegates the rest: administrator, elder, class leader, finance officer. Only the pastor can appoint another pastor, and only leadership and a finance officer can open the giving records.",
  },
  {
    Icon: ShieldCheck,
    title: "A duty you also carry",
    body: "Under the Data Protection Act, 2012 (Act 843) your church is a data controller and has to register with the Data Protection Commission, renewing every two years. Choosing software that separates your records properly is part of meeting that duty, not a replacement for registering.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/*
        Organization structured data, so an assistant asked "who makes Fold"
        or "is there Ghanaian church software" has something it can quote
        rather than a paragraph it has to paraphrase.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Fold",
            url: "https://www.getfold.org",
            description:
              "Church management software built in Ghana for Ghanaian churches, covering the membership register, attendance, tithes and offerings, and denominational statistical returns.",
            areaServed: { "@type": "Country", name: "Ghana" },
            parentOrganization: {
              "@type": "Organization",
              name: "Manuel Technologies",
              url: "https://manueltechnologies.com",
            },
          }),
        }}
      />

      <main id="main">
        {/* ---------- hero ---------- */}
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
              About Fold
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Built in Ghana, around{" "}
              <span className="italic text-primary">your denomination</span>.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Real churches. Real records. Real Sundays. Fold keeps the
              register, the attendance, the giving and the return your circuit
              asks for in one place, in the words your denomination actually
              uses rather than a fixed list translated from somewhere else.
            </p>
          </div>
        </section>

        {/* ---------- our story ---------- */}
        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Why Fold exists
                </p>
                <h2 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                  It began with an evening nobody should have to spend
                </h2>
                <div className="mt-5 flex flex-col gap-4 text-[16px] leading-relaxed text-muted-foreground">
                  <p>
                    A church secretary with the register in one book, the cash
                    book in another, a column of Sunday head counts on a loose
                    sheet, and a return due at the circuit on Monday morning.
                    Everything needed was written down somewhere. Nothing added
                    itself up.
                  </p>
                  <p>
                    The software meant to solve that was almost always built for
                    a different country. It assumed card giving, a single
                    independent congregation and a connection that never drops,
                    so churches here bought it, used a tenth of it, and kept the
                    book anyway. A parallel paper system is the sign that the
                    software never fitted.
                  </p>
                  <p>
                    Fold starts from the other end. Take the records a church
                    already keeps, record each fact once at the moment it
                    happens, and let the totals, the averages and the return
                    work themselves out. Nothing in it asks a member to install
                    or sign in to anything.
                  </p>
                </div>
              </div>

              {/* A quiet card rather than a stock photograph, because we do
                  not have a photograph of a real Fold church yet and a stock
                  one would be the first dishonest thing on the page. */}
              <div className="rounded-2xl border border-border bg-background p-7 sm:p-9">
                <p className="font-serif text-2xl italic leading-snug text-foreground">
                  Record each fact once, when it happens. Everything else is
                  arithmetic, and arithmetic is what a computer is for.
                </p>
                <p className="mt-5 border-t border-border pt-5 text-sm text-muted-foreground">
                  The idea the whole product is built on. It is why the
                  statistical return in Fold is a question you ask rather than a
                  document you assemble.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- values ---------- */}
        <section className="relative isolate overflow-hidden border-y border-border">
          <SectionBg variant="grid" />
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                What we believe
              </p>
              <h2 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                Our values
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
                Five commitments you can hold us to, because each one is
                something you could check in the product and catch us out on.
              </p>
            </div>

            <ul className="m-0 mt-12 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map(({ Icon, title, body }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/30"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"
                  >
                    <Icon size={22} strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-5 text-balance text-base font-bold leading-snug text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- safeguards ---------- */}
        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="orbs" />
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              How your records are protected
            </p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              What actually stops the wrong person reading this
            </h2>

            <ul className="m-0 mt-10 flex list-none flex-col gap-5 p-0">
              {SAFEGUARDS.map(({ Icon, title, body }) => (
                <li
                  key={title}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 sm:flex-row sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"
                  >
                    <Icon size={22} strokeWidth={1.7} />
                  </span>
                  <div>
                    <h3 className="text-balance text-base font-bold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- who builds it ---------- */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Who builds Fold
            </p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              A product of Manuel Technologies
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              Fold is designed, built and supported by{" "}
              <a
                href="https://manueltechnologies.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Manuel Technologies
              </a>
              , a Ghanaian software company. The same people who write the code
              answer your messages, which is why the answer to a question about
              your register is usually a fix rather than an apology.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/contact">
                <Button size="lg" variant="secondary">
                  Talk to us
                </Button>
              </Link>
              <Link href="/blog">
                <Button size="lg" variant="ghost">
                  Read what we write
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- close ---------- */}
        <CtaBand>
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Ready to see your own church in it?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-primary-foreground/85">
              Setting up takes about an evening, and you can be using it on
              Sunday. Thirty days free, no card, and nothing to cancel if it
              turns out not to suit your church.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary-foreground px-6 text-base font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Start your free trial
              </Link>
              <Link
                href="/getting-started"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primary-foreground/40 px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                See how setup works
              </Link>
            </div>
          </div>
        </CtaBand>
      </main>

      <SiteFooter />
    </div>
  );
}
