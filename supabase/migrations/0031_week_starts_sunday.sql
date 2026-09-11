-- ============================================================================
-- 0031  A church's week starts on Sunday
-- ============================================================================
--
-- dashboard_stats counted "this week's attendance" from date_trunc('week'),
-- and Postgres weeks start on Monday. So a church whose main service is on
-- Sunday saw zero for this week from Monday to Saturday: the service had
-- happened, it was on the register, and the headline tile said nothing had.
-- Six days out of seven the most prominent figure on the dashboard was
-- wrong, and it was found by seeding a demo church on a Friday.
--
-- "This week" now means since the most recent Sunday, inclusive, so a Sunday
-- service counts until the next one replaces it. rollup_stats moves to the
-- same rule so the two never disagree.

create or replace function public.dashboard_stats(org_id uuid)
returns table (
  member_count      bigint,
  week_attendance   bigint,
  month_tithe       numeric,
  pending_transfers bigint
)
language sql
security invoker
stable
as $$
  select
    (select count(*) from public.members m
      where m.organization_id = org_id and m.status = 'active'),

    (select coalesce(sum(a.male_count + a.female_count), 0)
       from public.attendance_records a
      where a.organization_id = org_id
        -- most recent Sunday, inclusive
        and a.date >= current_date - extract(dow from current_date)::int),

    (select coalesce(sum(c.amount), 0) from public.contributions c
      where c.organization_id = org_id
        and c.type = 'tithe'
        and c.created_at >= date_trunc('month', now())),

    (select count(*) from public.member_transfers t
      where t.to_organization_id = org_id and t.status = 'pending');
$$;

create or replace function public.rollup_stats(root uuid)
returns table (
  churches          bigint,
  member_count      bigint,
  week_attendance   bigint,
  month_tithe       numeric,
  pending_transfers bigint
)
language sql
security invoker
stable
as $$
  with tree as (select id from public.org_descendants(root))
  select
    (select count(*) from tree),
    (select count(*) from public.members m
      where m.organization_id in (select id from tree) and m.status = 'active'),
    (select coalesce(sum(a.male_count + a.female_count), 0)
      from public.attendance_records a
      where a.organization_id in (select id from tree)
        and a.date >= current_date - extract(dow from current_date)::int),
    (select coalesce(sum(c.amount), 0) from public.contributions c
      where c.organization_id in (select id from tree)
        and c.type = 'tithe'
        and c.created_at >= date_trunc('month', now())),
    (select count(*) from public.member_transfers t
      where t.to_organization_id in (select id from tree)
        and t.status = 'pending');
$$;
