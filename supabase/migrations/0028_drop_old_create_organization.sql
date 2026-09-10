-- ============================================================================
-- 0028  Remove the old create_organization overload
-- ============================================================================
--
-- 0026 added two parameters to create_organization using CREATE OR REPLACE.
-- Postgres treats a different argument list as a different function, so
-- that created a SECOND function rather than replacing the first, and calls
-- that do not name every argument became ambiguous:
--
--   ERROR: function public.create_organization(unknown) is not unique
--
-- Every path that creates a church would have failed. Caught by a test
-- rather than by a church on a Sunday, which is the whole point of the
-- rolled back transaction tests.
--
-- The five argument version goes. Anything still calling it gets the seven
-- argument one, whose last two default to null.

drop function if exists public.create_organization(
  text, public."OrganizationType", text, text, text
);
