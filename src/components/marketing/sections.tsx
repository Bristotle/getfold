import { type ReactNode } from "react";
import { SectionBg } from "@/components/marketing/section-bg";
import {
  Smartphone,
  ClipboardCheck,
  HandCoins,
  TrendingDown,
} from "lucide-react";

/**
 * The homepage sections beyond the hero.
 *
 * Kept in one file because they share a rhythm: an eyebrow, a heading, and
 * a grid. Splitting them across five files would make that consistency
 * something to remember rather than something to see.
 */

const MODULES = [
  {
    name: "Membership register",
    body: "Profiles, member types in your own words, groups and Bible classes, visitors, and transfers in or out.",
  },
  {
    name: "Attendance",
    body: "Head counts per service, or tick off who came by name when you want to know who has stopped coming.",
  },
  {
    name: "Giving",
    body: "Tithes, offerings, pledges and donations. Cash by default, mobile money when a member prefers it.",
  },
  {
    name: "Funds",
    body: "Building projects, missions, welfare. Totals update themselves as contributions are recorded against them.",
  },
  {
    name: "Vital records",
    body: "Baptisms, confirmations, weddings and deaths, kept where the rest of the register already lives.",
  },
  {
    name: "Statistical returns",
    body: "The figures your circuit asks for, for any period, ready to print or save as PDF.",
  },
  {
    name: "Text messages",
    body: "A welcome when someone joins, a receipt when they give, and a quiet check-in when they have not been seen.",
  },
  {
    name: "Insights",
    body: "The members who used to be here every week and quietly are not, surfaced before they disappear.",
  },
  {
    name: "Roles and access",
    body: "The pastor holds the church and delegates. A class leader never sees the congregation's giving.",
  },
];

/**
 * The FAQ.
 *
 * These are not questions we invented. Each one is a query people actually
 * put into a search engine about church software in Ghana, taken from what
 * ranks and from the "people also ask" boxes around those results:
 * what church management software is, what it costs here, whether there is
 * a free one, how a church takes MoMo, why foreign products fit badly, the
 * Data Protection Act duty, and how to get off paper.
 *
 * Two rules for the answers. Each opens with the answer itself in the first
 * sentence, because that is the part a search engine or an assistant lifts.
 * And each is useful to a church that never becomes a customer, because an
 * answer that only makes sense as a pitch does not get quoted anywhere.
 */
export const FAQS = [
  {
    q: "What is church management software?",
    a: "Church management software is one system holding the records a church currently keeps in several separate books: the membership register, attendance, giving, groups and classes, and the returns your denomination asks for. Instead of a register in the vestry, a cash book with the treasurer and a spreadsheet on somebody's laptop, each fact is recorded once and every total is worked out from it. In Fold nothing asks a member to install or sign in to anything, your staff record what happens.",
  },
  {
    q: "How much does church management software cost in Ghana?",
    a: "Products marketed to Ghanaian churches range from free tiers for small congregations to around USD 35 a month for international ones, billed per church rather than per member. For many churches the real cost is not the headline figure but the payment method, since foreign products bill in dollars by card. Fold is free for 30 days with no card and no commitment, so a church can judge it on a full quarter of its own records.",
  },
  {
    q: "Is there a free church management software?",
    a: "Yes, several offer a free tier, almost always capped by membership at somewhere between 50 and 100 people. That suits a young congregation and stops suiting you the week you pass the cap, which is worth checking before you put your whole register into one. Fold takes the other approach, a complete 30 day trial with nothing withheld, so you evaluate the whole thing rather than a slice of it.",
  },
  {
    q: "How can a church in Ghana collect tithes and offerings by mobile money?",
    a: "The simplest way is to display an official church MoMo number during the service, which many churches in Accra and Kumasi already do. The weakness is reconciliation, because money lands on a phone with no record of which member sent it or what it was for. A payment integration fixes that by prompting the member's own phone, recording the gift against their name and fund, and counting it as given only once they approve it. Whichever way you do it, register the number to the church and not to an individual.",
  },
  {
    q: "Why does church software built abroad not suit Ghanaian churches?",
    a: "Three reasons come up again and again. It assumes card giving rather than cash and mobile money. It assumes a single independent congregation rather than circuits, societies, Bible classes and denominational returns. And it assumes a fast connection that is always there. A church here can use such a product, but usually ends up keeping a parallel paper system for everything the software cannot express, which is the situation the software was bought to end.",
  },
  {
    q: "Does a church in Ghana need to register under the Data Protection Act?",
    a: "Yes. Under the Data Protection Act, 2012 (Act 843) a church is a data controller, because it holds personal data about living people for administration, welfare and communication, and data controllers must register with the Data Protection Commission and renew every two years. Religious belief is also special personal data under the Act, which raises the standard of care expected of you. Choosing software that separates your church's records from every other church's at the database level is part of meeting that duty rather than a substitute for registering.",
  },
  {
    q: "Does Fold work with WhatsApp?",
    a: "Not yet, and we would rather say so than imply otherwise. Fold sends SMS, which reaches every member with a phone, including the older members who are often the most faithful and the least likely to be on WhatsApp. A WhatsApp integration reaches the members already reachable and misses the ones hardest to reach, so we built the channel that covers everybody first. If WhatsApp check-in is the reason you are choosing software, Shepherd does it well and we would point you there.",
  },
  {
    q: "How do we move our church register from a book to a computer?",
    a: "Do not begin by typing the whole book. Import whatever is already typed, from Excel or Google Sheets, add the people who come every week, and let the rest of the book cross over as individuals come up for a wedding, a transfer or a funeral. Two things to watch in an export from Excel: format the phone column as text or the leading zero disappears, and write dates as 1990-04-03 so they cannot be read as March instead of April. Fold reads your own column headings rather than making you rename them.",
  },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
      {children}
    </p>
  );
}

