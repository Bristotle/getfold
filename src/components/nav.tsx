"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { can, type Capability } from "@/lib/permissions";

// `as const` keeps the href literals narrow — typedRoutes is enabled in
// next.config.mjs, so Link rejects a widened `string`.
//
// `cap` hides a destination the role cannot use. This is convenience, not
// security — the matching RLS policy is what actually refuses the data.
const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/members", label: "Members" },
  { href: "/groups", label: "Groups" },
  { href: "/visitors", label: "Visitors" },
  { href: "/attendance", label: "Attendance" },
  { href: "/contributions", label: "Giving", cap: "finance.view" },
  { href: "/funds", label: "Funds", cap: "finance.view" },
  { href: "/records", label: "Records" },
  { href: "/transfers", label: "Transfers" },
  { href: "/insights", label: "Insights" },
  { href: "/messages", label: "Messages" },
  { href: "/reports", label: "Reports" },
  { href: "/team", label: "Team", cap: "org.manage" },
] as const satisfies ReadonlyArray<{
  href: string;
  label: string;
  cap?: Capability;
}>;

export function Nav({ role }: { role: string }) {
  const pathname = usePathname();
  const visible = LINKS.filter((l) => !("cap" in l) || can(role, l.cap));

  return (
    // These destinations don't fit a phone's width, and a church secretary
    // on a small screen still needs every one of them — so the bar scrolls
    // horizontally rather than wrapping into a tall stack or hiding items
    // behind a menu.
    <nav
      aria-label="Main"
      className="-mb-px flex gap-1 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {visible.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
