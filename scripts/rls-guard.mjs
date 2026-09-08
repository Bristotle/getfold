/**
 * Fails if any table in the public schema is reachable without row level
 * security.
 *
 * Supabase grants anon and authenticated full DML on new tables in public
 * by design, because RLS rather than grants is meant to be the boundary.
 * The consequence is that a table created without RLS is born world
 * writable. That is exactly how _prisma_migrations ended up readable and
 * deletable by anyone holding the public anon key.
 *
 * Run this after every migration.
 *   node scripts/rls-guard.mjs
 */
import { readFileSync } from "node:fs";
import pg from "pg";

const url = readFileSync(".env", "utf8")
  .split("\n")
  .find((l) => l.startsWith("DIRECT_URL="))
  ?.slice("DIRECT_URL=".length)
  .replace(/^["']|["']$/g, "")
  .trim();

const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();

const { rows } = await c.query(`
  select c.relname as table_name,
         c.relrowsecurity as rls,
         (select count(*) from pg_policies p
           where p.schemaname='public' and p.tablename=c.relname)::int as policies,
         coalesce((select string_agg(distinct g.grantee, ',')
           from information_schema.role_table_grants g
           where g.table_schema='public' and g.table_name=c.relname
             and g.grantee in ('anon','authenticated')), '') as public_roles
  from pg_class c
  join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind='r'
  order by c.relname;
`);
await c.end();

const exposed = rows.filter((r) => !r.rls && r.public_roles !== "");
const rlsNoPolicy = rows.filter((r) => r.rls && r.policies === 0);

for (const r of rows) {
  const state = r.rls ? "rls on " : "RLS OFF";
  const reach = r.public_roles || "owner only";
  console.log(`  ${r.table_name.padEnd(30)} ${state}  policies=${String(r.policies).padEnd(2)}  reachable by: ${reach}`);
}

console.log();
if (rlsNoPolicy.length) {
  console.log("  note: RLS on with no policies denies everyone except roles that bypass");
  console.log("        (" + rlsNoPolicy.map((r) => r.table_name).join(", ") + ")");
}

if (exposed.length === 0) {
  console.log("\n  PASS: no table in public is reachable by anon or authenticated without RLS.");
  process.exit(0);
}
console.log("\n  FAIL: these tables are granted to anon or authenticated with RLS off:");
for (const r of exposed) console.log(`    ${r.table_name}  ->  ${r.public_roles}`);
process.exit(1);
