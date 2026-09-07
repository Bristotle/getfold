/**
 * Role capabilities.
 *
 * IMPORTANT: this file is a mirror, not the boundary. The real enforcement
 * lives in the RLS policies (supabase/migrations/0002_rls.sql and
 * 0014_role_capabilities.sql). Hiding a button stops an honest mistake; it
 * does not stop anyone who types the URL or calls PostgREST directly.
 *
 * So every capability here MUST correspond to a policy in the database. If
 * you add one, add the matching policy, or the interface promises a
 * restriction the database will happily ignore.
 */

export type Role =
  | "super_admin"
  | "pastor"
  | "admin"
  | "minister"
  | "elder"
  | "finance_officer"
  | "class_leader"
  | "member";

/** The pastor owns the church. Only they can appoint another pastor. */
const OWNER: Role[] = ["super_admin", "pastor"];

/** Can run the church day to day, including its money. */
const LEADERSHIP: Role[] = ["super_admin", "pastor", "admin"];

/** Everyone who may record pastoral data. `minister` is legacy for elder. */
const STAFF: Role[] = [
  "super_admin",
  "pastor",
  "admin",
  "minister",
  "elder",
  "finance_officer",
  "class_leader",
];

/**
 * Money is deliberately narrow. Giving is the most sensitive thing a church
 * records, and an elder or class leader has no reason to see what the
 * congregation contributed.
 */
const FINANCE: Role[] = ["super_admin", "pastor", "admin", "finance_officer"];

export const CAPABILITIES = {
  "people.write": STAFF,
  "people.delete": LEADERSHIP,
  "attendance.write": STAFF,
  "records.write": STAFF,
  "transfers.manage": LEADERSHIP,
  "finance.view": FINANCE,
  "finance.write": FINANCE,
  "org.manage": LEADERSHIP,
  /** Appointing another pastor, or handing the church over. */
  "org.transfer": OWNER,
} as const;

export type Capability = keyof typeof CAPABILITIES;

export function can(role: string | null | undefined, cap: Capability) {
  if (!role) return false;
  return (CAPABILITIES[cap] as readonly string[]).includes(role);
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Platform admin",
  pastor: "Pastor",
  admin: "Administrator",
  minister: "Minister",
  elder: "Elder",
  finance_officer: "Finance officer",
  class_leader: "Class leader",
  member: "Member",
};

/**
 * What each role can do, in the words a pastor would use. Shown beside the
 * role when delegating, so the choice is made on meaning rather than on a
 * job title that means something different in every denomination.
 */
export const ROLE_DESCRIPTIONS: Record<string, string> = {
  pastor: "Full control, including giving. Can appoint others.",
  admin: "Runs everything day to day, including giving.",
  finance_officer: "Records and sees giving. Cannot manage people.",
  elder: "Members, groups, attendance and records. No giving.",
  class_leader: "Records members and attendance. No giving.",
  member: "Can look, but not change anything.",
  minister: "Same as elder. Kept for existing accounts.",
};

/**
 * Roles that may be handed out in the interface.
 *
 * `super_admin` is platform support access and is never a church's to give.
 * `minister` is legacy: existing holders keep it, but nobody new is assigned
 * it, because elder says the same thing more clearly.
 * `pastor` only appears for someone who already holds the church.
 */
export const ASSIGNABLE_ROLES: Role[] = [
  "admin",
  "finance_officer",
  "elder",
  "class_leader",
  "member",
];

export function assignableRoles(byRole: string | null | undefined): Role[] {
  return can(byRole, "org.transfer")
    ? ["pastor", ...ASSIGNABLE_ROLES]
    : ASSIGNABLE_ROLES;
}
