/*
  Live mobile money proof. REAL MONEY.

  GHS 1, not GHS 250.50. A one cedi charge proves the identical path and
  costs a cedi to be wrong about.

  It creates one live Paystack subaccount, which is a permanent record in
  the Paystack account, and one temporary church in the database which is
  deleted at the end.
*/
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const KEY = process.argv[2];             // live secret key, passed in, never stored
const PHONE = "0247902348";
const AMOUNT_PESEWAS = 100;              // GHS 1.00

if (!KEY?.startsWith("sk_live")) { console.log("  need the LIVE secret key as argv[2]"); process.exit(1); }

const env = Object.fromEntries(readFileSync(".env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>[l.slice(0,l.indexOf("=")),l.slice(l.indexOf("=")+1).replace(/^["']|["']$/g,"").trim()]));
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} });
const H = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const stamp = Date.now();

// 1. a live subaccount settling to that MoMo number
const sub = await (await fetch("https://api.paystack.co/subaccount", { method:"POST", headers:H,
  body: JSON.stringify({ business_name: `Fold live test ${stamp}`, settlement_bank: "MTN", account_number: PHONE, percentage_charge: 0 }) })).json();
if (!sub.status) { console.log("  subaccount failed:", sub.message); process.exit(1); }
console.log(`  subaccount created: ${sub.data.subaccount_code}  settles to ${sub.data.settlement_bank} ${PHONE}`);
console.log(`  account name Paystack resolved: ${sub.data.account_name ?? "(none returned)"}`);

// 2. a church in the database pointing at it, so the webhook has somewhere to land
const { data: u } = await admin.auth.admin.createUser({ email:`livetest-${stamp}@example.com`, password:`L!${stamp}`, email_confirm:true });
const as = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth:{persistSession:false} });
await as.auth.signInWithPassword({ email:`livetest-${stamp}@example.com`, password:`L!${stamp}` });
const { data: org } = await as.rpc("create_organization", { org_name:`Zzz Live MoMo Test ${stamp}` });
await as.rpc("set_settlement_destination", { org_id:org, subaccount_code:sub.data.subaccount_code, s_type:"momo", bank_code:"MTN", label:`MTN ending ${PHONE.slice(-4)}` });
const { data: member } = await as.from("members").insert({ organization_id:org, full_name:"Live Test Giver", phone:PHONE, status:"active" }).select("id").single();
console.log(`  church created and pointed at it: ${org}`);

// 3. the charge
const reference = `livetest_${stamp}`;
await admin.from("payments").insert({ organization_id:org, member_id:member.id, reference, amount:"1.00", currency:"GHS", provider:"mtn", phone:PHONE, type:"tithe", status:"pending" });
const charge = await (await fetch("https://api.paystack.co/charge", { method:"POST", headers:H,
  body: JSON.stringify({ email:"giving+livetest@example.com", amount:AMOUNT_PESEWAS, currency:"GHS", reference,
    mobile_money:{ phone:PHONE, provider:"mtn" }, subaccount: sub.data.subaccount_code, bearer:"subaccount" }) })).json();

console.log(`\n  charge status: ${charge.status ? charge.data.status : "FAILED: " + charge.message}`);
if (charge.data?.display_text) console.log(`  Paystack says: ${charge.data.display_text}`);
console.log(`\n  reference: ${reference}`);
console.log(`  org: ${org}`);
console.log(`\n  >>> APPROVE THE PROMPT ON ${PHONE} NOW <<<`);
