-- Fold, dashboard aggregates. Apply FOURTH.
--
-- Deliberately SECURITY INVOKER (the default), unlike create_organization:
-- the queries below run as the CALLER, so the RLS policies from 0002 apply
-- to every table read. Asking for another church's org_id therefore returns
-- zeros rather than leaking its numbers. The explicit is_org_member guard
-- is belt-and-braces on top of that.
--
-- This exists as one function rather than four client round-trips because
-- PostgREST cannot express SUM() without enabling aggregate functions
-- project-wide, and summing client-side would mean shipping every
-- contribution row to the browser.

create or replace function public.dashboard_stats(org_id uuid)
returns table (
  member_count      bigint,
  week_attendance   bigint,
  month_tithe       numeric,
  pending_transfers bigint
)
language sql
stable
security invoker
as $$
  select
    (select count(*)
       from public.members m
      where m.organization_id = org_id
        and m.status = 'active'),

    (select coalesce(sum(a.male_count + a.female_count), 0)
       from public.attendance_records a
      where a.organization_id = org_id
        and a.date >= date_trunc('week', now())),

    (select coalesce(sum(c.amount), 0)
       from public.contributions c
      where c.organization_id = org_id
        and c.type = 'tithe'
        and c.created_at >= date_trunc('month', now())),

    (select count(*)
       from public.member_transfers t
      where t.organization_id = org_id
        and t.status = 'pending')
  where public.is_org_member(org_id);
$$;

revoke all on function public.dashboard_stats(uuid) from public;
revoke all on function public.dashboard_stats(uuid) from anon;
grant execute on function public.dashboard_stats(uuid) to authenticated;
