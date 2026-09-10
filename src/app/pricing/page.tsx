import type { Metadata } from "next";
import Link from "next/link";
import { Check, Info, Banknote, Cake, HandHeart, MessageCircleHeart } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { TIERS, cedis, quarterly, annual, ANNUAL_MONTHS_CHARGED } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing in cedis, Fold church software",
  description:
    "From GHS 149 a month for a single congregation. Billed quarterly, the same cycle as your statistical return. 30 days free with no card, and the price is held for a year.",
};

/**
 * The pricing page.
 *
 * Every question a Ghanaian church treasurer actually asks is answered on
 * the page rather than left for an email: what happens when we grow, what
 * happens if we stop paying, how do we pay without a card, and is this per
 * member or per church.
 *
 * The FAQ carries FAQPage markup, so the answers are quotable by a search
 * engine and by an assistant. Pricing questions are among the highest
 * intent searches there are.
 */
/**
 * The four a pastor repeats to another pastor.
 *
 * Each is describable in one true sentence, which is the test. The
 * settlement one is the strongest because no competitor audited makes any
 * claim about where a member's giving actually lands, and the three texts
 * are the strongest because they are work a church currently does by
 * memory or not at all.
 */
const HIGHLIGHTS = [
  {
    Icon: Banknote,
    title: "Your money goes straight to your church",
    body: "When a member gives by mobile money it is paid directly into your church's own account, MoMo or bank. It does not pass through Fold at any point and we take nothing from it.",
  },
  {
    Icon: Cake,
    title: "Birthday greetings, sent on the morning",
    body: "From the dates of birth already on your register, in your church's name, once a year and never twice. Nobody has to remember, and the dashboard tells you who to bless on Sunday.",
  },
  {
    Icon: MessageCircleHeart,
    title: "A welcome for every new member",
    body: "Added to the register on Sunday, welcomed by name the same day, from your church rather than from a number they do not recognise.",
  },
  {
    Icon: HandHeart,
    title: "A thank you for every tithe and offering",
    body: "Recorded and acknowledged, so a member who gave by mobile money on Tuesday knows it arrived without having to ask the treasurer on Sunday.",
  },
];

