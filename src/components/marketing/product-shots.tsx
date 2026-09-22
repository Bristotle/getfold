import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The product, photographed.
 *
 * Every screenshot here is a real page of Fold, taken by
 * scripts/demo-screens.mjs from a seeded demonstration society that is
 * deleted afterwards. Nothing is mocked up, so nothing is shown that the
 * product cannot do. When the product changes, the script is run again
 * and the pictures follow; nobody edits a PNG.
 */
export const SHOTS = {
  dashboard: {
    src: "/screens/dashboard.webp",
    small: "/screens/dashboard-720.webp",
    alt: "The Fold dashboard for a Methodist society: 186 active members, this week's attendance, giving this month with the tithe named beneath, birthdays to announce, and attendance charted by service and by sex.",
    caption: "The dashboard. Members, attendance and giving as they stand, and the birthdays to announce on Sunday.",
    href: "/features/leadership-management",
  },
  members: {
    src: "/screens/members.webp",
    small: "/screens/members-720.webp",
    alt: "The members register in Fold, each member with their class, membership category and phone number, searchable.",
    caption: "The register, with each member's class and category in the church's own words.",
    href: "/features/member-management",
  },
  giving: {
    src: "/screens/giving.webp",
    small: "/screens/giving-720.webp",
    alt: "The giving page in Fold: tithes and offerings by member, cash and mobile money side by side, each with its date and reference.",
    caption: "Giving. Cash counted on Sunday and mobile money through the week, in one ledger.",
    href: "/features/financial-management",
  },
  reports: {
    src: "/screens/reports.webp",
    small: "/screens/reports-720.webp",
    alt: "The statistical return in Fold for a chosen period: membership by sex, attendance averaged per service, vital records and outreach, with a print or save as PDF button.",
    caption: "The statistical return, for any period, produced from what was recorded.",
    href: "/help/reports/statistical-return",
  },
  insights: {
    src: "/screens/insights.webp",
    small: "/screens/insights-720.webp",
    alt: "The insights page in Fold listing members who have drifted from their own attendance pattern.",
    caption: "Insights. Who has quietly stopped coming, compared with their own pattern.",
    href: "/features/leadership-management",
  },
  phone: {
    src: "/screens/dashboard-phone.webp",
    small: "/screens/dashboard-phone.webp",
    alt: "The Fold dashboard on a phone, showing the same figures in a single column.",
    caption: "The same dashboard on a phone.",
    href: "/features/leadership-management",
  },
} as const;

export type ShotKey = keyof typeof SHOTS;

const DEMO_NOTE =
  "Screenshots are from a demonstration society with invented members. The pages are the real product.";

/** One screenshot in a plain frame with a caption beneath. */
export function Shot({
  id,
  priority = false,
  className = "",
}: {
  id: ShotKey;
  priority?: boolean;
  className?: string;
}) {
  const s = SHOTS[id];
  const phone = id === "phone";
  return (
    <figure className={`m-0 min-w-0 ${className}`}>
      <div className={`overflow-hidden rounded-xl border border-border bg-surface ${phone ? "mx-auto max-w-[300px]" : ""}`}>
        <img
          src={s.src}
          srcSet={phone ? undefined : `${s.small} 720w, ${s.src} 1280w`}
          sizes={phone ? "300px" : "(min-width: 1024px) 960px, 100vw"}
          alt={s.alt}
          width={phone ? 390 : 1280}
          height={phone ? 844 : 800}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.caption}</figcaption>
    </figure>
  );
}

/** The homepage section: the dashboard large, three pages beneath it. */
export function ProductShots() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What it looks like
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            A Methodist society of 186 members on a Monday morning. Sunday is
            already counted.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <Shot id="dashboard" />
        </div>

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {(["members", "giving", "reports"] as const).map((k) => (
            <Link
              key={k}
              href={SHOTS[k].href as "/"}
              className="group min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <figure className="m-0">
                <div className="overflow-hidden rounded-xl border border-border bg-background transition-colors group-hover:border-primary/40">
                  <img
                    src={SHOTS[k].small}
                    alt={SHOTS[k].alt}
                    width={720}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </div>
                <figcaption className="mt-3 flex items-start justify-between gap-3 text-sm leading-relaxed text-muted-foreground">
                  <span>{SHOTS[k].caption}</span>
                  <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" className="mt-1 shrink-0 text-primary" />
                </figcaption>
              </figure>
            </Link>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-muted-foreground">{DEMO_NOTE}</p>
      </div>
    </section>
  );
}
