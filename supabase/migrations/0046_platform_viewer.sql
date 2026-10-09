-- ============================================================================
-- 0046  Fold support can look at a church, read only, and the church sees it
-- ============================================================================
--
-- The founder needs to be able to see any church's records to support it:
-- "my members are not showing", "the return is wrong". Until now the only
-- way was the SQL editor, which bypasses every rule and leaves no trace.
--
-- Three decisions, each deliberate:
--
-- READ ONLY. Every policy added here is FOR SELECT. No insert, update or
-- delete policy is touched, so support can see a church and cannot change
-- it, exactly like oversight. public.oversees() is NOT widened to do this,
-- because create_branch() also calls it to decide who may ADD a branch.
--
-- ONE CHURCH, FOR AN HOUR, ON PURPOSE. Access is not standing. The viewer
-- opens a church through start_platform_view(), which grants that church
-- alone for sixty minutes. Standing access to every church would also make
-- every unfiltered list in the founder's own dashboard return every
-- church's rows, and would mean a stolen session read the whole platform.
--
-- THE CHURCH CAN SEE IT. Opening a church writes "Fold support viewed your
-- church" into that church's own activity log, which its leaders read and
-- which nobody can edit. Support access a church cannot see is surveillance.
--
-- Who may do this is app_admins.can_view_churches, set only in the SQL
-- editor. It is a separate switch from app_admins itself, which governs the
-- enquiries page, so being able to read enquiries does not grant this.

-- ---------------------------------------------------------------------------
-- 1. Who may view churches.
-- ---------------------------------------------------------------------------
alter table public.app_admins
  add column if not exists can_view_churches boolean not null default false;

comment on column public.app_admins.can_view_churches is
  'May open any church read only through start_platform_view(). Set in the SQL editor only.';

-- ---------------------------------------------------------------------------
-- 2. Open views. No policy and no grant, so only the functions below can
--    read or write it.
-- ---------------------------------------------------------------------------
create table if not exists public.platform_views (
  profile_id      uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  started_at      timestamptz not null default now(),
  expires_at      timestamptz not null,
  primary key (profile_id, organization_id)
);

alter table public.platform_views enable row level security;
revoke all on public.platform_views from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. The questions the policies ask.
--
-- Both return arrays and are called as coalesce((select ...), '{}') in the
-- policies. The scalar subquery makes Postgres evaluate them once per
-- statement rather than once per row; the coalesce is what makes it an
-- array expression, because "= any ((select f()))" on its own parses as a
-- subquery returning one uuid[] and fails with uuid = uuid[].
-- Every user's every query passes through these policies, and for anybody
-- who is not a viewer the answer is an empty array.
-- ---------------------------------------------------------------------------
create or replace function public.is_platform_viewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins
    where can_view_churches
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.platform_view_orgs()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(v.organization_id), '{}')
  from public.platform_views v
  where v.profile_id = auth.uid()
    and v.expires_at > now()
    and public.is_platform_viewer();
$$;

-- Team members' names, which live on profiles rather than on the church.
create or replace function public.platform_view_profiles()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct om.profile_id), '{}')
  from public.organization_members om
  where om.organization_id = any (public.platform_view_orgs());
$$;

revoke all on function public.is_platform_viewer()     from public, anon;
revoke all on function public.platform_view_orgs()     from public, anon;
revoke all on function public.platform_view_profiles() from public, anon;
grant execute on function public.is_platform_viewer()     to authenticated;
grant execute on function public.platform_view_orgs()     to authenticated;
grant execute on function public.platform_view_profiles() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Read policies. Added alongside the existing ones, never replacing
--    them: permissive policies combine with OR, so every existing rule
--    stands exactly as it was. Dropping these policies undoes this file.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'activity_log', 'attendance_check_ins', 'attendance_records',
    'contributions', 'funds', 'invoices', 'member_groups',
    'member_transfers', 'members', 'notifications',
    'organization_invitations', 'organization_members', 'payments',
    'visitors', 'vital_records', 'meetings'
  ] loop
    -- meetings arrives in 0045; skip it quietly if that has not run.
    continue when to_regclass('public.' || t) is null;
    execute format('drop policy if exists "%1$s: platform viewer reads" on public.%1$s', t);
    execute format(
      'create policy "%1$s: platform viewer reads" on public.%1$s
         for select to authenticated
         using (organization_id = any (coalesce((select public.platform_view_orgs()), ''{}'')))', t);
  end loop;
end $$;

drop policy if exists "organizations: platform viewer reads" on public.organizations;
create policy "organizations: platform viewer reads" on public.organizations
  for select to authenticated
  using (id = any (coalesce((select public.platform_view_orgs()), '{}')));

drop policy if exists "profiles: platform viewer reads" on public.profiles;
create policy "profiles: platform viewer reads" on public.profiles
  for select to authenticated
  using (id = any (coalesce((select public.platform_view_profiles()), '{}')));

-- ---------------------------------------------------------------------------
-- 5. A view is a fact in the church's own log.
-- ---------------------------------------------------------------------------
alter table public.activity_log drop constraint if exists activity_log_action_check;
alter table public.activity_log
  add constraint activity_log_action_check
  check (action in ('created', 'updated', 'deleted', 'viewed'));

-- ---------------------------------------------------------------------------
-- 6. Open and close a view.
-- ---------------------------------------------------------------------------
create or replace function public.start_platform_view(org_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  uid     uuid := auth.uid();
  ends_at timestamptz := now() + interval '60 minutes';
begin
  if uid is null or not public.is_platform_viewer() then
    raise exception 'Not permitted.' using errcode = '42501';
  end if;

  if not exists (select 1 from public.organizations where id = org_id) then
    raise exception 'No such church.' using errcode = 'P0002';
  end if;

  insert into public.platform_views (profile_id, organization_id, expires_at)
  values (uid, org_id, ends_at)
  on conflict (profile_id, organization_id)
  do update set started_at = now(), expires_at = excluded.expires_at;

  insert into public.activity_log (
    organization_id, actor_profile_id, actor_name,
    action, entity, entity_id, summary
  )
  values (
    org_id, uid, 'Fold support',
    'viewed', 'organizations', org_id,
    'Fold support opened your church''s records to look, read only, for up to an hour'
  );

  return ends_at;
end;
$$;

create or replace function public.end_platform_view(org_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.platform_views
  where profile_id = auth.uid() and organization_id = org_id;
$$;

-- ---------------------------------------------------------------------------
-- 7. The directory: which churches exist, so there is something to open.
--
-- Deliberately thin. Name, status, size and the pastor's email, which is
-- what support needs to find a church and reply to it. Nothing from inside
-- the church: that needs start_platform_view(), which is logged.
-- ---------------------------------------------------------------------------
create or replace function public.platform_church_directory()
returns table (
  organization_id     uuid,
  name                text,
  type                text,
  denomination        text,
  subscription_status text,
  trial_ends_at       timestamptz,
  created_at          timestamptz,
  member_count        bigint,
  pastor_email        text
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
      limit 1)
  from public.organizations o
  order by o.created_at desc;
end;
$$;

revoke all on function public.start_platform_view(uuid)      from public, anon;
revoke all on function public.end_platform_view(uuid)        from public, anon;
revoke all on function public.platform_church_directory()    from public, anon;
grant execute on function public.start_platform_view(uuid)   to authenticated;
grant execute on function public.end_platform_view(uuid)     to authenticated;
grant execute on function public.platform_church_directory() to authenticated;
