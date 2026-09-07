-- ============================================================================
-- 0017  Branches: a circuit, district or diocese overseeing several societies
-- ============================================================================
--
-- The schema has carried organizations.parent_organization_id since the
-- start with nothing using it. This turns it on.
--
-- THE IMPORTANT DESIGN DECISION, and the reason this migration is short:
--
-- Access to a branch is granted by inserting a REAL MEMBERSHIP ROW for the
-- caller in the child organization. Nothing about row level security
-- changes. is_org_member() and org_role() are untouched, every existing
-- policy on every tenant table applies exactly as before, and a branch is
-- simply another organization the user happens to belong to.
--
-- The alternative, teaching is_org_member() to walk the parent chain, would
-- have widened every policy in the database at once to solve a feature
-- request. That is the sort of change that turns into a cross tenant leak,
-- and it would have had to be right on the first attempt across two dozen
-- policies. This way the blast radius of a bug is one membership row.
--
-- One level only for now. A branch cannot itself have branches, because a
-- deeper tree needs recursive reads and the reporting to match, and no
-- church has asked for a circuit inside a circuit.

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
begin
  if uid is null then
    raise exception 'You must be signed in.'
      using errcode = '42501';
  end if;

  if coalesce(trim(branch_name), '') = '' then
    raise exception 'The branch needs a name.'
      using errcode = '22023';
  end if;

  -- The caller must already lead the parent. Read the role directly rather
  -- than through org_role() so this is legible in isolation.
  select om.role::text
    into caller_role
  from public.organization_members om
  where om.organization_id = parent_id
    and om.profile_id = uid;

  if caller_role is null
     or caller_role not in ('super_admin', 'pastor', 'admin') then
    raise exception 'Only the pastor or an administrator can add a branch.'
      using errcode = '42501';
  end if;

  -- One level. A society cannot have societies of its own.
  if exists (
    select 1 from public.organizations o
    where o.id = parent_id and o.parent_organization_id is not null
  ) then
    raise exception 'A branch cannot have branches of its own.'
      using errcode = '22023';
  end if;

  base_slug := trim(both '-' from
    regexp_replace(lower(trim(branch_name)), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then
    base_slug := 'branch';
  end if;

  final_slug := base_slug;
  while exists (select 1 from public.organizations o where o.slug = final_slug) loop
    n := n + 1;
    final_slug := base_slug || '-' || n;
  end loop;

  insert into public.organizations (name, slug, type, parent_organization_id, denomination)
  select trim(branch_name), final_slug, branch_type, parent_id, p.denomination
  from public.organizations p
  where p.id = parent_id
  returning id into new_id;

  -- The caller keeps the same standing in the branch that they hold in the
  -- parent. This row, and only this row, is what grants them access.
  insert into public.organization_members (organization_id, profile_id, role)
  values (new_id, uid, caller_role::public."OrgRole");

  return new_id;
end;
$$;

revoke all on function public.create_branch(uuid, text, public."OrganizationType") from public;
revoke all on function public.create_branch(uuid, text, public."OrganizationType") from anon;
grant execute on function public.create_branch(uuid, text, public."OrganizationType") to authenticated;

-- ---------------------------------------------------------------------------
-- Reading the tree.
--
-- The organizations select policy is already `using (is_org_member(id))`,
-- so a user sees exactly the organizations they belong to and no others.
-- Listing branches therefore needs no new policy: a branch you can see is a
-- branch you are a member of. Nothing to add here, and that is the point.
-- ---------------------------------------------------------------------------
