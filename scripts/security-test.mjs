/**
 * Attacks the live system and fails if anything gives way.
 *
 * Written because "row level security is the boundary" is a claim, and a
 * claim about a church's register deserves testing rather than asserting.
 * Everything below is an attempt to do something that must not work: read
 * another church's members, bill a church you do not belong to, forge a
 * Paystack webhook, reach a cron endpoint without the secret, or find a
 * secret in the HTML.
 *
 *   node scripts/security-test.mjs
 *   BASE=http://localhost:3000 node scripts/security-test.mjs
 *
 * It creates one throwaway user at example.com, reserved by RFC 2606 so it
 * can never receive mail, and deletes it at the end. It never writes to a
 * real church. Exits non zero on any failure, so it can gate a deploy.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(readFileSync(".env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1).replace(/^["']|["']$/g,"").trim()]));

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} });

let pass = 0, fail = 0;
const check = (name, ok, detail="") => { ok ? pass++ : fail++; console.log(`  ${ok ? "PASS" : "**FAIL**"}  ${name}${detail ? "  " + detail : ""}`); };

console.log("=== 1. What can the public anon key reach? ===");
// Every table, read attempt with the anon key and no session.
const anon = createClient(URL, ANON, { auth:{persistSession:false} });
const tables = ["organizations","members","contributions","payments","invoices","attendance_records",
  "organization_members","profiles","notifications","funds","vital_records","visitors",
  "organization_invitations","auth_events","_prisma_migrations","member_transfers"];
for (const t of tables) {
  const { data, error } = await anon.from(t).select("*").limit(1);
  const leaked = !error && Array.isArray(data) && data.length > 0;
  check(`anon cannot read ${t}`, !leaked, leaked ? `LEAKED ${data.length} row(s)` : (error ? `(${error.code ?? "denied"})` : "(empty)"));
}

console.log("\n=== 2. Can the anon key WRITE? ===");
for (const t of ["organizations","members","contributions","payments","invoices"]) {
  const { error } = await anon.from(t).insert({ name: "attack" });
  check(`anon cannot insert into ${t}`, Boolean(error), error ? "" : "INSERT ACCEPTED");
}
const { error: delErr, count } = await anon.from("payments").delete({ count: "exact" }).neq("id","00000000-0000-0000-0000-000000000000");
check("anon cannot delete payments", Boolean(delErr) || count === 0, delErr ? "" : `deleted ${count}`);

console.log("\n=== 3. Cross church isolation ===");
// Build a second church with its own pastor, then try to read the first.
const stamp = Date.now();
const attackerEmail = `attacker+${stamp}@example.com`;
const { data: created, error: cErr } = await admin.auth.admin.createUser({
  email: attackerEmail, password: `Attack${stamp}aa`, email_confirm: true,
});
if (cErr) { console.log("  could not create test user:", cErr.message); }
const attackerId = created?.user?.id;

const victim = await admin.from("organizations").select("id, name").eq("slug","calvary-bethel").maybeSingle();
const victimOrg = victim.data;

const asAttacker = createClient(URL, ANON, { auth:{persistSession:false} });
const { data: session, error: sErr } = await asAttacker.auth.signInWithPassword({ email: attackerEmail, password: `Attack${stamp}aa` });
check("test attacker signed in", Boolean(session?.session), sErr?.message ?? "");

if (session?.session) {
  // No church yet: a signed in stranger.
  for (const t of ["organizations","members","contributions","payments","invoices","attendance_records","vital_records","notifications"]) {
    const { data } = await asAttacker.from(t).select("*").limit(5);
    check(`signed in stranger sees no ${t}`, !data || data.length === 0, data?.length ? `SAW ${data.length} ROWS` : "");
  }
  // Targeted at the victim church by id.
  const { data: targeted } = await asAttacker.from("members").select("*").eq("organization_id", victimOrg.id);
  check("cannot target another church by id", !targeted || targeted.length === 0, targeted?.length ? `SAW ${targeted.length}` : "");

  // Can they force themselves into the victim church?
  const { error: joinErr } = await asAttacker.from("organization_members")
    .insert({ organization_id: victimOrg.id, profile_id: attackerId, role: "pastor" });
  check("cannot insert themselves as pastor", Boolean(joinErr), joinErr ? "" : "JOINED THE CHURCH");

  // Can they bill or read the victim's invoices?
  const { error: subErr } = await asAttacker.rpc("start_subscription", { org_id: victimOrg.id });
  check("cannot raise an invoice for another church", Boolean(subErr), subErr ? "" : "RAISED IT");

  const { data: stats } = await asAttacker.rpc("dashboard_stats", { org_id: victimOrg.id });
  const seen = stats?.[0];
  const blind = !seen || (Number(seen.member_count) === 0 && Number(seen.month_giving ?? 0) === 0);
  check("dashboard_stats leaks nothing across churches", blind, blind ? "" : JSON.stringify(seen));

  const { data: roll } = await asAttacker.rpc("rollup_stats", { root: victimOrg.id });
  const rollBlind = !roll?.[0] || Number(roll[0].member_count) === 0;
  check("rollup_stats leaks nothing across churches", rollBlind, rollBlind ? "" : JSON.stringify(roll[0]));
}

console.log("\n=== 3b. We must never store a bank or mobile money number ===");
/*
  The pricing page tells churches we do not hold their account number, and
  a promise like that is only worth making if something checks it. Paystack
  holds the number; we keep an opaque subaccount code and a label.
*/
{
  const { data: sample } = await admin.from("organizations").select("*").limit(1).single();
  const cols = Object.keys(sample ?? {});
  const banned = cols.filter((c) => /account_number|bank_account|iban|nuban|momo_number|msisdn/i.test(c));
  check("organizations holds no account number column", banned.length === 0, banned.join(", "));

  const { data: mem } = await admin.from("members").select("*").limit(1);
  const memCols = Object.keys(mem?.[0] ?? {});
  const memBanned = memCols.filter((c) => /account_number|bank_account|iban|nuban/i.test(c));
  check("members holds no account number column", memBanned.length === 0, memBanned.join(", "));

  const label = (sample ?? {}).settlement_label;
  const looksLikeANumber = typeof label === "string" && /\d{6,}/.test(label);
  check("settlement label is not a full number", !looksLikeANumber, String(label ?? ""));
}

