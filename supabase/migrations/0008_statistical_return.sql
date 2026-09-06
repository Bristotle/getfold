-- Fold, statistical return figures. Apply EIGHTH.
--
-- Shaped on a Methodist society's return to its circuit (membership,
-- attendance, vital records, income). The field NAMES are generic enough to
-- serve other polities; change the labels in the UI, not this function,
-- when adapting to another denomination.
--
-- SECURITY INVOKER, like dashboard_stats: every count below is subject to
-- the caller's RLS. The practical consequence is that the four income
-- figures come back as 0 for a class leader, because 0006_finance_roles.sql
-- denies them contributions entirely. The report hides that whole section
-- for those roles rather than printing a misleading zero.
--
-- Dates are half-open [p_start, p_end + 1 day) so a return for "January"
-- includes everything recorded on the 31st, whatever the time of day.

create or replace function public.statistical_return(
  org_id  uuid,
  p_start date,
  p_end   date
)
returns table (
  members_total       bigint,
  members_male        bigint,
  members_female      bigint,
  members_joined      bigint,
  members_transferred bigint,
  services_held       bigint,
  attendance_total    bigint,
  attendance_avg      numeric,
  baptisms            bigint,
  confirmations       bigint,
  weddings            bigint,
  deaths              bigint,
  visitors            bigint,
  converts            bigint,
  tithe               numeric,
  offering            numeric,
  other_income        numeric,
  total_income        numeric
)
language sql
stable
security invoker
as $$
  with bounds as (
    select p_start::timestamp as s, (p_end + 1)::timestamp as e
  )
  select
    (select count(*) from public.members m
      where m.organization_id = org_id and m.status = 'active'),
    (select count(*) from public.members m
      where m.organization_id = org_id and m.status = 'active' and m.gender = 'male'),
    (select count(*) from public.members m
      where m.organization_id = org_id and m.status = 'active' and m.gender = 'female'),
    (select count(*) from public.members m, bounds b
      where m.organization_id = org_id and m.joined_at >= b.s and m.joined_at < b.e),
    (select count(*) from public.member_transfers t, bounds b
      where t.organization_id = org_id and t.status = 'approved'
        and t.resolved_at >= b.s and t.resolved_at < b.e),

    (select count(*) from public.attendance_records a, bounds b
      where a.organization_id = org_id and a.date >= b.s and a.date < b.e),
    (select coalesce(sum(a.male_count + a.female_count), 0) from public.attendance_records a, bounds b
      where a.organization_id = org_id and a.date >= b.s and a.date < b.e),
    (select coalesce(round(avg(a.male_count + a.female_count), 0), 0) from public.attendance_records a, bounds b
      where a.organization_id = org_id and a.date >= b.s and a.date < b.e),

    (select count(*) from public.vital_records v, bounds b
      where v.organization_id = org_id and v.type = 'baptism' and v.date >= b.s and v.date < b.e),
    (select count(*) from public.vital_records v, bounds b
      where v.organization_id = org_id and v.type = 'confirmation' and v.date >= b.s and v.date < b.e),
    (select count(*) from public.vital_records v, bounds b
      where v.organization_id = org_id and v.type = 'wedding' and v.date >= b.s and v.date < b.e),
    (select count(*) from public.vital_records v, bounds b
      where v.organization_id = org_id and v.type = 'death' and v.date >= b.s and v.date < b.e),

    (select count(*) from public.visitors vi, bounds b
      where vi.organization_id = org_id and vi.date_of_visit >= b.s and vi.date_of_visit < b.e),
    (select count(*) from public.visitors vi, bounds b
      where vi.organization_id = org_id and vi.converted_member_id is not null
        and vi.date_of_visit >= b.s and vi.date_of_visit < b.e),

    (select coalesce(sum(c.amount), 0) from public.contributions c, bounds b
      where c.organization_id = org_id and c.type = 'tithe'
        and c.created_at >= b.s and c.created_at < b.e),
    (select coalesce(sum(c.amount), 0) from public.contributions c, bounds b
      where c.organization_id = org_id and c.type = 'offering'
        and c.created_at >= b.s and c.created_at < b.e),
    (select coalesce(sum(c.amount), 0) from public.contributions c, bounds b
      where c.organization_id = org_id and c.type not in ('tithe','offering')
        and c.created_at >= b.s and c.created_at < b.e),
    (select coalesce(sum(c.amount), 0) from public.contributions c, bounds b
      where c.organization_id = org_id
        and c.created_at >= b.s and c.created_at < b.e)
  where public.is_org_member(org_id);
$$;

revoke all on function public.statistical_return(uuid, date, date) from public;
revoke all on function public.statistical_return(uuid, date, date) from anon;
grant execute on function public.statistical_return(uuid, date, date) to authenticated;
