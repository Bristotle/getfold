-- ============================================================================
-- 0032  A church can start and renew its own subscription
-- ============================================================================
--
-- Until now an invoice could only be raised by a scheduled job, because
-- raise_invoice is granted to service_role alone. That was correct for
-- security and wrong for the church: a pastor who was signed in, on trial,
-- and willing to pay had nowhere to do it. Billing showed the band and then
-- linked to the public pricing page, whose only button is "start your free
-- trial", which leads to signup, which asks a church that already exists to
-- create itself again. Somebody trying to give us money went in a circle.
--
-- So this adds one function a signed in church may call for itself. It does
-- not widen raise_invoice; it wraps it, checks the caller, and decides the
-- period rather than letting the caller choose it.
--
-- Two decisions worth stating, because both cost us money on purpose:
--
--   Paying during a trial does not shorten the trial. The paid quarter
--   starts the day the trial ends, so a church that pays on day three still
--   gets its thirty days. Charging from today would quietly take back what
--   we advertised.
--
--   Renewing early does not overlap. The next quarter starts when the
--   current one ends, never today.

create or replace function public.start_subscription(org_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  starts_on date;
  paid_until timestamptz;
  state text;
  existing uuid;
  new_id uuid;
begin
  -- SECURITY DEFINER runs as the owner, which bypasses RLS, so the caller's
  -- right to act for this church has to be checked here and explicitly.
  -- org_role() reads the caller's own membership, so it cannot be spoofed by
  -- passing somebody else's org_id.
  if public.org_role(org_id) is null
     or public.org_role(org_id) not in
        ('super_admin', 'pastor', 'admin', 'finance_officer') then
    raise exception 'Not permitted to arrange billing for this church'
      using errcode = '42501';
  end if;

  select subscription_status::text, trial_ends_at
    into state, paid_until
    from public.organizations
   where id = org_id;

  if state is null then
    raise exception 'No such church' using errcode = 'P0002';
  end if;

  if state = 'cancelled' then
    raise exception 'This subscription was cancelled, please talk to us'
      using errcode = '42501';
  end if;

  -- trial_ends_at doubles as "paid until" once a church is active, which is
  -- what the webhook sets when an invoice is paid. Either way, the next
  -- quarter begins where the current cover runs out, and never in the past.
  starts_on := greatest(coalesce(paid_until, now())::date, current_date);

  -- raise_invoice is idempotent per period and returns null when a period is
  -- already billed. That is the common case for a church pressing the button
  -- twice, so return the invoice it already has rather than an error.
  select id into existing
    from public.invoices
   where organization_id = org_id and period_start = starts_on;

  if existing is not null then
    return existing;
  end if;

  new_id := public.raise_invoice(org_id, starts_on);

  if new_id is null then
    -- Above the self serve ceiling the price is agreed, not computed.
    raise exception 'Above a thousand members the rate is agreed, please talk to us'
      using errcode = '42501';
  end if;

  return new_id;
end;
$$;

revoke all on function public.start_subscription(uuid) from public;
revoke all on function public.start_subscription(uuid) from anon;
grant execute on function public.start_subscription(uuid) to authenticated;
