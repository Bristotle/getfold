/**
 * Puts the two values the Postgres schedule needs into Supabase Vault.
 *
 *   node scripts/schedule-flush.mjs
 *
 * Why this is a script and not a migration: a migration lives in git, and a
 * secret must not. Vault encrypts both values at rest, and
 * public.flush_due_messages reads them by name at run time.
 *
 * Reads CRON_SECRET from .env, which is the same secret the deployment
 * holds, so the request the database makes is authorised exactly as a
 * Vercel cron would be.
 *
 * Safe to run again. It replaces rather than duplicates.
 */
import { readFileSync } from "node:fs";
import postgres from "postgres";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [
      l.slice(0, l.indexOf("=")),
      l.slice(l.indexOf("=") + 1).replace(/^["']|["']$/g, "").trim(),
    ])
);

const BASE = process.env.BASE ?? "https://www.getfold.org";
const secret = env.CRON_SECRET;

if (!secret) {
  console.error("  CRON_SECRET is not in .env. Nothing to store.");
  process.exit(1);
}

const sql = postgres(env.DIRECT_URL ?? env.DATABASE_URL, { prepare: false });

for (const [name, value] of [
  ["app_base_url", BASE],
  ["cron_secret", secret],
]) {
  const existing = await sql`select id from vault.secrets where name = ${name}`;
  if (existing.length) {
    await sql`select vault.update_secret(${existing[0].id}, ${value}, ${name})`;
    console.log(`  updated ${name}`);
  } else {
    await sql`select vault.create_secret(${value}, ${name})`;
    console.log(`  stored  ${name}`);
  }
}

/* Prove the function can read them, without printing either. */
const [check] = await sql`
  select
    (select decrypted_secret is not null from vault.decrypted_secrets where name='app_base_url') as base,
    (select decrypted_secret is not null from vault.decrypted_secrets where name='cron_secret') as sec`;
console.log(`  readable back: base=${check.base} secret=${check.sec}`);

await sql.end();
