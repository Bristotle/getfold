-- Fold, Row-Level Security setup. Apply this SECOND.
--
-- Step 1: `npx prisma migrate deploy` creates the tables
--         (prisma/migrations/20260904000000_init).
-- Step 2: run this file, e.g. paste into the Supabase SQL Editor.
--
-- Multi-tenancy is enforced HERE, at the database level, not in
-- application code. Every tenant-scoped table gets a policy that
-- checks the requesting user has an organization_member row for that
-- organization_id. This means even a bug in the Next.js app can't leak
-- one church's data into another's, Postgres refuses the query.

-- ---------- 1. Auto-create a profile row when a new auth user signs up ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- 2. Helper: does the current user belong to this organization? ----------

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.profile_id = auth.uid()
  );
$$;

create or replace function public.org_role(org_id uuid)
returns text
language sql
security definer
stable
as $$
  select role::text
  from public.organization_members om
  where om.organization_id = org_id
    and om.profile_id = auth.uid()
  limit 1;
$$;

-- ---------- 3. Enable RLS on every tenant-scoped table ----------

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.member_groups enable row level security;
alter table public.members enable row level security;
alter table public.visitors enable row level security;
alter table public.member_transfers enable row level security;
alter table public.attendance_records enable row level security;
alter table public.funds enable row level security;
alter table public.contributions enable row level security;
alter table public.vital_records enable row level security;

-- ---------- 4. Policies ----------
-- Pattern repeated per table: members of an org can read that org's
-- rows; admin/minister/finance_officer roles can write. Adjust the
-- write-role list per table as the app's permission model firms up.

-- profiles: a user can see their own profile, and profiles of people
-- who share at least one organization with them (so staff lists work).
create policy "profiles: self and org-mates readable"
  on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.organization_members mine
      join public.organization_members theirs
        on theirs.organization_id = mine.organization_id
      where mine.profile_id = auth.uid()
        and theirs.profile_id = public.profiles.id
    )
  );

create policy "profiles: self update"
  on public.profiles for update
  using (id = auth.uid());

-- organizations: visible to members; only super_admin/admin can update.
create policy "organizations: members can read"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "organizations: admins can update"
  on public.organizations for update
  using (public.org_role(id) in ('super_admin', 'admin'));

-- organization_members: visible to org-mates; only admins manage roles.
create policy "organization_members: org-mates readable"
  on public.organization_members for select
  using (public.is_org_member(organization_id));

create policy "organization_members: admins manage"
  on public.organization_members for insert
  with check (public.org_role(organization_id) in ('super_admin', 'admin'));

create policy "organization_members: admins update"
  on public.organization_members for update
  using (public.org_role(organization_id) in ('super_admin', 'admin'));

create policy "organization_members: admins delete"
  on public.organization_members for delete
  using (public.org_role(organization_id) in ('super_admin', 'admin'));

-- Generic tenant-table policy generator, applied per table below.
-- (Written out explicitly per table for clarity in a starter scaffold, -- once the pattern is proven, wrap this in a plpgsql loop.)

do $$
declare
  t text;
  tenant_tables text[] := array[
    'member_groups', 'members', 'visitors', 'member_transfers',
    'attendance_records', 'funds', 'contributions', 'vital_records'
  ];
begin
  foreach t in array tenant_tables loop
    execute format(
      'create policy "%1$s: org-mates read" on public.%1$s for select
         using (public.is_org_member(organization_id));', t
    );
    execute format(
      'create policy "%1$s: staff write" on public.%1$s for insert
         with check (public.org_role(organization_id) in
           (''super_admin'',''admin'',''minister'',''finance_officer'',''class_leader''));', t
    );
    execute format(
      'create policy "%1$s: staff update" on public.%1$s for update
         using (public.org_role(organization_id) in
           (''super_admin'',''admin'',''minister'',''finance_officer'',''class_leader''));', t
    );
    execute format(
      'create policy "%1$s: admins delete" on public.%1$s for delete
         using (public.org_role(organization_id) in (''super_admin'',''admin''));', t
    );
  end loop;
end $$;
