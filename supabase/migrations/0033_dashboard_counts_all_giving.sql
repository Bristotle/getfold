-- ============================================================================
-- 0033  The dashboard counts all giving, not only tithe
-- ============================================================================
--
-- Found by putting real money through the product. A GHS 10 gift came in by
-- mobile money, was recorded correctly as an offering, and the dashboard
-- went on showing nothing, because the only money figure on it was
--
--   and c.type = 'tithe'
--
-- Offerings, donations, harvest, welfare and everything else were invisible.
-- A pastor looking at the dashboard after a service that collected an
-- offering would conclude the system had not recorded it, and the honest
-- next move is to type it in by hand, which is how one gift becomes two.
--
-- So the function gains month_giving, all contribution types for the month,
-- and keeps month_tithe beside it because the tithe figure is the one a
-- circuit asks for by name.
--
-- The return type changes, so the function has to be dropped rather than
-- replaced. Its grants are restored explicitly below: dropping a function
-- takes its ACL with it, and the page would break for every church if that
-- were forgotten. It stays SECURITY INVOKER so row level security continues
-- to decide what may be summed.

drop function if exists public.dashboard_stats(uuid);

create function public.dashboard_stats(org_id uuid)
returns table (
  member_count      bigint,
  week_attendance   bigint,
  month_tithe       numeric,
  month_giving      numeric,
  pending_transfers bigint
)
language sql
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

    -- Everything given this month, however it came in and whatever it was
    -- called. This is the number a treasurer reconciles against the bank.
    (select coalesce(sum(c.amount), 0) from public.contributions c
      where c.organization_id = org_id
        and c.created_at >= date_trunc('month', now())),

    (select count(*) from public.member_transfers t
      where t.to_organization_id = org_id and t.status = 'pending');
$$;

revoke all on function public.dashboard_stats(uuid) from public;
revoke all on function public.dashboard_stats(uuid) from anon;
grant execute on function public.dashboard_stats(uuid) to authenticated;
grant execute on function public.dashboard_stats(uuid) to service_role;
