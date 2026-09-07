"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { can, type Capability } from "@/lib/permissions";

/**
 * The in-app navigation.
 *
 * This used to be thirteen flat destinations in a scrolling strip. The
 * competitive audit found that every church product sold self serve groups
 * into five to seven, and the only two with counts like ours are enterprise
 * systems sold by demo to organisations with dedicated administrators. A
 * secretary opening Fold for the first time had to guess where a transfer
 * lived.
 *
 * So: six groups, with a second row inside a group that has more than one
 * destination. No dropdown, because a dropdown needs JavaScript to open and
 * this has to work on the first paint on a weak connection.
 *
 * `as const` keeps the href literals narrow, since typedRoutes is on and
 * Link rejects a widened string. `cap` hides what a role cannot use, which
 * is convenience only: the matching RLS policy is what refuses the data.
 * `primary` marks the four that hold a permanent place in the phone's
 * bottom bar, chosen by what gets touched on a Sunday.
 */
const GROUPS = [
  {
    label: "Dashboard",
    icon: "home",
    primary: true,
    items: [{ href: "/dashboard", label: "Dashboard" }],
  },
  {
    label: "People",
    icon: "people",
    primary: true,
    items: [
      { href: "/members", label: "Members" },
      { href: "/groups", label: "Classes and groups" },
      { href: "/visitors", label: "Visitors" },
      { href: "/transfers", label: "Transfers" },
      { href: "/records", label: "Vital records" },
      { href: "/messages", label: "Messages" },
    ],
  },
  {
    label: "Attendance",
    icon: "check",
    primary: true,
    items: [
      { href: "/attendance", label: "Services" },
      { href: "/insights", label: "Insights" },
    ],
  },
  {
    label: "Giving",
    icon: "cash",
    primary: true,
    cap: "finance.view",
    items: [
      { href: "/contributions", label: "Contributions" },
      { href: "/funds", label: "Funds" },
    ],
  },
  {
    label: "Reports",
    icon: "chart",
    items: [{ href: "/reports", label: "Statistical return" }],
  },
  {
    label: "Team",
    icon: "shield",
    cap: "org.manage",
    items: [{ href: "/team", label: "Team" }],
  },
] as const satisfies ReadonlyArray<{
  label: string;
  icon: string;
  primary?: boolean;
  cap?: Capability;
  items: ReadonlyArray<{ href: string; label: string }>;
}>;

const PATHS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  people:
    "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 20v-1a4 4 0 0 0-3-3.9M16.5 4.1a4 4 0 0 1 0 7.8",
  check: "M20 6 9 17l-5-5",
  cash: "M3 6h18v12H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  shield: "M12 3l8 3v6c0 4.5-3.2 7.9-8 9-4.8-1.1-8-4.5-8-9V6z",
  more: "M5 12h.01M12 12h.01M19 12h.01",
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name] ?? PATHS.home} />
    </svg>
  );
}

export function Nav({ role }: { role: string }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const visible = GROUPS.filter((g) => !("cap" in g) || can(role, g.cap));
  const primary = visible.filter((g) => "primary" in g && g.primary);
  const secondary = visible.filter((g) => !("primary" in g && g.primary));

  // The group we are inside, which decides both the highlighted tab and
  // whether a second row appears.
  const current = visible.find((g) => g.items.some((i) => isActive(i.href)));
  // Narrowed together so the sub nav blocks can use both without TypeScript
  // losing track of `current` inside the JSX.
  const sub =
    current && current.items.length > 1
      ? { label: current.label, items: current.items }
      : null;

  return (
    <>
      {/* ---------- desktop: groups, then the group's own destinations ---------- */}
      <div className="hidden sm:block">
        <nav
          aria-label="Main"
          className="-mb-px flex gap-1 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visible.map((g) => (
            <Link
              key={g.label}
              href={g.items[0].href}
              aria-current={g === current ? "page" : undefined}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                g === current
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {g.label}
            </Link>
          ))}
        </nav>

        {sub && (
          <nav
            aria-label={sub.label}
            className="border-t border-border bg-surface-soft"
          >
            <ul className="m-0 flex list-none gap-1 overflow-x-auto px-6 py-1.5 p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sub.items.map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={isActive(i.href) ? "page" : undefined}
                    className={cn(
                      "block whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isActive(i.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* ---------- phone: the group's destinations as a strip ---------- */}
      {sub && (
        <nav
          aria-label={sub.label}
          className="border-b border-border bg-surface-soft sm:hidden"
        >
          <ul className="m-0 flex list-none gap-1 overflow-x-auto px-3 py-2 p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sub.items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={isActive(i.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-9 items-center whitespace-nowrap rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    isActive(i.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* ---------- phone: a fixed bottom bar ---------- */}
      {/*
        grid-cols-5 with min-w-0 on the items. Without that floor removed,
        the bar's min-content width expanded the whole document sideways.
      */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="m-0 grid list-none grid-cols-5 p-0 [&>li]:min-w-0">
          {primary.map((g) => (
            <li key={g.label}>
              <Link
                href={g.items[0].href}
                onClick={() => setMoreOpen(false)}
                aria-current={g === current ? "page" : undefined}
                className={cn(
                  "flex min-h-14 w-full min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-[10px] font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                  g === current ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon name={g.icon} />
                <span className="w-full truncate text-center">{g.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-controls="more-nav"
              className={cn(
                "flex min-h-14 w-full min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-[10px] font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                moreOpen || secondary.some((g) => g === current)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon name="more" />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 sm:hidden"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div
            id="more-nav"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-surface pb-[calc(3.5rem+env(safe-area-inset-bottom))] shadow-[0_-12px_40px_-16px_rgba(26,16,51,0.35)] sm:hidden"
          >
            <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-border" />
            <ul className="m-0 grid list-none grid-cols-2 gap-1 p-4">
              {secondary.map((g) => (
                <li key={g.label}>
                  <Link
                    href={g.items[0].href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={g === current ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      g === current
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-surface-soft"
                    )}
                  >
                    <Icon name={g.icon} />
                    {g.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
