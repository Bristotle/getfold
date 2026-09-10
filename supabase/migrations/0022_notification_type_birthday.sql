-- ============================================================================
-- 0022  Add 'birthday' to NotificationType
-- ============================================================================
--
-- On its own, deliberately. Postgres refuses to use a new enum value in the
-- same transaction that adds it, so the migration that queries for
-- notifications of type 'birthday' has to be a separate file that runs
-- afterwards. Splitting it is the fix; there is no way to do both at once.

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'NotificationType' and e.enumlabel = 'birthday'
  ) then
    alter type public."NotificationType" add value 'birthday';
  end if;
end $$;
