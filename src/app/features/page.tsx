import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  ClipboardCheck,
  Coins,
  FileBarChart,
  Landmark,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Search,
  ArrowLeftRight,
  HeartHandshake,
  Download,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";

export const metadata: Metadata = {
  title: "Features, Fold",
  description:
    "Everything Fold does: the register in your denomination's words, attendance, tithes and funds, the statistical return, roles enforced by the database, and messaging. Built in Ghana.",
};

/**
 * The features page.
 *
 * Every competitor has one and we did not. It is written module by module
 * rather than as a list of adjectives, and each entry says what the thing
 * actually does rather than what it is called.
 */
const MODULES = [
  {
    Icon: Users,
    name: "The register",
    body: "Members, Bible classes, fellowships and groups. Member types are the words your denomination uses, not a fixed list somebody else wrote. Import from Excel or Google Sheets reading your own column headings, and export the whole thing whenever you like.",
    points: [
      "Import and export as CSV, with phone numbers that keep their leading zero",
      "Classes and fellowships with their own leaders",
      "Full members, catechumens, covenant members, adherents, your terms",
    ],
  },
  {
    Icon: ClipboardCheck,
    name: "Attendance",
    body: "A head count takes about ten seconds and is enough to start. Name who came when you want to, and a whole congregation saves in one go rather than one request per person, so it works standing at the back of a service on a weak signal.",
    points: [
      "Head count per service, or named attendance, or both",
      "Averages calculated against services actually held, not Sundays on a calendar",
      "One save for the whole service",
    ],
  },
  {
    Icon: Coins,
    name: "Tithes, offerings and funds",
    body: "Cash is the default on every form, because that is how most people give. Funds keep a building project or a harvest counted separately, and their totals are recalculated from the contributions themselves rather than kept as a number somebody must remember to update.",
    points: [
      "Cash, cheque, bank transfer and mobile money",
      "Any number of funds, each with an optional target",
      "Totals that correct themselves when a contribution moves or is deleted",
    ],
  },
  {
    Icon: FileBarChart,
    name: "The statistical return",
    body: "Membership by class, attendance averages, baptisms and confirmations, income by type, for whatever period you choose. Nothing is entered twice, because every figure comes from a record your team already made during the quarter.",
    points: [
      "Any period, printed or saved as PDF",
      "Membership split by sex and by class",
      "Vital records and income in the same document",
    ],
  },
  {
    Icon: Landmark,
    name: "Your denomination's structure",
    body: "A Methodist society, a Presbyterian congregation and an independent assembly are not the same shape, and none of them is a small group model borrowed from somewhere else. Fold is built around the one you actually have.",
    points: [
      "Society, circuit, congregation or assembly",
      "Bible classes and fellowships with class leaders",
      "Transfers in and out with the letter that goes with them",
    ],
  },
  {
    Icon: HeartHandshake,
    name: "Who has stopped coming",
    body: "Each member is compared against their own previous pattern rather than against a congregation average, so somebody who has always come twice a year is not flagged and somebody who came weekly and has not been seen for six weeks is.",
    points: [
      "Measured against services actually held",
      "A phone call four months earlier than you would otherwise have made it",
      "Needs a few weeks of named attendance before it can say anything",
    ],
  },
  {
    Icon: ShieldCheck,
    name: "Roles the database enforces",
    body: "The pastor holds the church and delegates the rest: administrator, minister, elder, class leader, finance officer. Only the pastor can appoint another pastor. Every rule is a policy in Postgres, so going round the interface gets you nothing.",
    points: [
      "Six roles, each with a line it cannot cross",
      "Only leadership and a finance officer can open giving",
      "Enforced by row level security, not by hiding a menu",
    ],
  },
  {
    Icon: MessageSquare,
    name: "Messaging",
    body: "Text members from the register you already keep. Welcome a new member, thank somebody for a tithe, or reach the people an insight has flagged as drifting away.",
    points: [
      "SMS through a Ghanaian provider, sent to Ghanaian numbers",
      "Sent from the register, so numbers are never retyped",
      "Nothing asks a member to install anything",
    ],
  },
  {
    Icon: Smartphone,
    name: "Built for a phone",
    body: "Install it from the browser with no app store and no large download over mobile data. It opens full screen like anything else on the handset, and the person recording a service is the person holding it.",
    points: [
      "Add to home screen on Android or iPhone",
      "Designed for few round trips on a weak signal",
      "Works on an office computer too, but that is the afterthought",
    ],
  },
  {
    Icon: ArrowLeftRight,
    name: "Transfers and visitors",
    body: "A transfer is a member moving between churches with a letter. A visitor is somebody who came without joining. They are separate records because they count differently on a return, and a visitor becomes a member without retyping anything.",
    points: [
      "Transfers in and out, restricted to leadership",
      "Visitors kept apart from membership figures",
      "Convert a visitor to a member in one step",
    ],
  },
  {
    Icon: Search,
    name: "Vital records",
    body: "Baptisms, confirmations, weddings and funerals, recorded the week they happen rather than reconstructed in October, and flowing straight into the return for whatever period they fall in.",
    points: [
      "The officiating minister recorded with each one",
      "Straight into the statistical return",
      "A minute each, instead of an evening in arrears",
    ],
  },
  {
    Icon: Download,
    name: "Your data stays yours",
    body: "Export your whole register at any time in a file that opens in Excel or Google Sheets, and we delete everything within 30 days of an account closing. Software that makes leaving difficult is relying on something other than being good.",
    points: [
      "Export on any day, including the day you leave",
      "Deleted within 30 days of closing",
      "Your church's records separated from every other church's in the database",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              Features
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Everything Fold does, module by module
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Written as what each part actually does, rather than as a list of
              adjectives. If something here is not clear, ask and a person will
              answer.
            </p>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="grid" />
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <ul className="m-0 grid list-none gap-6 p-0 lg:grid-cols-2">
              {MODULES.map(({ Icon, name, body, points }) => (
                <li
                  key={name}
                  className="flex flex-col rounded-2xl border border-border bg-background p-6 sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"
                  >
                    <Icon size={22} strokeWidth={1.7} />
                  </span>
                  <h2 className="mt-5 text-balance text-lg font-bold text-foreground">
                    {name}
                  </h2>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                  <ul className="m-0 mt-5 flex list-none flex-col gap-2.5 border-t border-border p-0 pt-5">
                    {points.map((pt) => (
                      <li key={pt} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                        />
                        <span className="text-sm leading-relaxed text-foreground/80">
                          {pt}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative isolate overflow-hidden border-t border-border bg-primary text-primary-foreground">
          <SectionBg variant="mesh" />
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              See it with your own register in it
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-primary-foreground/85">
              Thirty days free, no card, and nothing to cancel. Bring the list
              you already keep and we will help you move it across.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary-foreground px-6 text-base font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Start your free trial
              </Link>
              <Link
                href="/compare"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primary-foreground/40 px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Compare with others
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
