import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, X } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";

export const metadata: Metadata = {
  title: "Fold compared with Asoriba, Shepherd and the rest",
  description:
    "An honest comparison of Fold against Asoriba, Shepherd, ChurchCast, DaChurchMan and the international products, including the cases where you should choose one of them instead.",
};

/**
 * The comparison page.
 *
 * Two rules, and the page is worthless without either.
 *
 * Every row must be checkable on the competitor's own public site. Nothing
 * here is inferred from a feeling about a rival, and where their material
 * does not say, the cell says it does not say rather than guessing low.
 *
 * And the page has to name the cases where somebody should buy a
 * competitor. A comparison where the author wins every row is an advert,
 * and every reader knows it. The section at the bottom is the part that
 * makes the rest believable.
 */
type Cell = "yes" | "no" | "partial" | string;

const COLUMNS = ["Fold", "Shepherd", "Asoriba", "ChurchCast", "Breeze"] as const;

const ROWS: { feature: string; note?: string; cells: Cell[] }[] = [
  {
    feature: "Denominational structure",
    note: "Societies, circuits, Bible classes, catechumens",
    cells: ["yes", "no", "no", "no", "no"],
  },
  {
    feature: "Statistical return for a circuit",
    note: "Membership, attendance, vital records and income in one document",
    cells: ["yes", "no", "no", "no", "no"],
  },
  {
    feature: "Member types you name yourself",
    cells: ["yes", "partial", "partial", "partial", "partial"],
  },
  {
    feature: "Mobile money giving",
    cells: ["yes", "yes", "yes", "yes", "no"],
  },
  {
    feature: "SMS to members",
    cells: ["yes", "yes", "yes", "yes", "yes"],
  },
  {
    feature: "WhatsApp check-in",
    cells: ["no", "yes", "no", "no", "no"],
  },
  {
    feature: "Member facing mobile app",
    cells: ["no", "no", "yes", "yes", "yes"],
  },
  {
    feature: "Multi branch or multi campus",
    cells: ["no", "no", "yes", "yes", "no"],
  },
  {
    feature: "Payroll, HR and assets",
    cells: ["no", "no", "no", "no", "no"],
  },
  {
    feature: "Import from Excel reading your own headings",
    cells: ["yes", "no", "no", "no", "partial"],
  },
  {
    feature: "Export your whole register at any time",
    cells: ["yes", "no", "no", "no", "yes"],
  },
  {
    feature: "Says how tenant separation is enforced",
    note: "Whether the product explains what stops another church reading yours",
    cells: ["yes", "no", "no", "no", "no"],
  },
  {
    feature: "Priced in cedis",
    cells: ["yes", "yes", "no", "no", "no"],
  },
  {
    feature: "Price published on the site",
    cells: ["no", "yes", "no", "partial", "yes"],
  },
  {
    feature: "Free tier or trial",
    cells: ["30 days, full", "Free to 50", "Not stated", "Not stated", "30 days"],
  },
];

function CellMark({ value }: { value: Cell }) {
  if (value === "yes") {
    return (
      <>
        <span className="sr-only">Yes</span>
        <span aria-hidden="true" className="text-success-text">
          <Check size={17} strokeWidth={2.6} />
        </span>
      </>
    );
  }
  if (value === "no") {
    return (
      <>
        <span className="sr-only">No</span>
        <span aria-hidden="true" className="text-muted-foreground/50">
          <X size={17} strokeWidth={2.2} />
        </span>
      </>
    );
  }
  if (value === "partial") {
    return (
      <>
        <span className="sr-only">Partly</span>
        <span aria-hidden="true" className="text-warning-text">
          <Minus size={17} strokeWidth={2.6} />
        </span>
      </>
    );
  }
  return <span className="text-xs font-medium text-foreground/80">{value}</span>;
}

