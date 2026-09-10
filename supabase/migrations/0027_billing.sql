-- ============================================================================
-- 0027  Invoices
-- ============================================================================
--
-- What happens after the thirty days. Deliberately invoices rather than a
-- recurring charge, for a reason specific to this market: mobile money
-- mandates in Ghana are unreliable, so a subscription that silently
-- auto-charges would fail quietly and often. A church treasurer would
-- rather authorise each payment anyway, and an invoice is a document they
-- can put in the books.
--
-- Billed quarterly, matching the statistical return. One payment to
-- arrange every three months rather than twelve a year.
--
-- The band is stored ON the invoice rather than looked up when it is
-- viewed. A church that grows past a band should not find last quarter's
-- invoice silently reprice itself, and we promise the price is held for
-- twelve months, which is a promise the data has to be able to keep.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'InvoiceStatus') then
    create type public."InvoiceStatus" as enum (
      'draft', 'sent', 'paid', 'void', 'overdue'
    );
  end if;
end $$;

create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,

  period_start date not null,
  period_end   date not null,

  -- Pesewas, never a float. Money in a float is how rounding errors become
  -- disputes with a church treasurer.
  amount_pesewas integer not null check (amount_pesewas >= 0),
  currency       text    not null default 'GHS',

  -- Snapshot of why this amount, so an invoice explains itself a year later.
  band_name    text not null,
  member_count integer,

  status public."InvoiceStatus" not null default 'draft',
  due_on date,

  paystack_reference    text unique,
  paystack_authorization_url text,
  paid_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

create index if not exists invoices_org_idx on public.invoices (organization_id, period_start desc);
create index if not exists invoices_status_idx on public.invoices (status) where status in ('sent','overdue');

-- ---------------------------------------------------------------------------
-- Who can see an invoice.
--
-- Reading is finance work, so leadership and the finance officer. Writing
-- is not: an invoice is created by us, paid through the gateway, and marked
-- paid by the webhook. Nobody inside a church should be able to edit what
-- they owe, which is why there is no insert, update or delete policy at
-- all. The service role bypasses RLS and does that work.
-- ---------------------------------------------------------------------------
drop policy if exists invoices_select on public.invoices;
create policy invoices_select on public.invoices
  for select
  using (
    public.org_role(organization_id) in
      ('super_admin', 'pastor', 'admin', 'finance_officer')
  );

-- ---------------------------------------------------------------------------
-- Which band a church falls into, from its live membership.
--
-- Mirrors src/lib/pricing.ts. Kept in SQL as well so a scheduled job can
-- raise an invoice without the application being awake.
-- ---------------------------------------------------------------------------
create or replace function public.pricing_band(member_count integer)
returns table (band_name text, monthly_cedis integer)
language sql
immutable
as $$
  select
    case
      when member_count <= 100  then 'Society'
      when member_count <= 400  then 'Society Plus'
      when member_count <= 1000 then 'Large Society'
      else 'Circuit and above'
    end,
    case
      when member_count <= 100  then 149
      when member_count <= 400  then 299
      when member_count <= 1000 then 499
      else null
    end;
$$;

-- ---------------------------------------------------------------------------
-- Raise the next invoice for a church.
--
-- Returns the invoice id, or null when there is nothing to raise: a church
-- above the self serve ceiling is a conversation, not an automatic bill.
-- Idempotent on the period, so a job that runs twice does not bill twice.
-- ---------------------------------------------------------------------------
create or replace function public.raise_invoice(org_id uuid, from_date date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  members int;
  band    record;
  new_id  uuid;
  ends_on date := (from_date + interval '3 months')::date;
begin
  if exists (
    select 1 from public.invoices
    where organization_id = org_id and period_start = from_date
  ) then
    return null;
  end if;

  select count(*)::int into members
  from public.members
  where organization_id = org_id and status = 'active';

  select * into band from public.pricing_band(members);

  -- Above the ceiling the price is agreed, not computed.
  if band.monthly_cedis is null then
    return null;
  end if;

  insert into public.invoices (
    organization_id, period_start, period_end,
    amount_pesewas, band_name, member_count, status, due_on
  )
  values (
    org_id, from_date, ends_on,
    band.monthly_cedis * 3 * 100, band.band_name, members, 'draft',
    (from_date + interval '14 days')::date
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.raise_invoice(uuid, date) from public;
revoke all on function public.raise_invoice(uuid, date) from anon;
revoke all on function public.raise_invoice(uuid, date) from authenticated;
grant execute on function public.raise_invoice(uuid, date) to service_role;
