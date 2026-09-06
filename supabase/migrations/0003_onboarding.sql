-- Fold — organization bootstrap. Apply THIRD (after 0002_rls.sql).
--
-- THE PROBLEM THIS SOLVES
-- RLS creates a chicken-and-egg on signup: `organizations` has no INSERT
-- policy, and the `organization_members` INSERT policy demands that you
-- already be an admin of the org you are joining. So a brand-new user can
-- never create their first church — every direct INSERT is refused.
--
-- Rather than punch a permissive INSERT policy into `organizations` (which
-- would let any authenticated user insert arbitrary rows, and any user add
-- themselves to an org that already exists), we expose ONE narrow
-- SECURITY DEFINER function. It runs as the owner, so it bypasses RLS, but
-- it only ever does one thing: create a NEW org and make the CALLER its
-- admin. It cannot be used to join an existing org.

create or replace function public.create_organization(
  org_name         text,
  org_type         public."OrganizationType" default 'local_church',
  org_denomination text default null,
  org_phone        text default null,
  org_address      text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid        uuid := auth.uid();
  base_slug  text;
  final_slug text;
  n          int  := 0;
  new_id     uuid;
begin
  if uid is null then
    raise exception 'You must be signed in to create a church.'
      using errcode = '42501';
  end if;

  if coalesce(trim(org_name), '') = '' then
    raise exception 'Church name is required.'
      using errcode = '22023';
  end if;

  -- The signup trigger normally creates this, but a user who registered
  -- before the trigger existed would have no profile row, and
  -- organization_members.profile_id has an FK to it.
  insert into public.profiles (id, full_name)
  select uid, coalesce(u.raw_user_meta_data->>'full_name', u.email)
  from auth.users u
  where u.id = uid
  on conflict (id) do nothing;

  -- Slugify the name, then de-duplicate: "Bethel Chapel" -> "bethel-chapel",
  -- and a second church of the same name becomes "bethel-chapel-1".
  base_slug := trim(both '-' from regexp_replace(lower(trim(org_name)), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then
    base_slug := 'church';
  end if;

  final_slug := base_slug;
  while exists (select 1 from public.organizations o where o.slug = final_slug) loop
    n := n + 1;
    final_slug := base_slug || '-' || n;
  end loop;

  insert into public.organizations (name, slug, type, denomination, phone, address)
  values (
    trim(org_name),
    final_slug,
    org_type,
    nullif(trim(coalesce(org_denomination, '')), ''),
    nullif(trim(coalesce(org_phone, '')), ''),
    nullif(trim(coalesce(org_address, '')), '')
  )
  returning id into new_id;

  insert into public.organization_members (organization_id, profile_id, role)
  values (new_id, uid, 'admin');

  return new_id;
end;
$$;

-- Only signed-in users may call it; anon explicitly cannot.
revoke all on function public.create_organization(text, public."OrganizationType", text, text, text) from public;
revoke all on function public.create_organization(text, public."OrganizationType", text, text, text) from anon;
grant execute on function public.create_organization(text, public."OrganizationType", text, text, text) to authenticated;
