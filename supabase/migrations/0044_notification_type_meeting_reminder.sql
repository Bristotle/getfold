-- ============================================================================
-- 0044  Add 'meeting_reminder' to NotificationType
-- ============================================================================
--
-- On its own, for the same reason as 0022: Postgres refuses to use a new
-- enum value in the transaction that adds it, and 0045 inserts rows of
-- this type.

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'NotificationType' and e.enumlabel = 'meeting_reminder'
  ) then
    alter type public."NotificationType" add value 'meeting_reminder';
  end if;
end $$;
