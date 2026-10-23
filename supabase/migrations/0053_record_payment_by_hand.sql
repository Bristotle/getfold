-- ============================================================================
-- 0053  Fold records a payment a church made outside the website
-- ============================================================================
--
-- YES MY LORD PRAYER NETWORK paid GHS 897 for a quarter of Society Plus by
-- sending mobile money straight to the founder's number, and never went
-- through Billing. Without a way to record that, the church would carry on
-- as "trialing", be reminded to pay, and in the end go read only, all
-- having paid.
--
-- platform_record_payment() does what a Paystack payment does: writes a
-- paid invoice for the period and makes the church active until the end
-- of it. It also writes a line into the church's own activity log, so the
-- church can see what Fold recorded against it.
--
-- Fold staff only, and a separate switch from viewing churches:
-- app_admins.can_record_payments, set in the SQL editor. Looking at a
-- church and saying it has paid are different powers.

alter table public.app_admins
  add column if not exists can_record_payments boolean not null default false;

alter table public.invoices
  add column if not exists manual_reference       text check (char_length(manual_reference) <= 120),
  add column if not exists recorded_by_profile_id uuid references public.profiles(id) on delete set null;

comment on column public.invoices.manual_reference is
  'For a payment Fold recorded by hand: the MoMo transaction ID or bank reference.';

-- Cash is how some churches will pay a person in the end; say so honestly.
alter table public.invoices drop constraint if exists invoices_payment_method_check;
alter table public.invoices
  add constraint invoices_payment_method_check
  check (payment_method = any (array['momo', 'card', 'bank', 'cash']));

create or replace function public.can_record_payments()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins
    where can_record_payments
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.can_record_payments() from public, anon;
grant execute on function public.can_record_payments() to authenticated;

create or replace function public.platform_record_payment(
  org_id      uuid,
  band        text,
  amount      numeric,
  months      int,
  method      text,
  reference   text,
  paid_on     date,
  starts_on   date default null
)
returns table (period_start date, period_end date)
language plpgsql
security definer
set search_path = public
as $$
declare
  cover_from date;
  cover_to   date;
  church     text;
  until_now  timestamptz;
  members    int;
begin
  if not public.can_record_payments() then
    raise exception 'Not permitted.' using errcode = '42501';
  end if;

  select name, trial_ends_at into church, until_now
    from public.organizations where id = org_id;
  if church is null then
    raise exception 'No such church.' using errcode = 'P0002';
  end if;

  if months not in (3, 12) then
    raise exception 'A payment covers a quarter (3 months) or a year (12 months).' using errcode = '22023';
  end if;
  if amount is null or amount <= 0 or amount > 100000 then
    raise exception 'Enter the amount received in cedis, for example 897.' using errcode = '22023';
  end if;
  if method not in ('momo', 'card', 'bank', 'cash') then
    raise exception 'Choose how it was paid.' using errcode = '22023';
  end if;
  if coalesce(trim(band), '') = '' then
    raise exception 'Choose the band they paid for.' using errcode = '22023';
  end if;

  -- The same rule as start_subscription: cover begins where the current
  -- cover or trial ends, never in the past, so paying early during a trial
  -- does not throw away the days still left on it.
  cover_from := coalesce(starts_on, greatest(coalesce(until_now, now())::date, current_date));
  cover_to   := (cover_from + make_interval(months => months))::date;

  select count(*)::int into members
    from public.members where organization_id = org_id and status = 'active';

  insert into public.invoices (
    organization_id, period_start, period_end, amount_pesewas, band_name,
    member_count, status, due_on, paid_at, payment_method,
    manual_reference, recorded_by_profile_id
  )
  values (
    org_id, cover_from, cover_to, round(amount * 100)::int, trim(band),
    members, 'paid', cover_from, coalesce(paid_on, current_date)::timestamptz, method,
    nullif(trim(coalesce(reference, '')), ''), auth.uid()
  );

  update public.organizations
     set subscription_status = 'active',
         trial_ends_at = cover_to
   where id = org_id;

  insert into public.activity_log (
    organization_id, actor_profile_id, actor_name,
    action, entity, entity_id, summary
  )
  values (
    org_id, auth.uid(), 'Fold',
    'created', 'invoices', org_id,
    format('Payment of GHS %s for %s received by %s and recorded, covering %s to %s',
      to_char(amount, 'FM999,990.00'), trim(band),
      case method when 'momo' then 'mobile money' when 'bank' then 'bank transfer' else method end,
      to_char(cover_from, 'FMDD Mon YYYY'), to_char(cover_to, 'FMDD Mon YYYY'))
  );

  return query select cover_from, cover_to;
end;
$$;

revoke all on function public.platform_record_payment(uuid, text, numeric, int, text, text, date, date) from public, anon;
grant execute on function public.platform_record_payment(uuid, text, numeric, int, text, text, date, date) to authenticated;
