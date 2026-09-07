import { type ReactNode } from "react";
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

const STEPS = [
  {
    n: "1",
    title: "Set up your church",
    body: "Name, denomination, and you are in. Under a minute, and nothing else is compulsory.",
  },
  {
    n: "2",
    title: "Bring your register",
    body: "Already in Excel or Google Sheets? Upload the file. We match your column names rather than making you rename them.",
  },
  {
    n: "3",
    title: "Use it on Sunday",
    body: "Record the service, log the offering, and your dashboard and returns fill themselves in from there.",
  },
];

const FAQS = [
  {
    q: "Do our members need smartphones?",
    a: "No. Nothing asks a member to install or sign in to anything. Your staff record what happens; members never have to do a thing.",
  },
  {
    q: "Does it work if our giving is mostly cash?",
    a: "Yes, and that is the assumption it is built on. Cash is the default on every giving form. Mobile money sits alongside it for members who prefer it, and you can ignore it entirely.",
  },
  {
    q: "What if the internet is slow?",
    a: "Pages are light and the work is designed around few round trips. Marking a whole service's attendance is one save, not one per person.",
  },
  {
    q: "Can our circuit see our records?",
    a: "Only if you give them access. Each church's data is separated at the database level, not merely hidden in the interface, so no other church can read yours.",
  },
  {
    q: "Who can see what we give?",
    a: "The pastor, an administrator and a finance officer. An elder or class leader cannot open the giving records at all, and that is enforced by the database rather than by the menu.",
  },
  {
    q: "What happens to our data if we leave?",
    a: "It stays yours. You can export your register at any time, and we delete everything within 30 days of an account closing.",
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

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <Eyebrow>Getting started</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Set up on a Thursday, using it by Sunday.
        </h2>

        <ol className="m-0 mt-10 grid list-none gap-8 p-0 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="border-t-2 border-primary/30 pt-5">
              <span className="font-numeric text-sm font-bold text-primary">
                {s.n}
              </span>
              <h3 className="mt-2 text-base font-bold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Modules() {
  return (
    <section className="border-y border-border bg-surface">
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
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <Eyebrow>Questions churches ask</Eyebrow>
        <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Before you commit a single record.
        </h2>

        <div className="mt-8 flex flex-col">
          {FAQS.map((f) => (
            /*
              A real <details> rather than JavaScript state: it works before
              hydration, it is keyboard operable for free, and a screen
              reader already knows what an expandable disclosure is.
            */
            <details
              key={f.q}
              className="group border-b border-border py-4 first:border-t"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 rounded text-[15px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
