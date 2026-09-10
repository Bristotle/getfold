-- ============================================================================
-- 0021  Where a church's giving is settled
-- ============================================================================
--
-- Until now initiateMomoCharge used one Paystack key, which meant a
-- member's tithe settled into FOLD's account. That is three problems at
-- once: no pastor will route tithes through our account, holding third
-- party funds points straight at Bank of Ghana licensing we do not have,
-- and we would owe every church a payout and a reconciliation.
--
-- The fix is a Paystack subaccount per church. Settlement then goes
-- directly from Paystack to that church's own destination and never touches
-- our balance.
--
-- WHAT WE STORE, AND WHAT WE DELIBERATELY DO NOT.
--
-- We keep the subaccount code, which is an opaque Paystack reference, and a
-- short label to show back to the church, "MTN ending 2348". We do NOT keep
-- the account number. Paystack holds it, they are the ones who need it, and
-- a full bank or mobile money number for every church in our database is a
-- liability with no upside. If we are ever breached, the difference between
-- those two decisions is the whole story.
--
-- Verified against Paystack with our own key: Ghana accepts mobile money as
-- a settlement destination (codes MTN, VOD, ATL, type mobile_money) as well
-- as 57 banks over GHIPSS. That matters here, because plenty of churches
-- have a MoMo number and no bank account.

alter table public.organizations
  add column if not exists paystack_subaccount_code text,
  -- 'momo' or 'bank'. Free text rather than an enum so adding a settlement
  -- type later is not a migration.
  add column if not exists settlement_type text,
  -- The Paystack bank or network code, e.g. 'MTN' or '030100'. Safe to keep:
  -- it identifies an institution, not an account.
  add column if not exists settlement_bank_code text,
  -- For display only, e.g. 'MTN ending 2348'. Never the full number.
  add column if not exists settlement_label text,
  add column if not exists settlement_updated_at timestamptz;

comment on column public.organizations.settlement_label is
  'Display only, e.g. "MTN ending 2348". The full account number is never stored here; Paystack holds it.';

-- ---------------------------------------------------------------------------
-- Record a settlement destination.
--
-- SECURITY DEFINER because it writes columns a church member has no business
-- updating directly, and it checks the caller leads the church itself rather
-- than trusting the application to have done so.
-- ---------------------------------------------------------------------------
create or replace function public.set_settlement_destination(
  org_id           uuid,
  subaccount_code  text,
  s_type           text,
  bank_code        text,
  label            text
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
  if uid is null then
    raise exception 'You must be signed in.' using errcode = '42501';
  end if;

  select om.role::text into caller_role
  from public.organization_members om
  where om.organization_id = org_id and om.profile_id = uid;

  -- Deliberately narrower than finance.view. Deciding where the church's
  -- money lands is not a bookkeeping task, it is a leadership one, so a
  -- finance officer can record giving but cannot redirect it.
  if caller_role is null
     or caller_role not in ('super_admin', 'pastor', 'admin') then
    raise exception 'Only the pastor or an administrator can set where giving is paid.'
      using errcode = '42501';
  end if;

  if coalesce(trim(subaccount_code), '') = '' then
    raise exception 'Missing subaccount code.' using errcode = '22023';
  end if;

  if s_type not in ('momo', 'bank') then
    raise exception 'Settlement type must be momo or bank.' using errcode = '22023';
  end if;

  update public.organizations
     set paystack_subaccount_code = trim(subaccount_code),
         settlement_type          = s_type,
         settlement_bank_code     = trim(bank_code),
         settlement_label         = trim(label),
         settlement_updated_at    = now()
   where id = org_id;
end;
$$;

revoke all on function public.set_settlement_destination(uuid, text, text, text, text) from public;
revoke all on function public.set_settlement_destination(uuid, text, text, text, text) from anon;
grant execute on function public.set_settlement_destination(uuid, text, text, text, text) to authenticated;
