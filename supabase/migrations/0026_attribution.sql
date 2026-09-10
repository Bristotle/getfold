-- ============================================================================
-- 0026  Where did this church hear about us
-- ============================================================================
--
-- Churches tell churches. In this market that is likely to outrun search by
-- a wide margin, and right now we have no way of knowing, which means no
-- way of telling whether the marketing is working or whether the first
-- customer simply told their neighbour.
--
-- Two columns rather than one. The channel is a rough bucket for reporting.
-- The free text is the useful part: "Rev Mensah at Ebenezer told us" names
-- a person to thank, and a church willing to be a reference.
--
-- Both are optional and asked once. A church that will not say should still
-- be able to finish signing up, so nothing here is required.

alter table public.organizations
  add column if not exists heard_about_us      text,
  add column if not exists heard_about_detail  text;

comment on column public.organizations.heard_about_us is
  'Rough channel bucket for reporting. Optional, never required to finish signing up.';
comment on column public.organizations.heard_about_detail is
  'Their own words. Usually the name of the church or person who referred them, which is the part worth acting on.';

alter table public.organizations
  drop constraint if exists organizations_heard_about_check;

alter table public.organizations
  add constraint organizations_heard_about_check
  check (
    heard_about_us is null
    or heard_about_us in (
      'another_church', 'search', 'social', 'event', 'denomination', 'other'
    )
  );

-- create_organization gains the two, defaulting to null so every existing
-- caller keeps working unchanged.
create or replace function public.create_organization(
  org_name         text,
  org_type         public."OrganizationType" default 'local_church',
  org_denomination text default null,
  org_phone        text default null,
  org_address      text default null,
  heard_channel    text default null,
  heard_detail     text default null
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

  insert into public.profiles (id, full_name)
  select uid, coalesce(u.raw_user_meta_data->>'full_name', u.email)
  from auth.users u
  where u.id = uid
  on conflict (id) do nothing;

  base_slug := trim(both '-' from regexp_replace(lower(trim(org_name)), '[^a-z0-9]+', '-', 'g'));
  if base_slug = '' then
    base_slug := 'church';
  end if;

  final_slug := base_slug;
  while exists (select 1 from public.organizations o where o.slug = final_slug) loop
    n := n + 1;
    final_slug := base_slug || '-' || n;
  end loop;

  insert into public.organizations (
    name, slug, type, denomination, phone, address,
    heard_about_us, heard_about_detail
  )
  values (
    trim(org_name),
    final_slug,
    org_type,
    nullif(trim(coalesce(org_denomination, '')), ''),
    nullif(trim(coalesce(org_phone, '')), ''),
    nullif(trim(coalesce(org_address, '')), ''),
    nullif(trim(coalesce(heard_channel, '')), ''),
    nullif(trim(coalesce(heard_detail, '')), '')
  )
  returning id into new_id;

  insert into public.organization_members (organization_id, profile_id, role)
  values (new_id, uid, 'pastor');

  return new_id;
end;
$$;

revoke all on function public.create_organization(text, public."OrganizationType", text, text, text, text, text) from public;
revoke all on function public.create_organization(text, public."OrganizationType", text, text, text, text, text) from anon;
grant execute on function public.create_organization(text, public."OrganizationType", text, text, text, text, text) to authenticated;
