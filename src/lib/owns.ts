import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Confirms a referenced row belongs to the caller's church.
 *
 * Actions correctly set `organization_id` from the server session, and RLS
 * validates that column. But foreign keys arriving from a form
 * (`memberId`, `groupId`, `recordId`) were never checked. RLS only sees the
 * `organization_id` we supply, which is genuinely ours, so it permits a row
 * that points at another church's record.
 *
 * Verified in the audit: a church could record a contribution against
 * another church's member, assign its own member into a foreign group, and
 * check someone in against a foreign service. No data crossed back, because
 * RLS still refuses the read, and the other church's figures were unchanged.
 * The damage is referential: rows pointing at records their owner cannot see.
 *
 * The durable fix is composite foreign keys on `(id, organization_id)`, which
 * cannot be forgotten in a future action. This is the tactical guard until
 * that migration is worth the churn.
 *
 * Returns false when the id is absent, malformed, or belongs elsewhere. The
 * lookup runs under the caller's own RLS, so a foreign row simply returns
 * nothing.
 */
export async function ownsRow(
  table:
    | "members"
    | "member_groups"
    | "attendance_records"
    | "funds"
    | "visitors"
    | "member_transfers"
    | "vital_records",
  id: string | null | undefined,
  organizationId: string
): Promise<boolean> {
  if (!id) return false;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  // A malformed uuid errors rather than returning empty. Treat that as
  // "not ours" instead of leaking the database's complaint to the user.
  if (error) return false;
  return !!data;
}

/**
 * The same check for an optional reference: an absent id is fine, a present
 * one must belong to us. Used where the field is genuinely optional, such as
 * attributing a contribution to a member or putting a member in a group.
 */
export async function ownsOptionalRow(
  table: Parameters<typeof ownsRow>[0],
  id: string | null | undefined,
  organizationId: string
): Promise<boolean> {
  if (!id) return true;
  return ownsRow(table, id, organizationId);
}
