import { createClient } from "@/lib/supabase/server";

export type ActiveOrg = {
  id: string;
  name: string;
  slug: string;
  type: string;
  denomination: string | null;
};

export type Membership = {
  role: string;
  organization: ActiveOrg;
};

/**
 * Resolves the signed-in user and the church they belong to.
 *
 * Reads go through supabase-js (anon key + the user's JWT), so RLS applies:
 * this can only ever return an organization the caller is actually a member
 * of. Never use the Prisma client for this — it connects with full database
 * privileges and bypasses RLS entirely.
 *
 * A user with no membership is a normal state, not an error: it's what a
 * freshly-signed-up account looks like before onboarding.
 */
export async function getMembership(): Promise<{
  userId: string | null;
  email: string | null;
  membership: Membership | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userId: null, email: null, membership: null };

  const { data } = await supabase
    .from("organization_members")
    .select("role, organizations ( id, name, slug, type, denomination )")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  const row = data?.[0] as
    | { role: string; organizations: ActiveOrg | ActiveOrg[] | null }
    | undefined;

  // PostgREST returns an embedded to-one relation as an object, but the
  // shape is only guaranteed once generated DB types exist — normalise
  // both forms so callers never have to care.
  const org = Array.isArray(row?.organizations)
    ? row?.organizations[0]
    : row?.organizations;

  return {
    userId: user.id,
    email: user.email ?? null,
    membership: row && org ? { role: row.role, organization: org } : null,
  };
}
