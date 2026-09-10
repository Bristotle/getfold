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
export type TreeNode = {
  role: string | null;
  organization: ActiveOrg;
  depth: number;
  children: TreeNode[];
};

/**
 * Every church the signed-in user can see, as a tree.
 *
 * Two ways in. A membership row gives a role; oversight from an ancestor
 * gives a view with no role, which is what "null" means here. Both come
 * back from one query because RLS on organizations now admits either.
 *
 * Built as a tree rather than a flat list because a denomination is a
 * tree, and a superintendent looking at a list of forty societies with no
 * shape to it cannot tell which circuit any of them belongs to.
 */
export async function listMemberships(): Promise<
  { role: string; organization: ActiveOrg }[]
> {
  const { flat } = await loadTree();
  return flat
    .filter((n) => n.role !== null)
    .map((n) => ({ role: n.role as string, organization: n.organization }));
}

export async function loadTree(): Promise<{
  roots: TreeNode[];
  flat: TreeNode[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { roots: [], flat: [] };

  const [{ data: orgs }, { data: memberships }] = await Promise.all([
    // RLS returns what the caller belongs to plus what they oversee.
    supabase
      .from("organizations")
      .select("id, name, slug, type, denomination, parent_organization_id")
      .order("name"),
    supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("profile_id", user.id),
  ]);

  const roleByOrg = new Map(
    ((memberships ?? []) as { organization_id: string; role: string }[]).map(
      (m) => [m.organization_id, m.role]
    )
  );

  const nodes = new Map<string, TreeNode>();
  for (const o of (orgs ?? []) as ActiveOrg[]) {
    nodes.set(o.id, {
      role: roleByOrg.get(o.id) ?? null,
      organization: o,
      depth: 0,
      children: [],
    });
  }

  const roots: TreeNode[] = [];
  for (const n of nodes.values()) {
    const parent = n.organization.parent_organization_id
      ? nodes.get(n.organization.parent_organization_id)
      : undefined;
    if (parent) parent.children.push(n);
    else roots.push(n);
  }

  // Depth first, so the flat list reads top to bottom in tree order.
  const flat: TreeNode[] = [];
  const walk = (n: TreeNode, depth: number) => {
    n.depth = depth;
    flat.push(n);
    for (const c of n.children) walk(c, depth + 1);
  };
  for (const r of roots) walk(r, 0);

  return { roots, flat };
}
