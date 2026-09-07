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
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Start your free trial
          </a>
        </div>
      </div>
    </section>
  );
}
