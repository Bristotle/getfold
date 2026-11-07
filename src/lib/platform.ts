/** Support access to churches. See supabase/migrations/0046_platform_viewer.sql. */

export type DirectoryRow = {
  organization_id: string;
  name: string;
  type: string;
  denomination: string | null;
  subscription_status: string;
  trial_ends_at: string | null;
  created_at: string;
  member_count: number;
  pastor_email: string | null;
  team_count: number;
  /** Last change by the church itself. Fold support's visits do not count. */
  last_active_at: string | null;
  changes_this_week: number;
  last_sign_in_at: string | null;
  /** The phone the church gave when it was set up. */
  church_phone: string | null;
  /** Pastor first, then administrators. */
  leaders: Leader[];
  last_contacted_at: string | null;
  last_contact_note: string | null;
};

export type Leader = {
  name: string | null;
  role: string;
  email: string | null;
  phone: string | null;
};

const DAY = 86_400_000;

/**
 * Why somebody at Fold should phone this church, or null if nothing says so.
 *
 * Plain rules a person can check against the row, in order of urgency. A
 * church phoned in the last seven days is left alone, so the list is the
 * calls still to make rather than the ones already made.
 */
export function reasonToCall(r: DirectoryRow, now = Date.now()): string | null {
  if (r.last_contacted_at && now - new Date(r.last_contacted_at).getTime() < 7 * DAY) return null;

  const age = now - new Date(r.created_at).getTime();
  const quiet = !r.last_active_at || now - new Date(r.last_active_at).getTime() > 14 * DAY;
  const ends = r.trial_ends_at ? Math.ceil((new Date(r.trial_ends_at).getTime() - now) / DAY) : null;

  if (r.subscription_status === "expired") return "Read only now. Ask what would bring them back.";
  if (r.subscription_status === "grace") return "Trial has ended and they have not paid.";
  if (ends !== null && ends >= 0 && ends <= 7) {
    return r.subscription_status === "active"
      ? `Paid cover ends in ${ends} day${ends === 1 ? "" : "s"}.`
      : `Trial ends in ${ends} day${ends === 1 ? "" : "s"}.`;
  }
  if (age > 3 * DAY && quiet) return `Nothing recorded since ${r.last_active_at ? ago(r.last_active_at) : "they joined"}.`;
  if (age > 7 * DAY && Number(r.member_count) < 5) return "Has not brought its register in yet.";
  return null;
}

/** "3 hours ago", "yesterday", "12 Oct": how a person would say it. */
export function ago(iso: string | null): string {
  if (!iso) return "never";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(iso));
}

export const STATUS_LABEL: Record<string, string> = {
  trialing: "Trial",
  grace: "Grace period",
  expired: "Read only",
  active: "Paying",
  cancelled: "Cancelled",
};
