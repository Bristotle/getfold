-- ============================================================================
-- 0025  Each church writes its own messages
-- ============================================================================
--
-- The three automatic texts were written by us. That is fine as a starting
-- point and wrong as a permanent state: a Methodist society and a
-- charismatic assembly do not greet people the same way, and a message in
-- somebody else's voice going out under your church's name is worse than no
-- message at all.
--
-- Null means "use the default we wrote". A church only stores a template
-- once it has actually changed one, so improving the defaults later still
-- benefits everybody who never edited theirs.
--
-- THE LENGTH LIMIT IS REAL MONEY. SMS is billed per 160 character segment,
-- and these go to whole congregations. 320 characters is two segments and a
-- deliberate ceiling: enough to say something warm, not enough for somebody
-- to paste a sermon and double every church's bill without noticing.

alter table public.organizations
  add column if not exists sms_template_welcome  text,
  add column if not exists sms_template_birthday text,
  add column if not exists sms_template_thanks   text;

comment on column public.organizations.sms_template_welcome is
  'Null means use the built in default. Placeholders: {name}, {church}.';
comment on column public.organizations.sms_template_thanks is
  'Null means use the built in default. Placeholders: {name}, {church}, {amount}, {type}.';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_sms_templates_check'
  ) then
    alter table public.organizations
      add constraint organizations_sms_templates_check
      check (
        (sms_template_welcome  is null or length(sms_template_welcome)  between 10 and 320)
        and (sms_template_birthday is null or length(sms_template_birthday) between 10 and 320)
        and (sms_template_thanks   is null or length(sms_template_thanks)   between 10 and 320)
      );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Save them. Leadership only, for the same reason as the sender name: this
-- is what the congregation reads as coming from their church.
-- ---------------------------------------------------------------------------
create or replace function public.set_message_templates(
  org_id     uuid,
  t_welcome  text,
  t_birthday text,
  t_thanks   text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid         uuid := auth.uid();
  caller_role text;
begin
  select om.role::text into caller_role
  from public.organization_members om
  where om.organization_id = org_id and om.profile_id = uid;

  if caller_role is null
     or caller_role not in ('super_admin', 'pastor', 'admin') then
    raise exception 'Only the pastor or an administrator can change these messages.'
      using errcode = '42501';
  end if;

  update public.organizations
     set sms_template_welcome  = nullif(trim(coalesce(t_welcome,  '')), ''),
         sms_template_birthday = nullif(trim(coalesce(t_birthday, '')), ''),
         sms_template_thanks   = nullif(trim(coalesce(t_thanks,   '')), '')
   where id = org_id;
end;
$$;

revoke all on function public.set_message_templates(uuid, text, text, text) from public;
revoke all on function public.set_message_templates(uuid, text, text, text) from anon;
grant execute on function public.set_message_templates(uuid, text, text, text) to authenticated;

-- The daily job needs the church's own birthday wording alongside the rest.
drop function if exists public.birthdays_today();

create or replace function public.birthdays_today()
returns table (
  organization_id   uuid,
  organization_name text,
  member_id         uuid,
  member_name       text,
  phone             text,
  sender_id         text,
  template          text
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.name, m.id, m.full_name, m.phone, o.sms_sender_id,
         o.sms_template_birthday
  from public.members m
  join public.organizations o on o.id = m.organization_id
  where o.sms_birthday_enabled
    and m.status = 'active'
    and m.date_of_birth is not null
    and m.phone is not null
    and trim(m.phone) <> ''
    and extract(month from m.date_of_birth) = extract(month from (now() at time zone 'Africa/Accra'))
    and extract(day   from m.date_of_birth) = extract(day   from (now() at time zone 'Africa/Accra'))
    and not exists (
      select 1 from public.notifications n
      where n.member_id = m.id
        and n.type = 'birthday'
        and n.created_at >= date_trunc('year', now())
    );
$$;

revoke all on function public.birthdays_today() from public;
revoke all on function public.birthdays_today() from anon;
revoke all on function public.birthdays_today() from authenticated;
grant execute on function public.birthdays_today() to service_role;
