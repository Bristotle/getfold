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
};

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
