-- ============================================================================
-- 0049  The support console shows which churches are alive
-- ============================================================================
--
-- The founder asked to see each church's activity from the console. The
-- directory said who a church is but not whether anybody uses it, which is
-- the first thing support and sales both want to know.
--
-- Counts and times only: when the church last changed anything, how many
-- changes this week, when somebody on its team last signed in, and how big
-- the team is. Never what was changed. Reading the activity itself still
-- means opening the church with start_platform_view(), which the church
-- sees in its own log. Fold support's own visits are not counted as the
-- church being active.
--
-- The return type changes, so the function is dropped and created again
-- rather than replaced; create or replace refuses a different result.

drop function if exists public.platform_church_directory();

create function public.platform_church_directory()
returns table (
  organization_id     uuid,
  name                text,
  type                text,
  denomination        text,
  subscription_status text,
  trial_ends_at       timestamptz,
  created_at          timestamptz,
  member_count        bigint,
  pastor_email        text,
  team_count          bigint,
  last_active_at      timestamptz,
  changes_this_week   bigint,
  last_sign_in_at     timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_platform_viewer() then
    raise exception 'Not permitted.' using errcode = '42501';
  end if;

  return query
  select
    o.id, o.name, o.type::text, o.denomination,
    o.subscription_status::text, o.trial_ends_at, o.created_at at time zone 'UTC',
    (select count(*) from public.members m
      where m.organization_id = o.id and m.status = 'active'),
    (select u.email::text
       from public.organization_members om
       join auth.users u on u.id = om.profile_id
      where om.organization_id = o.id and om.role = 'pastor'
      limit 1),
    (select count(*) from public.organization_members om where om.organization_id = o.id),
    (select max(a.created_at) from public.activity_log a
      where a.organization_id = o.id and a.actor_name <> 'Fold support'),
    (select count(*) from public.activity_log a
      where a.organization_id = o.id and a.actor_name <> 'Fold support'
        and a.created_at > now() - interval '7 days'),
    (select max(u.last_sign_in_at)
       from public.organization_members om
       join auth.users u on u.id = om.profile_id
      where om.organization_id = o.id)
  from public.organizations o
  order by o.created_at desc;
end;
$$;

revoke all on function public.platform_church_directory() from public, anon;
grant execute on function public.platform_church_directory() to authenticated;
