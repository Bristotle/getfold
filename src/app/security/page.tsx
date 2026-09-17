import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg, CtaBand } from "@/components/marketing/section-bg";
import { metaDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How Fold keeps one church's records from another",
  description: metaDescription(
    "The actual rule the database applies before it returns a single row of giving, quoted rather than described, with what we test and how often. Written for a trustee who wants to check rather than take our word."
  ),
  alternates: { canonical: "/security" },
};

/*
  The policy the database applies to the contributions table, quoted as it
  is, not paraphrased. Taken from pg_policies on the live project. If it
  changes there it should change here, and the CI job that attacks the site
  after every deploy is what notices if the two ever disagree in effect.
*/
const POLICY = `org_role(organization_id) = ANY (ARRAY['super_admin', 'pastor', 'admin', 'minister', 'finance_officer'])
  OR oversees(organization_id)`;

const CHECKS = [
  "The public key cannot read any of the 22 tables, including members, giving, payments and invoices.",
  "A signed in stranger with their own account, targeting a real church by its id, sees nothing.",
  "That stranger cannot insert themselves into a church as its pastor.",
  "That stranger cannot raise an invoice against a church they do not belong to.",
  "The dashboard totals and the roll ups return nothing across a church boundary.",
  "SQL injection through every filter is refused.",
  "Every private page refuses an unauthenticated request.",
  "The Paystack webhook refuses an unsigned or forged signature.",
  "No secret appears anywhere in the delivered HTML.",
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Security
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              One church cannot see another. Here is the rule, not the promise.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Every church software vendor says your data is safe. This page
              is for the trustee or elder who would rather check than take
              our word: what the database actually does, quoted rather than
              described, and what we test, and how often.
            </p>
          </div>
        </section>

        <section className="relative isolate overflow-hidden">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              The boundary is in the database, not in the screens
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-foreground/85">
              Most software decides what you may see in the interface: a menu
              is hidden, a button is greyed out, a page checks your role
              before it draws. That works until somebody goes around the
              interface, which is one clever URL away. Fold does not rely on
              it. Every table of church data carries rules that Postgres
              itself applies before it returns a single row, whoever is
              asking and however they ask.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-foreground/85">
              This is the rule on the giving table, exactly as the database
              holds it. A row is returned only if:
            </p>
            <pre className="mt-5 overflow-x-auto rounded-xl border border-border bg-surface p-5 font-numeric text-[13px] leading-relaxed text-foreground">
              {POLICY}
            </pre>
            <p className="mt-4 text-[17px] leading-relaxed text-foreground/85">
              In plain words: you see a church&rsquo;s giving if you hold one
              of those five roles <em>in that church</em>, or if you lead a
              body above it in the denomination and are looking down. A
              class leader is not on that list, so a class leader asking the
              database for giving, by any route, gets nothing. Not an error,
              not a blank screen with a hint. Nothing.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-foreground/85">
              There are 62 rules like this across 22 tables. Oversight from
              above is read only by design: a regional overseer sees every
              assembly beneath them and cannot write into one.
            </p>
          </div>
        </section>

        <section className="relative isolate overflow-hidden border-y border-border bg-surface">
          <SectionBg variant="grid" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              We attack it after every change
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-foreground/85">
              A rule is a claim until something tries to break it. After every
              deployment, a script signs up a throwaway account and tries to
              do the things that must not work. It fails the deployment if any
              of them succeeds. Among what it tries:
            </p>
            <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
              {CHECKS.map((c) => (
                <li key={c} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-[16px] leading-relaxed text-foreground/85">{c}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[17px] leading-relaxed text-foreground/85">
              Ninety checks in all. The throwaway account is created at an
              address that can never receive mail and deleted afterwards, and
              nothing is ever written to a real church.
            </p>
          </div>
        </section>

        <section className="relative isolate overflow-hidden">
          <SectionBg variant="orbs" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              The rest, briefly
            </h2>
            <dl className="m-0 mt-6 flex flex-col gap-6">
              {[
                ["Your money never touches ours", "Each church has its own settlement account with Paystack. A tithe paid by mobile money is paid to you, and it never enters Fold's balance. We do not hold your account number: Paystack does, and we keep a reference code and a label."],
                ["Every change is on the record", "Who added a member, who changed a status, who recorded or corrected a gift, and when. The log is written by the database, not the app, and nobody can edit or delete an entry, including the pastor reading it."],
                ["Sign ins are watched", "Five failed attempts against one address in fifteen minutes and that address is paused. Every attempt, successful or not, is recorded in a log nobody can read through the API. A password change ends every other session."],
                ["Your records are yours", "Export your register as a spreadsheet whenever you like, without asking. Close the account and everything is deleted within thirty days. Under Ghana's Data Protection Act, 2012 (Act 843), your church is the data controller and we build to that."],
                ["What we do not claim", "Nothing here is a guarantee against every possible attack; no honest vendor can offer one. It is a description of what the boundary is, where it lives, and how we know it holds today."],
              ].map(([t, b]) => (
                <div key={t} className="border-t border-border pt-5">
                  <dt className="text-base font-bold text-foreground">{t}</dt>
                  <dd className="m-0 mt-2 text-[16px] leading-relaxed text-muted-foreground">{b}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 text-sm text-muted-foreground">
              Questions a trustee would ask that this page did not answer:{" "}
              <Link href="/contact" className="rounded font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                ask them
              </Link>
              , and we will answer in writing.
            </p>
          </div>
        </section>

        <CtaBand>
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-16">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              See it with your own register
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-primary-foreground/85">
              Thirty days free, no card, and your records leave as easily as
              they arrive.
            </p>
            <div className="mt-8">
              <Link href="/signup" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary-foreground px-6 text-base font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60">
                Start your free trial
              </Link>
            </div>
          </div>
        </CtaBand>
      </main>

      <SiteFooter />
    </div>
  );
}
