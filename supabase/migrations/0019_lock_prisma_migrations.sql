-- ============================================================================
-- 0019  Close the one table that was publicly readable and writable
-- ============================================================================
--
-- Supabase flagged rls_disabled_in_public. Verified against the live project
-- with nothing but the public anon key:
--
--   GET    /rest/v1/_prisma_migrations  -> 200, full migration history
--   DELETE /rest/v1/_prisma_migrations  -> 204, write access confirmed
--
-- The delete was filtered to an id that cannot exist, so it proved
-- authorisation without touching a row.
--
-- What was actually at risk. This table holds migration names, checksums and
-- timestamps. No member data, no giving, no credentials, and every other
-- table in the schema had RLS on and correctly returned nothing to anon.
-- So this was not a data breach. It was information disclosure, our schema
-- history readable by anyone, plus the ability to wipe the migration ledger,
-- which would not destroy church data but would break future migrations and
-- leave us unable to tell what had been applied.
--
-- WHY IT HAPPENED, which matters more than the table itself. Supabase sets
-- default privileges granting anon and authenticated full DML on every new
-- table in public. That is deliberate on their part: RLS, not grants, is
-- meant to be the boundary. Prisma created this table outside our migrations
-- and therefore outside the `alter table ... enable row level security` we
-- run on everything else, so it inherited the grants and got no policy.
--
-- The lesson generalises: ANY table created without RLS is born world
-- writable. scripts/rls-guard.mjs now checks for that.

-- Take the grants away. Prisma connects as the owner through DIRECT_URL and
-- owners bypass RLS, so migrations keep working.
revoke all on public._prisma_migrations from anon;
revoke all on public._prisma_migrations from authenticated;

-- Belt as well as braces. With RLS on and no policy, the table denies every
-- role that does not bypass it, so a future grant cannot silently reopen it.
alter table public._prisma_migrations enable row level security;

-- Stop the default privileges handing the next Prisma-created table the same
-- grants. This narrows only what anon and authenticated get by default;
-- service_role and postgres are untouched.
alter default privileges in schema public
  revoke all on tables from anon;
alter default privileges in schema public
  revoke all on tables from authenticated;

-- Our own tables are granted explicitly in their own migrations and protected
-- by RLS, so nothing we ship depends on the default.