console.log("\n=== 4. SQL injection through PostgREST filters ===");
const payloads = ["' or 1=1--", "'; drop table members;--", "1) or (1=1", "%27%20or%201=1"];
for (const p of payloads) {
  const { data, error } = await anon.from("members").select("*").eq("full_name", p).limit(5);
  const leaked = data && data.length > 0;
  check(`injection rejected: ${p.slice(0,22)}`, !leaked, leaked ? "RETURNED ROWS" : (error ? "(error)" : "(none)"));
}
const stillThere = await admin.from("members").select("id", { count: "exact", head: true });
check("members table survived injection attempts", stillThere.error === null);


const BASE = process.env.BASE ?? "https://www.getfold.org";

console.log("=== 5. Routes that must not answer a stranger ===");
const guarded = ["/dashboard","/members","/contributions","/billing","/payouts","/messages","/funds","/insights","/settings","/admin/enquiries","/branches"];
for (const r of guarded) {
  const res = await fetch(BASE+r, { redirect:"manual" });
  const ok = res.status === 307 || res.status === 302 || res.status === 404;
  check(`${r} refuses a stranger`, ok, `${res.status} -> ${res.headers.get("location") ?? ""}`);
}

console.log("\n=== 6. Endpoints behind a secret ===");
for (const r of ["/api/cron/daily-messages","/api/cron/trial-reminders","/api/paystack/status","/api/mail/status"]) {
  const bare = await fetch(BASE+r);
  const wrong = await fetch(BASE+r, { headers:{ Authorization:"Bearer wrong-secret" }});
  check(`${r} refuses no secret`, bare.status === 401, String(bare.status));
  check(`${r} refuses a wrong secret`, wrong.status === 401, String(wrong.status));
}

console.log("\n=== 7. Paystack webhook signature ===");
const body = JSON.stringify({ event:"charge.success", data:{ reference:"fold_calvary-beth_forged", status:"success", amount:100000 }});
const none = await fetch(`${BASE}/api/paystack/webhook`, { method:"POST", headers:{"Content-Type":"application/json"}, body });
check("webhook refuses an unsigned payload", none.status >= 400, String(none.status));
const bad = await fetch(`${BASE}/api/paystack/webhook`, { method:"POST", headers:{"Content-Type":"application/json","x-paystack-signature":"0".repeat(128)}, body });
check("webhook refuses a forged signature", bad.status >= 400, String(bad.status));

console.log("\n=== 8. Security headers and exposure ===");
const home = await fetch(BASE);
const h = home.headers;
check("no server version disclosed", !/\d+\.\d+/.test(h.get("server") ?? ""), h.get("server") ?? "none");
check("HSTS set", Boolean(h.get("strict-transport-security")), h.get("strict-transport-security") ?? "MISSING");
check("x-content-type-options nosniff", h.get("x-content-type-options") === "nosniff", h.get("x-content-type-options") ?? "MISSING");
check("frame protection", Boolean(h.get("x-frame-options") || (h.get("content-security-policy") ?? "").includes("frame-ancestors")), h.get("x-frame-options") ?? h.get("content-security-policy") ?? "MISSING");
check("referrer policy", Boolean(h.get("referrer-policy")), h.get("referrer-policy") ?? "MISSING");

console.log("\n=== 9. Secrets must never reach the browser ===");
const html = await home.text();
const leaks = [["service role key", env.SUPABASE_SERVICE_ROLE_KEY],["paystack secret","sk_live_"],["arkesel key", env.ARKESEL_API_KEY],["resend key","re_"],["cron secret", env.CRON_SECRET],["database url", env.DIRECT_URL?.split("@")[0]]];
for (const [name, needle] of leaks) {
  if (!needle) { console.log(`  skip  ${name}, not set locally`); continue; }
  check(`${name} absent from the homepage`, !html.includes(needle));
}

console.log("\n=== 10. robots and sitemap do not advertise private routes ===");
const robots = await (await fetch(BASE+"/robots.txt")).text();
for (const r of ["/dashboard","/admin","/members","/contributions"]) {
  check(`robots disallows ${r}`, robots.includes(`Disallow: ${r}`), robots.includes(r) ? "" : "not listed");
}
const sitemap = await (await fetch(BASE+"/sitemap.xml")).text();
const priv = ["/dashboard","/billing","/admin","/members","/contributions","/payouts"].filter(r => sitemap.includes(`getfold.org${r}`));
check("sitemap lists no private route", priv.length === 0, priv.join(", "));


if (attackerId) await admin.auth.admin.deleteUser(attackerId);
console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
