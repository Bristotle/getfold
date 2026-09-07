import { createClient } from "@/lib/supabase/server";

/**
 * The figures behind the dashboard charts.
 *
 * Every query goes through supabase-js, so row level security scopes each
 * one to the caller's church without this file having to say so. The
 * aggregation happens here rather than in SQL because these are small
 * result sets, a church of five thousand members is a few hundred
 * kilobytes, and keeping it in TypeScript means no migration to change a
 * band boundary later.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type Insights = {
  attendance: { label: string; value: number }[];
  attendanceBySex: { label: string; values: number[] }[];
  giving: { label: string; values: number[] }[];
  memberTypes: { name: string; value: number; color: string }[];
  ageBands: { label: string; values: number[] }[];
  sexSplit: { female: number; male: number; unknown: number };
  birthdays: { id: string; name: string; day: number; month: number; turning: number | null }[];
  birthdaysThisMonth: number;
};

const TYPE_COLOURS = ["#7c4dff", "#00b3a4", "#ffa400", "#ff6b9d", "#0cce6b", "#8b8397"];

export async function getInsights(orgId: string): Promise<Insights> {
  const supabase = await createClient();

  const now = new Date();
  const eightWeeksAgo = new Date(now);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 8 * 7);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [attendanceRes, givingRes, membersRes] = await Promise.all([
    supabase
      .from("attendance_records")
      .select("date, male_count, female_count")
      .eq("organization_id", orgId)
      .gte("date", eightWeeksAgo.toISOString().slice(0, 10))
      .order("date", { ascending: true }),
    supabase
      .from("contributions")
      .select("amount, type, created_at")
      .eq("organization_id", orgId)
      .gte("created_at", sixMonthsAgo.toISOString()),
    supabase
      .from("members")
      .select("id, full_name, gender, date_of_birth, member_type, status")
      .eq("organization_id", orgId)
      .eq("status", "active"),
  ]);

  // ---------- attendance, one bar per recorded service ----------
  const services = (attendanceRes.data ?? []) as {
    date: string;
    male_count: number;
    female_count: number;
  }[];
  const recent = services.slice(-8);
  const attendance = recent.map((s) => ({
    label: `${new Date(s.date).getDate()} ${MONTHS[new Date(s.date).getMonth()]}`,
    value: (s.male_count ?? 0) + (s.female_count ?? 0),
  }));
  const attendanceBySex = recent.map((s) => ({
    label: `${new Date(s.date).getDate()} ${MONTHS[new Date(s.date).getMonth()]}`,
    values: [s.female_count ?? 0, s.male_count ?? 0],
  }));

  // ---------- giving, by month and type ----------
  const gifts = (givingRes.data ?? []) as {
    amount: string | number;
    type: string;
    created_at: string;
  }[];
  const buckets = new Map<string, { tithe: number; offering: number; other: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, {
      tithe: 0,
      offering: 0,
      other: 0,
    });
  }
  for (const g of gifts) {
    const d = new Date(g.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const b = buckets.get(key);
    if (!b) continue;
    // DECIMAL comes back as a string so the value is not rounded in transit.
    const amount = Number(g.amount) || 0;
    if (g.type === "tithe") b.tithe += amount;
    else if (g.type === "offering") b.offering += amount;
    else b.other += amount;
  }
  const giving = [...buckets.entries()].map(([key, b]) => {
    const [, month] = key.split("-").map(Number);
    return { label: MONTHS[month], values: [b.tithe, b.offering, b.other] };
  });

  // ---------- membership ----------
  const members = (membersRes.data ?? []) as {
    id: string;
    full_name: string;
    gender: string | null;
    date_of_birth: string | null;
    member_type: string | null;
  }[];

  const typeCounts = new Map<string, number>();
  for (const m of members) {
    const t = m.member_type?.trim() || "Not recorded";
    typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
  }
  const memberTypes = [...typeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], i) => ({ name, value, color: TYPE_COLOURS[i] }));

  const sexSplit = {
    female: members.filter((m) => m.gender === "female").length,
    male: members.filter((m) => m.gender === "male").length,
    unknown: members.filter((m) => !m.gender).length,
  };

  // ---------- age bands ----------
  const BANDS = ["0 to 17", "18 to 35", "36 to 60", "61+", "No date"];
  const bandCounts = BANDS.map(() => [0, 0]); // [female, male]
  for (const m of members) {
    const sexIndex = m.gender === "female" ? 0 : m.gender === "male" ? 1 : -1;
    if (sexIndex === -1) continue;
    if (!m.date_of_birth) {
      bandCounts[4][sexIndex]++;
      continue;
    }
    const age = Math.floor(
      (now.getTime() - new Date(m.date_of_birth).getTime()) / 31557600000
    );
    const band = age < 18 ? 0 : age < 36 ? 1 : age < 61 ? 2 : 3;
    bandCounts[band][sexIndex]++;
  }
  const ageBands = BANDS.map((label, i) => ({ label, values: bandCounts[i] }));

  // ---------- birthdays ----------
  // The next 14 days, so a Sunday announcement can cover the week just
  // gone and the week ahead. Compared on day and month only, because the
  // year in a date of birth is the one part nobody wants read out.
  const soon: Insights["birthdays"] = [];
  let thisMonth = 0;
  const todayMd = now.getMonth() * 100 + now.getDate();
  for (const m of members) {
    if (!m.date_of_birth) continue;
    const dob = new Date(m.date_of_birth);
    if (Number.isNaN(dob.getTime())) continue;
    if (dob.getMonth() === now.getMonth()) thisMonth++;

    const md = dob.getMonth() * 100 + dob.getDate();
    // Days until, wrapping the year end.
    const thisYear = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    const target =
      md >= todayMd
        ? thisYear
        : new Date(now.getFullYear() + 1, dob.getMonth(), dob.getDate());
    const days = Math.round(
      (target.setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 86400000
    );
    if (days <= 14) {
      soon.push({
        id: m.id,
        name: m.full_name,
        day: dob.getDate(),
        month: dob.getMonth(),
        turning: dob.getFullYear() > 1900 ? now.getFullYear() - dob.getFullYear() : null,
      });
    }
  }
  soon.sort((a, b) => {
    const ad = (a.month * 100 + a.day - todayMd + 1200) % 1200;
    const bd = (b.month * 100 + b.day - todayMd + 1200) % 1200;
    return ad - bd;
  });

  return {
    attendance,
    attendanceBySex,
    giving,
    memberTypes,
    ageBands,
    sexSplit,
    birthdays: soon,
    birthdaysThisMonth: thisMonth,
  };
}

export const MONTH_NAMES = MONTHS;
