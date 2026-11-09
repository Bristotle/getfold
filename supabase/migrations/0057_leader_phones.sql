-- ============================================================================
-- 0057  A phone number for every pastor
-- ============================================================================
--
-- Fold reaches churches by WhatsApp, and signup never asked for a phone
-- number: of fifteen church leaders, one had a number on record. Signup now
-- asks for one and passes it in the user's metadata as `phone`, and the
-- trigger that creates the profile keeps it.
--
-- For leaders who signed up before that, the support directory also looks
-- for the number on the leader's own member record, matched by email within
-- the same church, since a pastor often adds themselves to the register.
-- The profile's own number always wins.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    nullif(left(btrim(coalesce(new.raw_user_meta_data->>'phone', '')), 40), '')
  );
  return new;
end;
$$;

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
               'phone', coalesce(
                 nullif(btrim(p.phone), ''),
                 nullif(btrim(u.phone), ''),
                 (select nullif(btrim(m.phone), '') from public.members m
                   where m.organization_id = o.id
                     and lower(m.email) = lower(u.email::text)
                     and nullif(btrim(m.phone), '') is not null
                   limit 1)
               )
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
