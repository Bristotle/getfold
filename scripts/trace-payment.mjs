/**
 * Where did a gift actually go?
 *
 * A church tester paid GHS 1, Fold recorded it as successful, and nothing
 * arrived in the church's wallet. Fold's own records cannot answer that:
 * once Paystack confirms a charge, everything after it, the split between
 * the church's subaccount and ours, the fee, and the settlement itself,
 * happens inside Paystack. So this asks Paystack.
 *
 * It answers four questions for a reference:
 *
 *   1. What did Paystack charge, and what fee did it take?
 *   2. How was it split, and which subaccount got what?
 *   3. What is that subaccount configured to receive, and is it verified?
 *   4. Has it settled, and if not, what is sitting in whose balance?
 *
 * The key is read from the environment and never printed.
 *
 *   PAYSTACK_SECRET_KEY=sk_live_xxx node scripts/trace-payment.mjs
 *   PAYSTACK_SECRET_KEY=sk_live_xxx node scripts/trace-payment.mjs <reference>
 *
 * With no reference it traces the most recent successful charges in the
 * Fold database, which is usually what you want after somebody says the
 * money has not arrived.
 */
import postgres from "postgres";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const KEY = process.env.PAYSTACK_SECRET_KEY || env.PAYSTACK_SECRET_KEY;
if (!KEY) {
  console.error("No PAYSTACK_SECRET_KEY. Pass the live key in the environment:");
  console.error("  PAYSTACK_SECRET_KEY=sk_live_xxx node scripts/trace-payment.mjs");
  process.exit(1);
}
console.log(`Using a ${KEY.startsWith("sk_live") ? "LIVE" : KEY.startsWith("sk_test") ? "test" : "unrecognised"} key.\n`);

const ghs = (pesewas) =>
  `GHS ${(Number(pesewas) / 100).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function paystack(path) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!json.status) {
    return { error: json.message || `HTTP ${res.status}` };
  }
  return json;
}

// ---------------------------------------------------------------- which
let references = process.argv.slice(2);
if (references.length === 0) {
  const sql = postgres(env.DIRECT_URL, { ssl: "require" });
  const rows = await sql`
    select p.reference, p.amount, p.created_at, o.name as church,
           o.paystack_subaccount_code, o.settlement_label
      from payments p join organizations o on o.id = p.organization_id
     where p.status = 'success'
     order by p.created_at desc limit 5`;
  await sql.end();
  references = rows.map((r) => r.reference);
  console.log("Tracing the five most recent successful charges Fold recorded.\n");
  for (const r of rows) {
    console.log(
      `  ${r.created_at.toISOString().slice(0, 16)}  GHS ${Number(r.amount).toFixed(2)}  ${r.church}  settles to ${r.settlement_label ?? "nowhere set"}`
    );
  }
  console.log("");
}

// ------------------------------------------------------------ the trace
const subaccountsSeen = new Set();

for (const reference of references) {
  console.log("=".repeat(72));
  console.log(reference);
  console.log("=".repeat(72));

  const t = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
  if (t.error) {
    console.log(`  Paystack says: ${t.error}\n`);
    continue;
  }
  const d = t.data;
  console.log(`  status          ${d.status}`);
  console.log(`  paid at         ${d.paid_at ?? "-"}`);
  console.log(`  channel         ${d.channel} ${d.authorization?.bank ? `(${d.authorization.bank})` : ""}`);
  console.log(`  amount          ${ghs(d.amount)}`);
  console.log(`  Paystack fee    ${ghs(d.fees ?? 0)}`);

  /*
    The part that matters. fees_split says who paid the fee; split and
    subaccount say who received the money. If the church's subaccount is
    absent or its share is zero, the gift stayed with the platform, which
    is exactly the bug this script was written to find.
  */
  const sub = d.subaccount;
  if (!sub) {
    console.log("  subaccount      NONE. The whole amount went to the main account.");
  } else {
    console.log(`  subaccount      ${sub.subaccount_code}  ${sub.business_name ?? ""}`);
    console.log(`                  settles to ${sub.settlement_bank ?? "?"} ${sub.account_number ?? ""}`);
    subaccountsSeen.add(sub.subaccount_code);
  }
  if (d.fees_split) {
    console.log(`  fee split       paystack ${ghs(d.fees_split.paystack ?? 0)}, integration ${ghs(d.fees_split.integration ?? 0)}, subaccount ${ghs(d.fees_split.subaccount ?? 0)}`);
  }
  if (d.split && Object.keys(d.split).length) {
    console.log(`  split           ${JSON.stringify(d.split)}`);
  }
  console.log("");
}

// --------------------------------------------------- subaccount settings
for (const code of subaccountsSeen) {
  console.log("-".repeat(72));
  console.log(`Subaccount ${code}`);
  console.log("-".repeat(72));
  const s = await paystack(`/subaccount/${code}`);
  if (s.error) {
    console.log(`  Paystack says: ${s.error}\n`);
    continue;
  }
  const d = s.data;
  console.log(`  business name       ${d.business_name}`);
  console.log(`  settlement bank     ${d.settlement_bank}  ${d.account_number}`);
  console.log(`  account name        ${d.account_name ?? "not resolved"}`);
  console.log(`  percentage_charge   ${d.percentage_charge}`);
  console.log(`  is_verified         ${d.is_verified}`);
  console.log(`  settlement schedule ${d.settlement_schedule ?? "-"}`);
  console.log(`  active              ${d.active}`);
  console.log("");
}

// ------------------------------------------------------- where money sits
console.log("-".repeat(72));
console.log("Main account balance");
console.log("-".repeat(72));
const b = await paystack("/balance");
if (b.error) {
  console.log(`  Paystack says: ${b.error}`);
} else {
  for (const bal of b.data ?? []) {
    console.log(`  ${bal.currency}  ${ghs(bal.balance)}`);
  }
  console.log("\n  Anything sitting here that a church gave is money that did");
  console.log("  not reach the church.");
}

console.log("\n" + "-".repeat(72));
console.log("Recent settlements");
console.log("-".repeat(72));
const st = await paystack("/settlement?perPage=10");
if (st.error) {
  console.log(`  Paystack says: ${st.error}`);
} else if (!st.data || st.data.length === 0) {
  console.log("  None yet. Nothing has been paid out at all.");
} else {
  for (const s of st.data) {
    console.log(
      `  ${String(s.settled_at ?? s.createdAt).slice(0, 16)}  ${s.status.padEnd(10)} ${ghs(s.total_amount)}  ${s.domain}  ${s.subaccount?.subaccount_code ?? "main account"}`
    );
  }
}
console.log("");
