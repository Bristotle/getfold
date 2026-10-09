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
};

export const STATUS_LABEL: Record<string, string> = {
  trialing: "Trial",
  grace: "Grace period",
  expired: "Read only",
  active: "Paying",
  cancelled: "Cancelled",
};
