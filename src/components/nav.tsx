"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { can, type Capability } from "@/lib/permissions";

// `as const` keeps the href literals narrow, typedRoutes is enabled in
// next.config.mjs, so Link rejects a widened `string`.
//
// `cap` hides a destination the role cannot use. This is convenience, not
// security, the matching RLS policy is what actually refuses the data.
//
// `primary` marks the four that earn a permanent place in the phone's bottom
// bar. The split is by what a church secretary touches on a Sunday, not by
// importance.
const LINKS = [
  { href: "/dashboard", label: "Dashboard", primary: true, icon: "home" },
  { href: "/members", label: "Members", primary: true, icon: "people" },
  { href: "/attendance", label: "Attendance", primary: true, icon: "check" },
  { href: "/contributions", label: "Giving", primary: true, icon: "cash", cap: "finance.view" },
  { href: "/groups", label: "Groups", icon: "people" },
  { href: "/visitors", label: "Visitors", icon: "people" },
  { href: "/funds", label: "Funds", icon: "cash", cap: "finance.view" },
  { href: "/records", label: "Records", icon: "doc" },
  { href: "/transfers", label: "Transfers", icon: "doc" },
  { href: "/insights", label: "Insights", icon: "chart" },
  { href: "/messages", label: "Messages", icon: "doc" },
  { href: "/reports", label: "Reports", icon: "doc" },
  { href: "/team", label: "Team", icon: "people", cap: "org.manage" },
] as const satisfies ReadonlyArray<{
  href: string;
  label: string;
  primary?: boolean;
  icon: string;
  cap?: Capability;
}>;

const PATHS: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  people:
    "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M21 20v-1a4 4 0 0 0-3-3.9M16.5 4.1a4 4 0 0 1 0 7.8",
  check: "M20 6 9 17l-5-5",
  cash: "M3 6h18v12H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  doc: "M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 13h6M9 17h6",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
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
      <path d={PATHS[name] ?? PATHS.doc} />
    </svg>
  );
}

export function Nav({ role }: { role: string }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const visible = LINKS.filter((l) => !("cap" in l) || can(role, l.cap));
  const primary = visible.filter((l) => "primary" in l && l.primary);
  const secondary = visible.filter((l) => !("primary" in l && l.primary));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* ---------- desktop: one row under the header ---------- */}
      <nav
        aria-label="Main"
        className="-mb-px hidden gap-1 overflow-x-auto px-6 sm:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {visible.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isActive(href)
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* ---------- phone: a fixed bottom bar ---------- */}
      {/*
        Thirteen destinations in a scrolling strip is unusable with a thumb,
        and anything off screen was effectively invisible. The four touched
        every Sunday get a permanent place within thumb reach; the rest open
        in a sheet.
      */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        <ul className="m-0 grid list-none grid-cols-5 p-0">
          {primary.map(({ href, label, icon }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setMoreOpen(false)}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                  isActive(href) ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon name={icon} />
                <span className="truncate">{label}</span>
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
                "flex min-h-14 w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                moreOpen || secondary.some((l) => isActive(l.href))
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
              {secondary.map(({ href, label, icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      isActive(href)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-surface-soft"
                    )}
                  >
                    <Icon name={icon} />
                    {label}
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
