-- ============================================================================
-- 0030  Branches at any depth, and oversight from above
-- ============================================================================
--
-- 0017 built branches one level deep, with access granted by a real
-- membership row in each child. That was the right first cut and the
-- wrong final shape: a national headquarters with twenty regions, two
-- hundred districts and two thousand assemblies cannot be modelled by
-- inserting two thousand membership rows for every overseer.
--
-- So this adds a second, narrower kind of access alongside membership:
--
--   OVERSIGHT. The caller leads an ANCESTOR of this church.
--
-- And it is deliberately READ ONLY. A regional overseer sees every
-- assembly beneath them. They do not add members to one, record its
-- attendance, or touch its giving. Writing into a church is still the job
-- of somebody who belongs to it. That is what keeps this change small:
-- SELECT policies gain one clause, and every INSERT, UPDATE and DELETE
-- policy is untouched.
--
-- Oversight requires a leadership role in the ancestor, not any role. A
-- class leader at headquarters does not thereby see every assembly in the
-- country.

-- ---------------------------------------------------------------------------
-- 1. Any depth. The one level rule from 0017 goes.
-- ---------------------------------------------------------------------------
create or replace function public.create_branch(
  parent_id   uuid,
  branch_name text,
  branch_type public."OrganizationType" default 'local_church'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid         uuid := auth.uid();
  caller_role text;
  base_slug   text;
  final_slug  text;
  n           int := 0;
  new_id      uuid;
  depth       int;
begin
  if uid is null then
    raise exception 'You must be signed in.' using errcode = '42501';
  end if;

  if coalesce(trim(branch_name), '') = '' then
    raise exception 'The branch needs a name.' using errcode = '22023';
  end if;

  -- Must lead the parent, by membership OR by oversight from above it.
  select om.role::text into caller_role
  from public.organization_members om
  where om.organization_id = parent_id and om.profile_id = uid;

  if (caller_role is null or caller_role not in ('super_admin', 'pastor', 'admin'))
     and not public.oversees(parent_id) then
    raise exception 'Only the pastor or an administrator can add a branch.'
      using errcode = '42501';
  end if;

  -- A sanity ceiling, not a product rule. Nobody has a denomination twelve
  -- layers deep, and a runaway loop creating branches under branches
  -- should hit a wall before it hits the disk.
  with recursive up as (
    select id, parent_organization_id, 1 as d from public.organizations where id = parent_id
    union all
    select o.id, o.parent_organization_id, up.d + 1
    from public.organizations o join up on o.id = up.parent_organization_id
  )
  select max(d) into depth from up;

  if depth >= 12 then
    raise exception 'That is deeper than any church structure. Check the parent.'
      using errcode = '22023';
  end if;

  base_slug := trim(both '-' from
    regexp_replace(lower(trim(branch_name)), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then base_slug := 'branch'; end if;

  final_slug := base_slug;
  while exists (select 1 from public.organizations o where o.slug = final_slug) loop
    n := n + 1;
    final_slug := base_slug || '-' || n;
  end loop;

  insert into public.organizations (name, slug, type, parent_organization_id, denomination)
  select trim(branch_name), final_slug, branch_type, parent_id, p.denomination
  from public.organizations p where p.id = parent_id
  returning id into new_id;

  -- The creator still gets a membership row in the new branch, so the
  -- person who set it up can also work inside it. Oversight alone would
  -- only let them look.
  insert into public.organization_members (organization_id, profile_id, role)
  values (new_id, uid, coalesce(caller_role, 'admin')::public."OrgRole");

  return new_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Every church beneath a church, at any depth. Used by roll ups.
-- ---------------------------------------------------------------------------
-- RETURNS TABLE (id uuid) rather than SETOF uuid on purpose: a setof
-- scalar has an anonymous column, so "select id from org_descendants(x)"
-- fails with "column id does not exist". Naming it is what makes the
-- function usable inside another query.
create or replace function public.org_descendants(root uuid)
returns table (id uuid)
language sql
stable
security invoker
as $$
  with recursive down as (
    select id from public.organizations where id = root
    union all
    select o.id from public.organizations o
    join down on o.parent_organization_id = down.id
  )
  select id from down;
$$;

-- ---------------------------------------------------------------------------
-- 3. Does the caller lead an ancestor of this church?
--
-- SECURITY DEFINER because it walks the organizations table, which the
-- caller may not be able to see all of, and it must answer correctly
-- regardless. STABLE so the planner can cache it within a statement.
-- ---------------------------------------------------------------------------
create or replace function public.oversees(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with recursive up as (
    select parent_organization_id as id
    from public.organizations where id = org_id
    union all
    select o.parent_organization_id
    from public.organizations o join up on o.id = up.id
    where o.parent_organization_id is not null
  )
  select exists (
    select 1
    from up
    join public.organization_members om on om.organization_id = up.id
    where up.id is not null
      and om.profile_id = auth.uid()
      and om.role in ('super_admin', 'pastor', 'admin')
  );
$$;

revoke all on function public.oversees(uuid) from public;
grant execute on function public.oversees(uuid) to authenticated;
revoke all on function public.org_descendants(uuid) from public;
grant execute on function public.org_descendants(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Read policies gain the oversight clause. Nothing else changes.
-- ---------------------------------------------------------------------------

-- The church itself, so the tree can be listed from the top.
drop policy if exists "organizations: members can read" on public.organizations;
create policy "organizations: members can read" on public.organizations
  for select using (public.is_org_member(id) or public.oversees(id));

-- The ordinary tenant tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'member_groups', 'members', 'visitors', 'member_transfers',
    'attendance_records', 'vital_records'
  ] loop
    execute format('drop policy if exists "%1$s: org-mates read" on public.%1$s;', t);
    execute format(
      'create policy "%1$s: org-mates read" on public.%1$s for select
         using (public.is_org_member(organization_id) or public.oversees(organization_id));', t
    );
  end loop;
end $$;

drop policy if exists "check_ins: org-mates read" on public.attendance_check_ins;
create policy "check_ins: org-mates read" on public.attendance_check_ins
  for select
  using (public.is_org_member(organization_id) or public.oversees(organization_id));

-- Giving. Oversight already requires leadership above, which is at least
-- as strict as the finance roles list below, so an overseer reading a
-- branch's giving is a superintendent reading a society's books, which is
-- exactly what a superintendent does.
drop policy if exists "contributions: finance roles read" on public.contributions;
create policy "contributions: finance roles read" on public.contributions
  for select
  using (
    public.org_role(organization_id) in ('super_admin','pastor','admin','minister','finance_officer')
    or public.oversees(organization_id)
  );

drop policy if exists "funds: finance roles read" on public.funds;
create policy "funds: finance roles read" on public.funds
  for select
  using (
    public.org_role(organization_id) in ('super_admin','pastor','admin','minister','finance_officer')
    or public.oversees(organization_id)
  );

-- ---------------------------------------------------------------------------
-- 5. Roll up. The dashboard figures for a church AND everything beneath it.
--
-- SECURITY INVOKER: RLS decides what the caller may sum. An overseer
-- summing a region gets the assemblies they oversee; a stranger gets zero.
-- ---------------------------------------------------------------------------
create or replace function public.rollup_stats(root uuid)
returns table (
  churches        bigint,
  member_count    bigint,
  week_attendance bigint,
  month_tithe     numeric,
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
        and a.date >= (current_date - 6)),
    (select coalesce(sum(c.amount), 0) from public.contributions c
      where c.organization_id in (select id from tree)
        and c.type = 'tithe'
        and c.created_at >= date_trunc('month', now())),
    (select count(*) from public.member_transfers t
      where t.to_organization_id in (select id from tree)
        and t.status = 'pending');
$$;

revoke all on function public.rollup_stats(uuid) from public;
grant execute on function public.rollup_stats(uuid) to authenticated;