const FAQS = [
  {
    q: "Is this per member or per church?",
    a: "Per church. The band you fall into depends on how many members you have, but you pay one price for the whole church and every person on your team is included. Nobody is charged per login.",
  },
  {
    q: "What happens when our membership grows past a band?",
    a: "Nothing, for a year. Your price is held for twelve months from the day you start, even if you grow past the band. After that we move you to the band you are actually in, and we tell you before we do it rather than after.",
  },
  {
    q: "How do we pay without a credit card?",
    a: "Mobile money or bank transfer. MTN MoMo, Telecel Cash and AirtelTigo Money all work, and we can invoice a circuit or diocese by bank transfer if your treasurer needs a document for the books. No card is needed at any point, including to start the trial.",
  },
  {
    q: "Why quarterly rather than monthly?",
    a: "Because your statistical return is quarterly, so your bill may as well be. It matches how most church treasurers budget, and it means one payment to arrange every three months rather than twelve a year. You can pay for a year instead and we charge ten months rather than twelve.",
  },
  {
    q: "What happens at the end of the 30 day trial?",
    a: "We tell you it is ending, at seven days, three days, one day and on the day. If you decide not to continue, nothing is deleted and nothing is locked. Your register stays yours, you can export the whole thing whenever you like, and we delete everything within 30 days of an account closing.",
  },
  {
    q: "Whose name do the texts come from?",
    a: "Yours. You choose a short name, up to 11 characters, and that is what your members see instead of a phone number: SHEKINAH, or ICGC, or whatever your church is known by. One thing to know: the first message from a new name is held while the mobile networks approve it, which takes a little while, so send one to your own phone before you rely on it for a whole congregation. Every message after that arrives normally.",
  },
  {
    q: "Do the automatic messages send whether we want them or not?",
    a: "No. All three are switched off until you turn them on, one by one, and you can turn any of them off again at any time. Texting your congregation is your relationship with them to manage, not ours.",
  },
  {
    q: "Is there a setup fee, or a contract?",
    a: "Neither. There is nothing to sign, no minimum term and no setup fee. On the Large Society band we move your register across for you, and that is included rather than billed.",
  },
  {
    q: "We are a circuit with several societies. How does that work?",
    a: "Talk to us. Each society keeps its own register and its own team, and one account oversees them all, which is not something a per congregation price handles sensibly. We agree a rate for the circuit, and it is almost always less than each society paying separately.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

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

      <main id="main">
        {/* ---------- hero ---------- */}
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              Pricing
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Priced in cedis, billed like your return
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Thirty days free with no card. After that, one price for the
              whole church, paid every quarter by mobile money or bank
              transfer. No contract and no setup fee.
            </p>
          </div>
        </section>

        {/* ---------- tiers ---------- */}
        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="grid" />
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <ul className="m-0 grid list-none gap-5 p-0 lg:grid-cols-2 xl:grid-cols-4">
              {TIERS.map((t) => (
                <li
                  key={t.slug}
                  className={`flex flex-col rounded-2xl border bg-background p-6 ${
                    t.featured
                      ? "border-primary/50 shadow-[0_18px_50px_-24px_rgba(107,47,217,0.4)]"
                      : "border-border"
                  }`}
                >
                  {t.featured && (
                    <span className="mb-4 self-start rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                      Most churches
                    </span>
                  )}

                  <h2 className="text-lg font-bold text-foreground">{t.name}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t.who}
                  </p>

                  <div className="mt-5 border-t border-border pt-5">
                    {t.monthly === null ? (
                      <>
                        <p className="font-serif text-3xl font-bold text-foreground">
                          Let&apos;s talk
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          A rate for the whole circuit
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="flex items-baseline gap-1.5">
                          <span className="font-numeric font-serif text-4xl font-bold text-foreground">
                            {cedis(t.monthly)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / month
                          </span>
                        </p>
                        <p className="mt-1.5 font-numeric text-xs text-muted-foreground">
                          {cedis(quarterly(t.monthly))} billed quarterly, or{" "}
                          {cedis(annual(t.monthly))} a year
                        </p>
                      </>
                    )}
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary">
                      {t.memberLimit}
                    </p>
                  </div>

                  <ul className="m-0 mt-5 flex flex-1 list-none flex-col gap-2.5 border-t border-border p-0 pt-5">
                    {t.highlights.map((h) => (
                      <li key={h} className="flex gap-2.5">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-primary"
                        >
                          <Check size={15} strokeWidth={2.6} />
                        </span>
                        <span className="text-sm leading-relaxed text-foreground/85">
                          {h}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {t.monthly === null ? (
                      <Link
                        href="/contact"
                        className="flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        Talk to us
                      </Link>
                    ) : (
                      <Link
                        href="/signup"
                        className={`flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                          t.featured
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border border-border bg-surface text-foreground hover:bg-surface-soft"
                        }`}
                      >
                        Start 30 days free
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mx-auto mt-8 flex max-w-3xl gap-3.5 rounded-xl border border-primary/25 bg-primary-soft p-5">
              <span aria-hidden="true" className="mt-0.5 shrink-0 text-primary">
                <Info size={18} strokeWidth={2} />
              </span>
              <p className="text-[15px] leading-relaxed text-foreground/85">
                <strong className="font-semibold">
                  Your price is held for twelve months
                </strong>{" "}
                from the day you start, even if your membership grows past the
                band. Paying for a year costs{" "}
                {ANNUAL_MONTHS_CHARGED} months rather than twelve.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- what every band includes ---------- */}
        <section className="relative isolate overflow-hidden border-y border-border">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              Every band gets the whole product
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              There is no feature held back for a higher price. The bands
              differ by how many members you have, and at the top by how much
              of the setting up we do for you. A small society gets the same
              statistical return as a large one, because a small society has
              to file the same return.
            </p>
            <ul className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2">
              {[
                "Your denomination's structure and words",
                "The statistical return, any period",
                "Members, classes, visitors and transfers",
                "Attendance, by head count or by name",
                "Tithes, offerings and funds",
                "Baptisms, confirmations, weddings, funerals",
                "Unlimited people on your team",
                "Export everything, any day",
              ].map((f) => (
                <li key={f} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-primary">
                    <Check size={15} strokeWidth={2.6} />
                  </span>
                  <span className="text-[15px] leading-relaxed text-foreground/85">
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- the four that sell it ---------- */}
        <section className="relative isolate overflow-hidden border-b border-border bg-surface">
          <SectionBg variant="orbs" />
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                On every band
              </p>
              <h2 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                The things churches tell other churches about
              </h2>
            </div>

            <ul className="m-0 mt-12 grid list-none gap-5 p-0 sm:grid-cols-2">
              {HIGHLIGHTS.map(({ Icon, title, body }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-border bg-background p-6"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"
                  >
                    <Icon size={22} strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-5 text-balance text-base font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section className="relative isolate overflow-hidden">
          <SectionBg variant="orbs" />
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              What churches ask about the price
            </h2>

            <div className="mt-10 flex flex-col gap-3">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-border bg-surface transition-colors open:border-primary/30"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-5 py-4 text-left text-[15px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-soft text-muted-foreground transition-transform group-open:rotate-45 group-open:bg-primary/10 group-open:text-primary"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
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
          </div>
        </section>

        {/* ---------- close ---------- */}
        <section className="relative isolate overflow-hidden border-t border-border bg-primary text-primary-foreground">
          <SectionBg variant="mesh" />
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Find out on your own records first
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-primary-foreground/85">
              Thirty days, the whole product, no card and nothing to cancel.
              Bring the register you already keep and we will help you move it
              across.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary-foreground px-6 text-base font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Start your free trial
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primary-foreground/40 px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Ask about a circuit rate
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
