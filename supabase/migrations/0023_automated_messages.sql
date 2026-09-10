-- ============================================================================
-- 0023  Automated messages: welcome, thank you, and birthdays
-- ============================================================================
--
-- Runs after 0022, which adds the 'birthday' enum value this file queries.
--
-- Three texts a church would otherwise have to remember to send by hand.
--
-- ALL THREE ARE OFF BY DEFAULT, and that is not timidity. Turning them on
-- spends two things that are not ours to spend: the church's standing with
-- its own members, and SMS credits. A church that finds we have been
-- texting its congregation without being asked has a legitimate complaint,
-- and one annoyed member tells the whole society.


alter table public.organizations
  add column if not exists sms_welcome_enabled  boolean not null default false,
  add column if not exists sms_thanks_enabled   boolean not null default false,
  add column if not exists sms_birthday_enabled boolean not null default false;

comment on column public.organizations.sms_welcome_enabled is
  'Off by default. Texting a congregation is the church''s reputation to spend, not ours.';

-- ---------------------------------------------------------------------------
-- Who has a birthday today.
--
-- SECURITY DEFINER and service_role only: the daily job runs on a schedule
-- with no user session and legitimately reads across every church.
--
-- Matches on day and month, so it works for a member whose recorded year is
-- a guess, which many are. Excludes anyone already greeted this calendar
-- year, so a re-run or a retry cannot text somebody twice.
-- ---------------------------------------------------------------------------
create or replace function public.birthdays_today()
returns table (
  organization_id   uuid,
  organization_name text,
  member_id         uuid,
  member_name       text,
  phone             text
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.name, m.id, m.full_name, m.phone
  from public.members m
  join public.organizations o on o.id = m.organization_id
  where o.sms_birthday_enabled
    and m.status = 'active'
    and m.date_of_birth is not null
    and m.phone is not null
    and trim(m.phone) <> ''
    and extract(month from m.date_of_birth) = extract(month from (now() at time zone 'Africa/Accra'))
    and extract(day   from m.date_of_birth) = extract(day   from (now() at time zone 'Africa/Accra'))
    and not exists (
      select 1 from public.notifications n
      where n.member_id = m.id
        and n.type = 'birthday'
        and n.created_at >= date_trunc('year', now())
    );
$$;

revoke all on function public.birthdays_today() from public;
revoke all on function public.birthdays_today() from anon;
revoke all on function public.birthdays_today() from authenticated;
grant execute on function public.birthdays_today() to service_role;
