/**
 * Role capabilities.
 *
 * IMPORTANT: this file is a mirror, not the boundary. The real enforcement
 * lives in the RLS policies (supabase/migrations/0002_rls.sql and
 * 0006_finance_roles.sql). Hiding a button stops an honest mistake; it does
 * not stop anyone who types the URL or calls PostgREST directly.
 *
 * So every capability here MUST correspond to a policy in the database. If
 * you add one, add the matching policy — otherwise the UI is promising a
 * restriction the database will happily ignore.
 */

export type Role =
  | "super_admin"
  | "admin"
  | "minister"
  | "finance_officer"
  | "class_leader"
  | "member";

const ADMINS: Role[] = ["super_admin", "admin"];

// Everyone who may record day-to-day pastoral data.
const STAFF: Role[] = [
  "super_admin",
  "admin",
  "minister",
  "finance_officer",
  "class_leader",
];

// Deliberately excludes class_leader: a class leader looks after their own
// class, not the church's money. Plain members see no finance at all.
const FINANCE_VIEWERS: Role[] = [
  "super_admin",
  "admin",
  "minister",
  "finance_officer",
];

// Ministers can see the figures but not enter them — separating pastoral
// oversight from handling the money is the point of a finance officer.
const FINANCE_WRITERS: Role[] = ["super_admin", "admin", "finance_officer"];

export const CAPABILITIES = {
  "people.write": STAFF,
  "people.delete": ADMINS,
  "attendance.write": STAFF,
  "records.write": STAFF,
  "transfers.manage": ADMINS,
  "finance.view": FINANCE_VIEWERS,
  "finance.write": FINANCE_WRITERS,
  "org.manage": ADMINS,
} as const;

export type Capability = keyof typeof CAPABILITIES;

export function can(role: string | null | undefined, cap: Capability) {
  if (!role) return false;
  return (CAPABILITIES[cap] as readonly string[]).includes(role);
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Platform admin",
  admin: "Administrator",
  minister: "Minister",
  finance_officer: "Finance officer",
  class_leader: "Class leader",
  member: "Member",
};
