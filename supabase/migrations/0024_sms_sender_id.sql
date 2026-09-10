-- ============================================================================
-- 0024  Each church texts under its own name
-- ============================================================================
--
-- A member who gets a birthday text from "Arkesel" has been spammed by a
-- company they have never heard of. The same text from "SHEKINAH" is from
-- their church. That is the whole difference, and it decides whether the
-- feature is an asset or a complaint.
--
-- THE HARD CONSTRAINT. An alphanumeric SMS sender ID is limited to 11
-- characters by the GSM standard. Not our rule and not Arkesel's: it is
-- how the field is carried on the network. "Shekinah Prayer Ministry
-- International" cannot be a sender. The church picks an abbreviation, and
-- the interface has to make that limit obvious before they type rather
-- than after.
--
-- AND IT MUST BE APPROVED. We learned this the expensive way already:
-- Arkesel holds the first message from a new sender name at PENDING
-- APPROVAL while returning success and deducting a credit, so nothing
-- arrives and nothing looks wrong. A church that sets a new sender must be
-- told to expect that, or their first birthday run will silently vanish
-- and they will conclude the product is broken.

alter table public.organizations
  add column if not exists sms_sender_id text;

comment on column public.organizations.sms_sender_id is
  'Alphanumeric SMS sender, 11 characters maximum by GSM standard. Falls back to the platform sender when null. Arkesel holds the first message from a new sender pending approval.';

alter table public.organizations
  drop constraint if exists organizations_sms_sender_id_check;

alter table public.organizations
  add constraint organizations_sms_sender_id_check
  check (
    sms_sender_id is null
    or (
      length(sms_sender_id) between 3 and 11
      -- Letters, digits and spaces. Punctuation is rejected by carriers
      -- often enough that allowing it would only produce silent failures.
      and sms_sender_id ~ '^[A-Za-z0-9 ]+$'
      -- Must contain a letter. An all-numeric sender is treated as a phone
      -- number by some networks and behaves unpredictably.
      and sms_sender_id ~ '[A-Za-z]'
    )
  );

-- ---------------------------------------------------------------------------
-- Set it. Leadership only: the sender name is how a congregation decides
-- whether a message is genuinely from their church.
-- ---------------------------------------------------------------------------
create or replace function public.set_sms_sender_id(org_id uuid, sender text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid         uuid := auth.uid();
  caller_role text;
  cleaned     text := nullif(trim(regexp_replace(coalesce(sender, ''), '\s+', ' ', 'g')), '');
begin
  select om.role::text into caller_role
  from public.organization_members om
  where om.organization_id = org_id and om.profile_id = uid;

  if caller_role is null
     or caller_role not in ('super_admin', 'pastor', 'admin') then
    raise exception 'Only the pastor or an administrator can set the sender name.'
      using errcode = '42501';
  end if;

  if cleaned is not null and length(cleaned) > 11 then
    raise exception 'A sender name can be at most 11 characters. Networks will not carry a longer one.'
      using errcode = '22023';
  end if;

  update public.organizations set sms_sender_id = cleaned where id = org_id;
end;
$$;

revoke all on function public.set_sms_sender_id(uuid, text) from public;
revoke all on function public.set_sms_sender_id(uuid, text) from anon;
grant execute on function public.set_sms_sender_id(uuid, text) to authenticated;

-- The birthday query now carries the church's sender so the daily job can
-- send under it without a second lookup per member.
--
-- Dropped first: Postgres will not change the return type of an existing
-- function through CREATE OR REPLACE, and adding a column to a RETURNS
-- TABLE is a change of return type.
drop function if exists public.birthdays_today();

create or replace function public.birthdays_today()
returns table (
  organization_id   uuid,
  organization_name text,
  member_id         uuid,
  member_name       text,
  phone             text,
  sender_id         text
)
language sql
security definer
set search_path = public
as $$
  select o.id, o.name, m.id, m.full_name, m.phone, o.sms_sender_id
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