/** When somebody genuinely should not buy Fold. */
const CHOOSE_OTHERS = [
  {
    name: "Choose Shepherd",
    body: "if WhatsApp is how your church actually communicates and you want check-in and giving to run through it, or if you want to see a price before you talk to anybody. They publish tiers from GHS 99 and a free tier up to 50 members, and their youth tracking follows Ghana's education stages, which we do not model at all.",
  },
  {
    name: "Choose Asoriba",
    body: "if you want a branded app in your members' hands and you are running several branches today. They have been at this since 2016, they carry over a thousand churches, and branch management is a first class part of their product rather than something on our roadmap.",
  },
  {
    name: "Choose ChurchCast",
    body: "if a custom branded app with sermons, devotionals and a feed is the point of the exercise, or if you are multi campus. They publish their giving fees plainly, at 1.7 per cent on mobile money.",
  },
  {
    name: "Choose DaChurchMan or Msoft",
    body: "if you need payroll, HR, asset registers and full accounting inside the same system. Between them they run more than a dozen modules of that kind and we run none of them, on purpose.",
  },
  {
    name: "Choose Breeze, ChurchTrac or Planning Center",
    body: "if your giving is mostly by card, your connection is reliable, and you are one independent congregation without a denominational return to file. They are mature, well built products, and paying in dollars is not a problem for every church.",
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              Compare
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              How Fold compares, including where it loses
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Every row below is checkable on the other product&apos;s own
              website. Where we do not have something, the table says so, and
              the last section names the churches that should buy somebody
              else.
            </p>
          </div>
        </section>

        {/* ---------- the table ---------- */}
        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="overflow-x-auto rounded-2xl border border-border bg-background">
              <table className="w-full min-w-[46rem] border-collapse text-sm">
                <caption className="sr-only">
                  Feature comparison of Fold against Shepherd, Asoriba,
                  ChurchCast and Breeze
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="border-b border-border px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      Feature
                    </th>
                    {COLUMNS.map((c) => (
                      <th
                        key={c}
                        scope="col"
                        className={`border-b border-border px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide ${
                          c === "Fold" ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.feature}>
                      <th
                        scope="row"
                        className="border-b border-border/60 px-4 py-3.5 text-left align-top font-medium text-foreground"
                      >
                        {r.feature}
                        {r.note && (
                          <span className="mt-0.5 block text-xs font-normal leading-snug text-muted-foreground">
                            {r.note}
                          </span>
                        )}
                      </th>
                      {r.cells.map((cell, i) => (
                        <td
                          key={COLUMNS[i]}
                          className={`border-b border-border/60 px-3 py-3.5 text-center align-top ${
                            i === 0 ? "bg-primary/[0.04]" : ""
                          }`}
                        >
                          <span className="inline-flex items-center justify-center">
                            <CellMark value={cell} />
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Checked against each product&apos;s published material in
              September 2026. A dash means partly, or available in a way that
              does not match the description. Products change; if you find a
              row that is out of date, tell us and we will correct it.
            </p>
          </div>
        </section>

        {/* ---------- the honest part ---------- */}
        <section className="relative isolate overflow-hidden border-y border-border">
          <SectionBg variant="orbs" />
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Read this part
            </p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              When you should buy somebody else
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              A comparison where the author wins every row is an advert, and
              you already know it. Here are the churches Fold is genuinely the
              wrong answer for.
            </p>

            <ul className="m-0 mt-10 flex list-none flex-col gap-5 p-0">
              {CHOOSE_OTHERS.map((c) => (
                <li
                  key={c.name}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <h3 className="text-base font-bold text-foreground">
                    {c.name}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- where we win ---------- */}
        <section className="relative isolate overflow-hidden">
          <SectionBg variant="grid" />
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              And when Fold is the right answer
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              If your church files a return to a circuit, a presbytery, a
              diocese or a district, you are the church nobody else in this
              table is building for. Every product above, local and
              international, models one independent congregation. None of them
              knows what a class leader is, or a catechumen, or a society, or
              why the quarterly return costs somebody an entire evening.
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              We also tell you what enforces the separation between your
              records and another church&apos;s, which no other product on this
              page attempts, and we say plainly which parts of Fold need a few
              weeks of history before they are worth anything.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Start your 30 day free trial
              </Link>
              <Link
                href="/features"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface px-6 text-base font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                See every feature
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
