/**
 * Runs the spam scorer against every enquiry this site has actually
 * received, plus church enquiries written to look like the real thing.
 *
 *   node scripts/spam-check.mjs
 *
 * Fails if any real spam is let through, and fails LOUDER if any plausible
 * church is binned, because those two mistakes do not cost the same. A
 * wrongly binned pitch costs nothing. A wrongly binned church costs a
 * customer, and we would never find out.
 *
 * Run it whenever the scorer changes.
 */
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { scoreEnquiry, SPAM_THRESHOLD } from "../src/lib/spam.ts";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [
      l.slice(0, l.indexOf("=")),
      l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "").trim(),
    ])
);

/* Written to be ordinary, and to include the awkward cases on purpose. */
const CHURCHES = [
  {
    name: "Grace Mensah",
    email: "grace@example.com",
    church: "Bethel Methodist Society",
    message:
      "Good afternoon. I am the secretary at our society in Kumasi. We have about 180 members and still keep the register in a book. Could we try Fold before our next quarterly return?",
  },
  {
    name: "Rev. Kofi Asante",
    email: "kofi@example.com",
    church: "",
    message: "Does this work if our internet is slow? We are in Tamale.",
  },
  {
    // The awkward one: a church that mentions our website, briefly, with no
    // church name. It must still get through.
    name: "Ama Boateng",
    email: "ama@example.com",
    church: "",
    message:
      "I saw your website and wanted to ask about the price for a church of 60 members.",
  },
  {
    name: "Presiding Elder Owusu",
    email: "owusu@example.com",
    church: "Christ Apostolic, Sunyani",
    message: "How much is it for a whole district, and can each assembly keep its own register?",
  },
  { name: "Yaw", email: "yaw@example.com", church: "", message: "Is there a free trial?" },
  {
    // The hardest legitimate case: mentions our website, pastes their own,
    // names no church. Tone alone would have binned this.
    name: "Esi Nyarko",
    email: "esi@example.com",
    church: "",
    message:
      "I found your website today. Ours is https://calvarybethel.org if it helps. How do we move our register across?",
  },
];

const sql = postgres(env.DIRECT_URL ?? env.DATABASE_URL, { prepare: false });
const real = await sql`
  select name, email, phone, church, message
  from public.contact_requests order by created_at desc`;
await sql.end();

let missed = 0;
let binned = 0;

console.log(`  threshold ${SPAM_THRESHOLD}\n`);
console.log("  REAL ENQUIRIES RECEIVED, all of which have been sales pitches");
for (const e of real) {
  const v = scoreEnquiry(e);
  if (!v.spam) missed++;
  console.log(
    `  ${v.spam ? "caught " : "**MISSED**"} ${String(v.score).padStart(2)}  ${e.name.slice(0, 34).padEnd(34)} ${v.reasons.join("; ")}`
  );
}

console.log("\n  CHURCH ENQUIRIES, none of which may be binned");
for (const e of CHURCHES) {
  const v = scoreEnquiry(e);
  if (v.spam) binned++;
  console.log(
    `  ${v.spam ? "**BINNED A CHURCH**" : "through"} ${String(v.score).padStart(2)}  ${e.name.padEnd(24)} ${v.reasons.join("; ") || "nothing flagged"}`
  );
}

console.log(`\n  ${real.length - missed}/${real.length} pitches caught, ${binned} churches wrongly binned`);
if (binned) {
  console.error("  FAIL: a church would have been silently quarantined.");
  process.exit(1);
}
if (missed) {
  console.error("  FAIL: a known sales pitch scored below the threshold.");
  process.exit(1);
}
console.log("  PASS");
