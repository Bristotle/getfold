import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type ActiveOrg = {
  id: string;
  name: string;
  slug: string;
  type: string;
  denomination: string | null;
  parent_organization_id?: string | null;
};

/** The cookie naming which of a user's churches they are currently in. */
export const ACTIVE_ORG_COOKIE = "fold_org";

export type Membership = {
  role: string;
  organization: ActiveOrg;
};

/**
 * Resolves the signed-in user and the church they belong to.
 *
 * Reads go through supabase-js (anon key + the user's JWT), so RLS applies:
 * this can only ever return an organization the caller is actually a member
 * of. Never use the Prisma client for this, it connects with full database
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

  // Every membership, not just the first. A circuit superintendent belongs
  // to the circuit and to each of its societies, and needs to move between
  // them.
  const { data } = await supabase
    .from("organization_members")
    .select(
      "role, organizations ( id, name, slug, type, denomination, parent_organization_id )"
    )
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as {
    role: string;
    organizations: ActiveOrg | ActiveOrg[] | null;
  }[];

  // Honour the switcher's cookie, but only if the user actually belongs to
  // the church it names. A stale or forged cookie falls back to the first
  // membership rather than granting anything, and RLS would refuse the data
  // regardless.
  const wanted = (await cookies()).get(ACTIVE_ORG_COOKIE)?.value;
  const row =
    (wanted
      ? rows.find((r) => {
          const o = Array.isArray(r.organizations)
            ? r.organizations[0]
            : r.organizations;
          return o?.id === wanted;
        })
      : undefined) ?? rows[0];

  // PostgREST returns an embedded to-one relation as an object, but the
  // shape is only guaranteed once generated DB types exist, normalise
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

/**
 * Every church the signed-in user belongs to, parents before their
 * branches. Used by the switcher in the app header and by the branches
 * page. RLS means this can only ever return churches they are a member of.
 */
export async function listMemberships(): Promise<
  { role: string; organization: ActiveOrg }[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("organization_members")
    .select(
      "role, organizations ( id, name, slug, type, denomination, parent_organization_id )"
    )
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true });

  const list = ((data ?? []) as {
    role: string;
    organizations: ActiveOrg | ActiveOrg[] | null;
  }[])
    .map((r) => {
      const o = Array.isArray(r.organizations)
        ? r.organizations[0]
        : r.organizations;
      return o ? { role: r.role, organization: o } : null;
    })
    .filter((r): r is { role: string; organization: ActiveOrg } => r !== null);

  // Parents first, then their branches under them, so the switcher reads as
  // a tree rather than as creation order.
  const parents = list.filter((m) => !m.organization.parent_organization_id);
  const children = list.filter((m) => m.organization.parent_organization_id);
  return [
    ...parents.flatMap((p) => [
      p,
      ...children.filter(
        (c) => c.organization.parent_organization_id === p.organization.id
      ),
    ]),
    // Orphans: a branch whose parent this user does not belong to.
    ...children.filter(
      (c) =>
        !parents.some((p) => p.organization.id === c.organization.parent_organization_id)
    ),
  ];
}
