/**
 * Demo readiness smoke test.
 *
 * Drives the real flows against the live project as a real signed-in user,
 * through the anon key so RLS applies exactly as it will tonight. Creates a
 * pre-confirmed user at example.com (never an invented address at a real
 * mail domain, which is what got the project a bounce warning before), and
 * deletes everything it made at the end.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split("\n").filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "").trim()])
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const results = [];
const ok = (n, extra = "") => { results.push(["PASS", n, extra]); console.log(`  PASS  ${n}${extra ? "  " + extra : ""}`); };
const bad = (n, e) => { results.push(["FAIL", n, String(e)]); console.log(`  FAIL  ${n}  ${e}`); };

const stamp = Date.now();
const email = `demo-smoke-${stamp}@example.com`;
const password = `Smoke!${stamp}`;
let userId, orgId, memberId, groupId, serviceId, contributionId;

try {
  // ---------- 1. sign up ----------
  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { full_name: "Smoke Test Pastor" },
  });
  if (cErr) throw cErr;
  userId = created.user.id;
  ok("create a confirmed account");

  // ---------- 2. sign in as that user, anon key, RLS applies ----------
  const as = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { error: sErr } = await as.auth.signInWithPassword({ email, password });
  if (sErr) throw sErr;
  ok("log in");

  // ---------- 3. create the church ----------
  const { data: newOrg, error: oErr } = await as.rpc("create_organization", {
    org_name: `Smoke Test Society ${stamp}`, org_type: "local_church", org_denomination: "Methodist",
  });
  if (oErr) throw oErr;
  orgId = newOrg;
  ok("create a church (onboarding)");

  const { data: mem } = await as.from("organization_members").select("role").eq("organization_id", orgId).eq("profile_id", userId).single();
  mem?.role === "pastor" ? ok("creator becomes pastor", `role=${mem.role}`) : bad("creator becomes pastor", `got ${mem?.role}`);

  // ---------- 4. a Bible class ----------
  const { data: g, error: gErr } = await as.from("member_groups")
    .insert({ organization_id: orgId, name: "Wesley Bible Class", type: "bible_class" }).select("id").single();
  if (gErr) bad("create a Bible class", gErr.message); else { groupId = g.id; ok("create a Bible class"); }

  // ---------- 5. members, including a birthday this week ----------
  const today = new Date();
  const soon = new Date(today); soon.setDate(soon.getDate() + 3);
  const dob = `1985-${String(soon.getMonth() + 1).padStart(2, "0")}-${String(soon.getDate()).padStart(2, "0")}`;
  const { data: m, error: mErr } = await as.from("members").insert({
    organization_id: orgId, full_name: "Ama Mensah", gender: "female",
    date_of_birth: dob, phone: "0244000000", member_type: "Full Member",
    member_group_id: groupId ?? null, status: "active",
  }).select("id").single();
  if (mErr) bad("add a member", mErr.message); else { memberId = m.id; ok("add a member with a date of birth"); }

  // ---------- 6. attendance ----------
  const { data: svc, error: aErr } = await as.from("attendance_records").insert({
    organization_id: orgId, service_type: "sunday_service",
    date: today.toISOString().slice(0, 10), male_count: 104, female_count: 144,
    recorded_by_profile_id: userId,
  }).select("id").single();
  if (aErr) bad("record a service", aErr.message); else { serviceId = svc.id; ok("record a service", "248 present"); }

  // ---------- 7. giving ----------
  const { data: con, error: conErr } = await as.from("contributions").insert({
    organization_id: orgId, member_id: memberId, type: "tithe", amount: "250.50",
    payment_method: "cash", recorded_by_profile_id: userId,
  }).select("id").single();
  if (conErr) bad("record a tithe", conErr.message); else { contributionId = con.id; ok("record a tithe", "GHS 250.50"); }

  // ---------- 8. dashboard stats ----------
  const { data: stats, error: stErr } = await as.rpc("dashboard_stats", { org_id: orgId });
  if (stErr) bad("dashboard stats", stErr.message);
  else {
    const s = stats?.[0];
    ok("dashboard stats", `members=${s?.member_count} attendance=${s?.week_attendance} tithe=${s?.month_tithe}`);
  }

  // ---------- 9. the statistical return ----------
  const { data: ret, error: rErr } = await as.rpc("statistical_return", {
    org_id: orgId,
    p_start: new Date(today.getFullYear(), 0, 1).toISOString().slice(0, 10),
    p_end: today.toISOString().slice(0, 10),
  });
  if (rErr) bad("statistical return", rErr.message);
  else {
    const row = ret?.[0];
    ok("statistical return", `members=${row?.members_total} attendance avg=${row?.attendance_average} income=${row?.income_total}`);
  }

  // ---------- 10. branches ----------
  const { data: branch, error: bErr } = await as.rpc("create_branch", {
    parent_id: orgId, branch_name: `Smoke Branch ${stamp}`,
  });
  bErr ? bad("create a branch", bErr.message) : ok("create a branch");

  // ---------- 11. tenant isolation ----------
  const { data: others } = await as.from("organizations").select("id");
  const onlyMine = (others ?? []).every(o => o.id === orgId || o.id === branch);
  onlyMine ? ok("tenant isolation", `sees ${others?.length} of its own churches only`)
           : bad("tenant isolation", `saw ${others?.length} organizations`);

  const { data: leak } = await as.from("members").select("id, organization_id");
  const leaked = (leak ?? []).filter(r => r.organization_id !== orgId);
  leaked.length === 0 ? ok("no member leak across churches") : bad("no member leak", `${leaked.length} foreign rows`);

  // ---------- 12. contact form ----------
  const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { error: eqErr } = await anon.from("contact_requests").insert({
    name: "Smoke Test", email: "smoke@example.com", message: "readiness check", source: "smoke",
  });
  eqErr ? bad("contact form accepts an enquiry", eqErr.message) : ok("contact form accepts an enquiry");

} catch (e) {
  bad("fatal", e.message);
} finally {
  // ---------- clean up ----------
  if (orgId) await admin.from("organizations").delete().eq("id", orgId);
  await admin.from("organizations").delete().like("name", `Smoke Branch ${stamp}%`);
  await admin.from("contact_requests").delete().eq("source", "smoke");
  if (userId) await admin.auth.admin.deleteUser(userId);
  console.log("\n  cleaned up: church, branch, member, service, tithe, enquiry and the test account");
}

const failed = results.filter(r => r[0] === "FAIL");
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
