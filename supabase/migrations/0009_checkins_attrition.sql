-- Fold, per-member check-in + silent attrition detection. Apply NINTH.

alter table public.attendance_check_ins enable row level security;

drop policy if exists "check_ins: org-mates read"   on public.attendance_check_ins;
drop policy if exists "check_ins: staff write"      on public.attendance_check_ins;
drop policy if exists "check_ins: staff delete"     on public.attendance_check_ins;

create policy "check_ins: org-mates read"
  on public.attendance_check_ins for select
  using (public.is_org_member(organization_id));

create policy "check_ins: staff write"
  on public.attendance_check_ins for insert
  with check (public.org_role(organization_id) in
    ('super_admin','admin','minister','finance_officer','class_leader'));

create policy "check_ins: staff delete"
  on public.attendance_check_ins for delete
  using (public.org_role(organization_id) in
    ('super_admin','admin','minister','finance_officer','class_leader'));

-- ---------- Silent attrition ----------
--
-- The question a pastor actually asks: "who used to be here and quietly
-- isn't any more?" That is deliberately NOT the same as "who has low
-- attendance", someone who has never attended much is not drifting, they
-- are simply not very involved. Attrition is a CHANGE against a person's
-- own baseline.
--
-- So for each active member we compare a recent window against the earlier
-- baseline window, and only flag people whose own participation has fallen.
-- Members with no history at all are excluded rather than flagged, because
-- there is nothing to have declined from.
--
-- SECURITY INVOKER: giving figures come back as 0 for roles that cannot read
-- contributions, so a class leader still gets the attendance signal without
-- seeing money. The UI says which signals are in play.

create or replace function public.attrition_watchlist(
  org_id        uuid,
  recent_weeks  int default 6,
  baseline_weeks int default 18
)
returns table (
  member_id          uuid,
  full_name          text,
  phone              text,
  group_name         text,
  last_attended      date,
  weeks_since_seen   int,
  recent_attendance  bigint,
  baseline_rate      numeric,
  recent_rate        numeric,
  last_gave          date,
  weeks_since_gave   int,
  risk               int
)
language sql
stable
security invoker
as $$
  with
  win as (
    select
      (current_date - (recent_weeks * 7))::date  as recent_from,
      (current_date - (baseline_weeks * 7))::date as baseline_from
  ),
  -- Services the church actually held in each window: attendance can only
  -- be judged against opportunities to attend, not against the calendar.
  services as (
    select
      count(*) filter (where a.date >= w.recent_from)                                as recent_services,
      count(*) filter (where a.date >= w.baseline_from and a.date < w.recent_from)   as baseline_services
    from public.attendance_records a, win w
    where a.organization_id = org_id and a.date >= w.baseline_from
  ),
  per_member as (
    select
      m.id,
      m.full_name,
      m.phone,
      g.name as group_name,
      (max(a.date) filter (where c.id is not null))::date as last_attended,
      count(c.id) filter (where a.date >= (select recent_from from win))              as recent_attendance,
      count(c.id) filter (where a.date >= (select baseline_from from win)
                            and a.date <  (select recent_from from win))              as baseline_attendance
    from public.members m
    left join public.member_groups g on g.id = m.member_group_id
    left join public.attendance_check_ins c on c.member_id = m.id
    left join public.attendance_records a on a.id = c.attendance_record_id
    where m.organization_id = org_id and m.status = 'active'
    group by m.id, m.full_name, m.phone, g.name
  ),
  giving as (
    select ct.member_id, max(ct.created_at)::date as last_gave
    from public.contributions ct
    where ct.organization_id = org_id and ct.member_id is not null
    group by ct.member_id
  )
  select
    pm.id,
    pm.full_name,
    pm.phone,
    pm.group_name,
    pm.last_attended,
    case when pm.last_attended is null then null
         else ((current_date - pm.last_attended) / 7)::int end,
    pm.recent_attendance,
    case when s.baseline_services > 0
         then round(pm.baseline_attendance::numeric / s.baseline_services, 2) else null end,
    case when s.recent_services > 0
         then round(pm.recent_attendance::numeric / s.recent_services, 2) else null end,
    gv.last_gave,
    case when gv.last_gave is null then null
         else ((current_date - gv.last_gave) / 7)::int end,
    -- Risk is a plain additive score, not a model: it must be explainable to
    -- a pastor who is deciding whether to visit someone.
    (
      case when s.baseline_services > 0 and s.recent_services > 0
            and pm.baseline_attendance::numeric / s.baseline_services >= 0.5
            and pm.recent_attendance::numeric / s.recent_services = 0 then 3
           when s.baseline_services > 0 and s.recent_services > 0
            and pm.baseline_attendance::numeric / s.baseline_services >= 0.5
            and pm.recent_attendance::numeric / s.recent_services
                < (pm.baseline_attendance::numeric / s.baseline_services) * 0.5 then 2
           else 0 end
      +
      case when pm.last_attended is not null
            and (current_date - pm.last_attended) / 7 >= recent_weeks then 1 else 0 end
      +
      case when gv.last_gave is not null
            and (current_date - gv.last_gave) / 7 >= recent_weeks then 1 else 0 end
    )::int as risk
  from per_member pm
  cross join services s
  left join giving gv on gv.member_id = pm.id
  where public.is_org_member(org_id)
    -- Only people with a real baseline can have declined from it.
    and pm.baseline_attendance > 0
  order by risk desc, pm.last_attended asc nulls last;
$$;

revoke all on function public.attrition_watchlist(uuid, int, int) from public;
revoke all on function public.attrition_watchlist(uuid, int, int) from anon;
grant execute on function public.attrition_watchlist(uuid, int, int) to authenticated;
