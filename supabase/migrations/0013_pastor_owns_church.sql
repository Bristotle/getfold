-- Fold, the pastor owns the church. Apply THIRTEENTH.
--
-- Creating a church previously made you "Administrator", which is the wrong
-- shape. A pastor owns the church and delegates from it; an administrator is
-- one of the people they delegate to. Conflating the two meant the person
-- who owns the congregation's records held the same title as the secretary
-- they hired last month.
--
-- Two new roles:
--   pastor  the person who created the church. Everything, including
--           finance, and the only role that can appoint another pastor.
--   elder   pastoral work without money. Members, groups, attendance,
--           visitors and vital records, no giving.
--
-- `minister` is kept because existing rows may use it, and is treated as an
-- elder throughout. It is no longer offered when assigning a role.

-- ---------- new churches get a pastor, not an administrator ----------
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
    raise exception 'Church name is required.' using errcode = '22023';
  end if;

  insert into public.profiles (id, full_name)
  select uid, coalesce(u.raw_user_meta_data ->> 'full_name', u.email)
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

  -- The change: the founder holds the church.
  insert into public.organization_members (organization_id, profile_id, role)
  values (new_id, uid, 'pastor');

  return new_id;
end;
$$;

revoke all on function public.create_organization(text, public."OrganizationType", text, text, text) from public;
revoke all on function public.create_organization(text, public."OrganizationType", text, text, text) from anon;
grant execute on function public.create_organization(text, public."OrganizationType", text, text, text) to authenticated;

-- ---------- a church must always keep someone in charge ----------
create or replace function public.prevent_last_admin_removal()
returns trigger
language plpgsql
as $$
declare
  remaining  int;
  target_org uuid;
begin
  target_org := coalesce(old.organization_id, new.organization_id);

  -- A cascade from organizations reaches this row after the parent is gone.
  -- Without this exemption a church could never be deleted at all.
  if tg_op = 'DELETE'
     and not exists (select 1 from public.organizations o where o.id = target_org) then
    return old;
  end if;

  if old.role not in ('super_admin', 'pastor', 'admin') then
    return coalesce(new, old);
  end if;
  if tg_op = 'UPDATE' and new.role in ('super_admin', 'pastor', 'admin') then
    return new;
  end if;

  select count(*) into remaining
    from public.organization_members om
   where om.organization_id = target_org
     and om.role in ('super_admin', 'pastor', 'admin')
     and om.id <> old.id;

  if remaining = 0 then
    raise exception 'This is the last person who can manage this church. Appoint someone else first.'
      using errcode = '23514';
  end if;

  return coalesce(new, old);
end;
$$;

-- ---------- existing founders become pastors ----------
-- Ordered after the guard above on purpose: promoting the only admin to
-- pastor fires that trigger, and the previous version did not recognise
-- pastor as someone who can manage a church, so it refused the change.
-- The oldest administrator in each church is the person who created it.
update public.organization_members om
   set role = 'pastor'
 where om.role = 'admin'
   and om.id = (
     select om2.id from public.organization_members om2
      where om2.organization_id = om.organization_id
        and om2.role in ('admin', 'super_admin')
      order by om2.created_at asc
      limit 1
   );
