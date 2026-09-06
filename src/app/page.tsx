import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";

export const metadata: Metadata = {
  title: "Fold — Church management built for Ghanaian churches",
  description:
    "Members, attendance, tithes and statistical returns — configurable to your denomination's structure. Cash-first, with mobile money and SMS as options.",
};

const FEATURES = [
  {
    title: "The register, properly kept",
    body: "Members, Bible classes and fellowships, visitors, transfers. Member types are your words — Full Member, Catechumen, Covenant Member — not a fixed list someone else chose.",
  },
  {
    title: "Attendance in seconds",
    body: "A head count per service is enough. Tick off who came by name when you want to, and the register starts telling you who has quietly stopped coming.",
  },
  {
    title: "Tithes, offerings and funds",
    body: "Cash is the default, because that is how most people give. Mobile money sits alongside it for those ready, never in place of it.",
  },
  {
    title: "Returns without the spreadsheet",
    body: "Membership, attendance averages, baptisms and income for any period — laid out to print or save as PDF, drawn from what your team already recorded.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ---------- header ---------- */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-foreground">
            Fold
          </span>
          <Link href="/login">
            <Button size="sm" variant="secondary">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Built for how Ghanaian churches actually operate
          </p>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            Church management that fits your church — not a template.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Keep your membership register, attendance, tithes and vital records
            in one place — and produce the return your circuit asks for without
            rebuilding it in a spreadsheet every quarter.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/login">
              <Button size="lg">Get started</Button>
            </Link>
            <span className="text-sm text-muted-foreground">
              Set up your church in under a minute.
            </span>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
            {[
              ["Cash-first", "Mobile money optional"],
              ["Works on phones", "Not just office computers"],
              ["Your structure", "Society, circuit or diocese"],
            ].map(([term, desc]) => (
              <div key={term}>
                <dt className="text-sm font-semibold text-foreground">{term}</dt>
                <dd className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {desc}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:pl-4">
          <DashboardPreview />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Example figures, shown to illustrate the dashboard.
          </p>
        </div>
      </section>

      {/* ---------- the argument ---------- */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Most church software is built for somewhere else, then translated.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              It assumes card payments, weekly small groups and a membership
              model that does not match a Methodist society, a Presbyterian
              congregation or an independent assembly. Fold starts from how your
              church is actually organised — and stays out of the way of the
              parts that already work.
            </p>
          </div>

          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-t border-border pt-5">
                <h3 className="text-base font-bold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- the differentiator ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              The part that saves a whole evening
            </p>
            <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Your statistical return, already filled in.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Membership by class, attendance averages, baptisms and
              confirmations, income by type — for whatever period you choose.
              Print it, or save it as a PDF. Nothing is entered twice, because
              it comes from the records your team kept through the quarter.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Class leaders see their class. Finance officers see the money.
              Ministers see both. That separation is enforced by the database
              itself, not just hidden in the interface.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold text-foreground">
              Shekinah Prayer Ministry International
            </p>
            <p className="text-xs text-muted-foreground">
              Statistical return · 1 January to 30 September
            </p>
            <div className="mt-5 grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {[
                ["Total active members", "248"],
                ["Male / Female", "104 / 144"],
                ["Joined in period", "31"],
                ["Average attendance", "312"],
                ["Baptisms", "17"],
                ["Confirmations", "9"],
                ["Weddings", "4"],
                ["Total income", "GHS 61,240"],
              ].map(([label, value], i, arr) => (
                <div
                  key={label}
                  className={`flex items-baseline justify-between gap-4 py-2 ${
                    i < arr.length - 2 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="font-numeric text-sm font-semibold tabular-nums text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Example figures.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- close ---------- */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center lg:py-20">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Set up your church tonight, use it on Sunday.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Start with your members. Add attendance and giving when you are
            ready. Nothing is compulsory, and nothing depends on mobile money or
            a fast connection.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/login">
              <Button size="lg">Get started</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span className="font-bold text-foreground">Fold</span>
          <span>Church management for Ghanaian churches.</span>
        </div>
      </footer>
    </div>
  );
}
