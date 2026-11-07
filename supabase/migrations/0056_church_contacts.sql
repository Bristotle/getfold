-- ============================================================================
-- 0056  Who to call at each church, and a note of having called
-- ============================================================================
--
-- Some churches stop using Fold after the first weeks, and the founder wants
-- to phone them and ask why. The console knew the pastor's email and
-- nothing else: not their name, not a phone number, not the administrators
-- who often do the actual work.
--
-- The directory now returns the church's leaders (pastor and administrators)
-- with name, role, email and phone, and the phone the church gave when it
-- was set up. These are the account holders' own details, given to Fold to
-- run their account, and the console was already restricted to
-- app_admins.can_view_churches. Nothing about the church's members is added.
--
-- platform_outreach keeps a line for each call or message, so a church
-- is not phoned twice in a week by somebody who did not know. Only Fold
-- staff can read or write it; a church never sees these notes.
--
-- The directory's return type changes, so it is dropped and created again.

create table if not exists public.platform_outreach (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  note            text not null check (char_length(btrim(note)) between 1 and 1000),
  created_by      text not null default coalesce(auth.jwt() ->> 'email', ''),
  created_at      timestamptz not null default now()
);

create index if not exists platform_outreach_org_idx
  on public.platform_outreach (organization_id, created_at desc);

alter table public.platform_outreach enable row level security;

drop policy if exists "platform_outreach: staff read" on public.platform_outreach;
create policy "platform_outreach: staff read" on public.platform_outreach
  for select using (public.is_platform_viewer());

drop policy if exists "platform_outreach: staff write" on public.platform_outreach;
create policy "platform_outreach: staff write" on public.platform_outreach
  for insert with check (
    public.is_platform_viewer()
    and created_by = coalesce(auth.jwt() ->> 'email', '')
  );

-- Migration 0019 revoked the default grants, so RLS needs these to have
-- anything to filter. No update or delete: a note of a call is a record.
grant select, insert on public.platform_outreach to authenticated;

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
  last_sign_in_at     timestamptz,
  church_phone        text,
  leaders             jsonb,
  last_contacted_at   timestamptz,
  last_contact_note   text
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
      where om.organization_id = o.id),
    nullif(btrim(o.phone), ''),
    coalesce((
      select jsonb_agg(jsonb_build_object(
               'name',  nullif(btrim(p.full_name), ''),
               'role',  om.role::text,
               'email', u.email::text,
               'phone', nullif(btrim(coalesce(p.phone, u.phone)), '')
             ) order by case om.role::text when 'pastor' then 0 when 'super_admin' then 1 else 2 end,
                        om.created_at)
        from public.organization_members om
        join auth.users u on u.id = om.profile_id
        left join public.profiles p on p.id = om.profile_id
       where om.organization_id = o.id
         and om.role::text in ('pastor', 'super_admin', 'admin')
    ), '[]'::jsonb),
    (select max(c.created_at) from public.platform_outreach c where c.organization_id = o.id),
    (select c.note from public.platform_outreach c
      where c.organization_id = o.id order by c.created_at desc limit 1)
  from public.organizations o
  order by o.created_at desc;
end;
$$;

revoke all on function public.platform_church_directory() from public, anon;
grant execute on function public.platform_church_directory() to authenticated;
