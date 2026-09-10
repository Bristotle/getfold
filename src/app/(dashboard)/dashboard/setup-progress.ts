import { createClient } from "@/lib/supabase/server";

/**
 * How far a church has actually got.
 *
 * Every step is measured against real records rather than a flag somebody
 * ticked, so it cannot drift out of step with reality and it cannot be
 * gamed by clicking "done".
 *
 * The order is the order that gets a church to a useful Sunday fastest,
 * which is not the same as the order the navigation happens to be in. The
 * register first, because everything else hangs off it. Then a service,
 * because that is what turns an empty dashboard into figures. Giving
 * third. The team after that, since a pastor usually wants to see it work
 * before inviting anyone else to look.
 */
/**
 * Narrow on purpose. typedRoutes rejects a widened string, and it should:
 * a checklist that links somewhere that does not exist is worse than no
 * checklist.
 */
export type StepHref =
  | "/groups"
  | "/members"
  | "/attendance"
  | "/contributions"
  | "/team";

export type Step = {
  key: string;
  title: string;
  why: string;
  href: StepHref;
  done: boolean;
  /** Optional, and only shown when it is true. Not every step suits one. */
  count?: number;
};

export async function getSetupProgress(orgId: string): Promise<{
  steps: Step[];
  done: number;
  total: number;
  complete: boolean;
}> {
  const supabase = await createClient();

  const [members, services, gifts, team, groups] = await Promise.all([
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("status", "active"),
    supabase
      .from("attendance_records")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),
    supabase
      .from("contributions")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),
    supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),
    supabase
      .from("member_groups")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),
  ]);

  const memberCount = members.count ?? 0;
  const groupCount = groups.count ?? 0;
  const serviceCount = services.count ?? 0;
  const giftCount = gifts.count ?? 0;
  // One is the pastor who created the church, so a team of one is a team
  // of nobody.
  const teamCount = Math.max((team.count ?? 1) - 1, 0);

  const steps: Step[] = [
    {
      key: "groups",
      title: "Add your classes and fellowships",
      why: "Do this first and members drop straight into the right one as you add them, instead of being filed afterwards.",
      href: "/groups",
      done: groupCount > 0,
      count: groupCount,
    },
    {
      key: "members",
      title: "Bring in your register",
      why: "Upload the list you already keep, or start with the people who come every week. Everything else is built on this.",
      href: "/members",
      done: memberCount > 0,
      count: memberCount,
    },
    {
      key: "attendance",
      title: "Record a service",
      why: "A head count of men and women is enough. This is what turns an empty dashboard into figures.",
      href: "/attendance",
      done: serviceCount > 0,
      count: serviceCount,
    },
    {
      key: "giving",
      title: "Record a tithe or offering",
      why: "Cash is the default. Your funds and your return start filling in from here.",
      href: "/contributions",
      done: giftCount > 0,
      count: giftCount,
    },
    {
      key: "team",
      title: "Invite someone else",
      why: "Your secretary, treasurer or a class leader. Each one sees only what their role allows.",
      href: "/team",
      done: teamCount > 0,
      count: teamCount,
    },
  ];

  const done = steps.filter((s) => s.done).length;
  return { steps, done, total: steps.length, complete: done === steps.length };
}
