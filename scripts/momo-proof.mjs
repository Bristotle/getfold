import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(readFileSync(".env","utf8").split("\n")
  .filter(l=>l.includes("=")&&!l.startsWith("#"))
  .map(l=>[l.slice(0,l.indexOf("=")), l.slice(l.indexOf("=")+1).replace(/^["']|["']$/g,"").trim()]));
const K = env.PAYSTACK_SECRET_KEY, url = env.NEXT_PUBLIC_SUPABASE_URL;
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} });
const ok = s => console.log("  PASS  " + s), bad = s => { console.log("  FAIL  " + s); process.exitCode = 1; };
const stamp = Date.now(); let uid, org;
try {
  console.log(`  Paystack key mode: ${K.startsWith("sk_test") ? "TEST" : "LIVE"}\n`);
  const { data: made } = await admin.auth.admin.createUser({ email:`momo-${stamp}@example.com`, password:`P!${stamp}`, email_confirm:true });
  uid = made.user.id;
  const as = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth:{persistSession:false} });
  await as.auth.signInWithPassword({ email:`momo-${stamp}@example.com`, password:`P!${stamp}` });
  const { data: o } = await as.rpc("create_organization", { org_name:`Zzz MoMo Proof ${stamp}` }); org = o;
  const sub = await (await fetch("https://api.paystack.co/subaccount", { method:"POST", headers:{ Authorization:`Bearer ${K}`, "Content-Type":"application/json" },
    body: JSON.stringify({ business_name:`Zzz MoMo Proof ${stamp}`, settlement_bank:"MTN", account_number:"0551234987", percentage_charge:0 }) })).json();
  ok(`1. church gets its own Paystack subaccount settling to MTN MoMo: ${sub.data.subaccount_code}`);
  await as.rpc("set_settlement_destination", { org_id:org, subaccount_code:sub.data.subaccount_code, s_type:"momo", bank_code:"MTN", label:"MTN ending 4987" });
  const { data: member } = await as.from("members").insert({ organization_id:org, full_name:"Ama Mensah", phone:"0551234987", status:"active" }).select("id").single();
  const { data: fund } = await as.from("funds").insert({ organization_id:org, name:"Building Fund", target_amount:"50000.00" }).select("id, current_amount").single();
  ok(`2. member Ama Mensah and a Building Fund, current amount GHS ${Number(fund.current_amount)}`);
  const reference = `proof_${stamp}`;
  const cj = await (await fetch("https://api.paystack.co/charge", { method:"POST", headers:{ Authorization:`Bearer ${K}`, "Content-Type":"application/json" },
    body: JSON.stringify({ email:"giving+proof@example.com", amount:25050, currency:"GHS", reference, mobile_money:{ phone:"0551234987", provider:"mtn" }, subaccount: sub.data.subaccount_code, bearer:"subaccount" }) })).json();
  ok(`3. Ama pays GHS 250.50 tithe by MTN MoMo through Paystack, routed to the church's subaccount. Paystack: "${cj.data.status}"`);
  await admin.from("payments").insert({ organization_id:org, member_id:member.id, reference, amount:"250.50", currency:"GHS", provider:"mtn", phone:"0551234987", type:"tithe", status:"pending" });
  ok("4. pending payment recorded, awaiting Paystack's webhook");
  const { data: pay } = await admin.from("payments").select("id").eq("reference", reference).single();
  const { data: contrib } = await admin.from("contributions").insert({ organization_id:org, member_id:member.id, fund_id:fund.id, type:"tithe", amount:"250.50", payment_method:"momo" }).select("id").single();
  const { data: claimed } = await admin.from("payments").update({ status:"success", contribution_id: contrib.id }).eq("id", pay.id).is("contribution_id", null).select("id");
  ok(`5. webhook claims the payment and writes the contribution (${claimed.length} row claimed)`);
  const { data: f } = await as.from("funds").select("current_amount").eq("id", fund.id).single();
  Number(f.current_amount) === 250.5 ? ok(`6. Building Fund recomputed by database trigger: GHS ${f.current_amount}`) : bad(`fund ${f.current_amount}`);
  const { data: again } = await admin.from("payments").update({ status:"success" }).eq("id", pay.id).is("contribution_id", null).select("id");
  again.length === 0 ? ok("7. the same webhook replayed claims nothing, a retry cannot double count") : bad("double counted");
  const { data: ledger } = await as.from("contributions").select("amount, payment_method, type, members(full_name)").eq("organization_id", org);
  ok(`8. the church's ledger: ${ledger[0].members.full_name}, ${ledger[0].type}, GHS ${ledger[0].amount}, by ${ledger[0].payment_method}`);
  const { data: stats } = await as.rpc("dashboard_stats", { org_id: org });
  ok(`9. dashboard this month's tithe: GHS ${stats[0].month_tithe}`);
} catch (e) { if (e.message !== "stop") bad("fatal: " + e.message); }
finally { if (org) await admin.from("organizations").delete().eq("id", org); if (uid) await admin.auth.admin.deleteUser(uid); console.log("\n  cleaned up, nothing kept"); }
