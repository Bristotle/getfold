import {
  CalendarClock,
  Banknote,
  Wallet,
  Landmark,
  Smartphone,
  ShieldCheck,
  Lock,
  BadgeCheck,
} from "lucide-react";
import { SectionBg } from "@/components/marketing/section-bg";

/**
 * The trust section.
 *
 * Eight short reasons, each one a claim we can actually stand behind and
 * point at in the product. That constraint is the whole value of the
 * section: a grid of eight vague virtues reads as filler, and a church
 * comparing three products can tell the difference immediately.
 *
 * The three that do the most work are the last three, because they are the
 * ones nobody else here can honestly say: separation enforced by Postgres,
 * giving hidden from class leaders by the same mechanism, and an export you
 * can take away.
 */
const REASONS = [
  {
    Icon: CalendarClock,
    title: "Set up in an evening",
    body: "Create your church, bring in the register you already keep, and record Sunday's service. No installation, no training day, no consultant.",
  },
  {
    Icon: Banknote,
    title: "Cash first, always",
    body: "Cash is the default on every giving form. Mobile money sits beside it for members ready for it, and stays out of the way when you are not.",
  },
  {
    Icon: Landmark,
    title: "Your denomination's words",
    body: "Society, circuit, class or assembly. Member types are the ones your church uses, not a fixed list somebody else chose.",
  },
  {
    Icon: Smartphone,
    title: "Built for a phone on a weak signal",
    body: "Install it from the browser, with no app store. Marking a whole service is one save, not one round trip per person.",
  },
  {
    Icon: ShieldCheck,
    title: "No other church can read yours",
    body: "Each church's records are separated at the database level by Postgres itself, rather than merely hidden behind a menu.",
  },
  {
    Icon: Wallet,
    title: "Your money goes straight to you",
    body: "Mobile money giving is paid directly into your church's own account. It never passes through Fold, and we take nothing from what your members give.",
  },
  {
    Icon: Lock,
    title: "Only leadership sees the giving",
    body: "The pastor, an administrator and a finance officer. A class leader cannot open the giving records at all, and the database enforces it.",
  },
  {
    Icon: BadgeCheck,
    title: "30 days free, then your call",
    body: "No card to start and nothing to cancel. Export your register whenever you like, and we delete everything within 30 days of an account closing.",
  },
];

export function WhyTrust() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-surface">
      <SectionBg variant="grid" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        {/* ---------- heading ---------- */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-primary"
            />
            Why churches trust Fold
          </p>
          <h2 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            We put{" "}
            <span className="italic text-primary">your church</span> first.
            Always.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
            Fold is built in Ghana around how a denomination actually works,
            and it shows in the small decisions: your words before ours, cash
            before card, phones before office computers.
          </p>
        </div>

        {/* ---------- the eight ---------- */}
        <ul className="m-0 mt-14 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ Icon, title, body }) => (
            <li
              key={title}
              className="rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/30"
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
  );
}
