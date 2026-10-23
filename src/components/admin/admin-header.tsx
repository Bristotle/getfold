import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

const LINKS = [
  { href: "/admin/churches", label: "Churches" },
  { href: "/admin/sources", label: "Where churches come from" },
  { href: "/admin/enquiries", label: "Enquiries" },
] as const;

/**
 * The top of every Fold admin page.
 *
 * The logo takes you back to your own church's dashboard. Before this, the
 * admin pages were a dead end: the logo went nowhere and only one page
 * linked back, so leaving meant editing the address bar.
 */
export function AdminHeader({ current }: { current?: (typeof LINKS)[number]["href"] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <Link href="/dashboard" aria-label="Back to my church" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        <Logo />
      </Link>
      <nav aria-label="Fold admin" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={current === l.href ? "page" : undefined}
            className={current === l.href ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}
          >
            {l.label}
          </Link>
        ))}
        <Link href="/dashboard" className="font-medium text-primary hover:underline">
          Back to my church
        </Link>
      </nav>
    </div>
  );
}