/**
 * The phone section.
 *
 * Competitors lead with a member-facing app: devotionals, social feeds,
 * members paying their own tithes. Fold has none of that, so it does not
 * claim it. What is true here is quieter and more useful: the person doing
 * the work is a church secretary holding a phone at the back of a service,
 * and the whole product is built for that.
 */
const ON_PHONE = [
  {
    Icon: Smartphone,
    title: "Install it like an app",
    body: "Add Fold to your home screen from the browser. No app store, no download over a slow connection, no update to chase. It opens full screen like anything else on the phone.",
  },
  {
    Icon: ClipboardCheck,
    title: "Record the service from the back row",
    body: "Search a name, tap who came, save once. Marking a whole congregation is a single save, not one round trip per person, so it works on a weak signal.",
  },
  {
    Icon: HandCoins,
    title: "Take mobile money on the spot",
    body: "Send a prompt to a member's phone for MTN MoMo, Telecel Cash or AirtelTigo. Nothing counts as given until they approve it, so the books match the money.",
  },
  {
    Icon: TrendingDown,
    title: "See who has stopped coming",
    body: "The members who used to be here every week and quietly are not, ranked and ready to call, in your hand before you leave the building.",
  },
];

export function OnYourPhone() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Your church office, in your pocket.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          The register does not live on a computer in the vestry any more. It
          lives on the phone you already carry, and it works on the connection
          you actually have.
        </p>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {ON_PHONE.map(({ Icon, title, body }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <span
                aria-hidden="true"
                className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary"
              >
                <Icon size={30} strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 text-balance text-base font-bold leading-snug text-foreground">
                {title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-14 max-w-xl border-t border-border pt-6 text-sm text-muted-foreground">
          Nothing asks a member to install or sign in to anything. Your staff
          record what happens; the congregation never has to do a thing.
        </p>
      </div>
    </section>
  );
}

export function Modules() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-surface">
      <SectionBg variant="grid" />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <Eyebrow>Everything in one place</Eyebrow>
      <h2 className="mt-3 max-w-2xl text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        What your church stops keeping in separate books.
      </h2>

      <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <div key={m.name} className="border-t border-border pt-4">
            <h3 className="text-base font-bold text-foreground">{m.name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {m.body}
            </p>
          </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section className="border-t border-border">
      {/*
        FAQPage structured data. The same questions and answers the reader
        sees, in the form a search engine and an assistant can quote, which
        is what makes a page eligible to be cited rather than merely read.
        Generated from FAQS so the two can never drift apart.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            FAQ
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Questions churches ask
          </h2>
          <p className="mt-4 text-[15px] text-muted-foreground">
            Still not sure?{" "}
            <a
              href="#contact"
              className="rounded font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Send us a message
            </a>{" "}
            and a person will answer.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {FAQS.map((f) => (
            /*
              A real <details> rather than JavaScript state: it opens before
              hydration, it is keyboard operable for free, and a screen
              reader already knows what a disclosure is. That is also why
              this page stays fast.
            */
            <details
              key={f.q}
              className="group rounded-xl border border-border bg-surface transition-colors open:border-primary/30 hover:border-border-strong"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-5 py-4 text-left text-[15px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden="true"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-soft text-muted-foreground transition-transform group-open:rotate-45 group-open:bg-primary/10 group-open:text-primary"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="px-5 pb-5 text-[15px] leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#contact"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Send us a message
          </a>
          <a
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Start your free trial
          </a>
        </div>
      </div>
    </section>
  );
}
