-- ============================================================================
-- 0054  When a paying church's cover ends: 7 days, then read only
-- ============================================================================
--
-- Cover was recorded and never enforced. A church that paid once was marked
-- active with trial_ends_at holding "paid until", and nothing ever moved it
-- on, so a quarter's payment bought use for ever. The owner has decided:
--
--   7, 3 and 1 days before cover ends, and on the day   reminders
--   cover ends                                          grace, full use
--   7 days after                                        read only
--
-- Read only is the existing state from 0043: the church can sign in, see
-- and export everything, and records nothing new until it renews. A church
-- that has ever paid is NEVER deleted automatically. Deletion on day 91
-- stays for trials that never paid, which is what the privacy policy and
-- the trial emails describe; a customer's records are not ours to remove
-- because a renewal is late.
--
-- "Has paid" is a paid invoice on record, whether through Paystack or
-- recorded by hand with platform_record_payment().

create or replace function public.has_paid(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.invoices
    where organization_id = org_id and status = 'paid'
  );
$$;

revoke all on function public.has_paid(uuid) from public, anon;
grant execute on function public.has_paid(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- The banner's question, now with whether this church has paid, so it can
-- talk about a plan ending rather than a free trial. Return type changes,
-- so dropped and created again.
-- ---------------------------------------------------------------------------
drop function if exists public.trial_status(uuid);

create function public.trial_status(org_id uuid)
returns table (
  status      text,
  ends_at     timestamptz,
  days_left   int,
  is_expiring boolean,
  has_paid    boolean
)
language sql
security invoker
stable
as $$
  select
    o.subscription_status::text,
    o.trial_ends_at,
    ceil(extract(epoch from (o.trial_ends_at - now())) / 86400)::int,
    (o.subscription_status in ('trialing', 'active')
      and o.trial_ends_at < now() + interval '7 days'),
    public.has_paid(o.id)
  from public.organizations o
  where o.id = org_id;
$$;

revoke all on function public.trial_status(uuid) from public;
revoke all on function public.trial_status(uuid) from anon;
grant execute on function public.trial_status(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- The daily step, with paid cover added. Same signature as 0043.
-- ---------------------------------------------------------------------------
create or replace function public.advance_trial_lifecycle()
returns table (
  action text,
  organization_id uuid,
  organization_name text,
  pastor_id uuid,
  pastor_email text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- A trial ends: grace.
  update public.organizations
     set subscription_status = 'grace'
   where subscription_status = 'trialing'
     and trial_ends_at < now();

  -- Paid cover ends: grace. New in 0054.
  update public.organizations
     set subscription_status = 'grace'
   where subscription_status = 'active'
     and trial_ends_at < now();

  -- Grace ends: read only. Seven days after paid cover, thirty after a
  -- trial.
  return query
  with moved as (
    update public.organizations o
       set subscription_status = 'expired'
     where o.subscription_status = 'grace'
       and o.trial_ends_at
           + case when public.has_paid(o.id) then interval '7 days' else interval '30 days' end
           < now()
    returning o.id, o.name
  )
  select 'read_only'::text, m.id, m.name, om.profile_id, u.email::text
    from moved m
    left join public.organization_members om on om.organization_id = m.id and om.role = 'pastor'
    left join auth.users u on u.id = om.profile_id;

  -- Day 91 of a trial that never paid: deleted. A church that has paid is
  -- never deleted here.
  return query
  with doomed as (
    select o.id, o.name, om.profile_id, u.email::text as email
      from public.organizations o
      left join public.organization_members om on om.organization_id = o.id and om.role = 'pastor'
      left join auth.users u on u.id = om.profile_id
     where o.subscription_status = 'expired'
       and not public.has_paid(o.id)
       and o.trial_ends_at + interval '60 days' < now()
  ),
  gone as (
    delete from public.organizations o
     using doomed d
     where o.id = d.id
    returning o.id
  )
  select 'deleted'::text, d.id, d.name, d.profile_id, d.email
    from doomed d
    where d.id in (select id from gone);
end;
$$;

-- ---------------------------------------------------------------------------
-- Who to remind today. Paying churches on their own milestones: 7, 3 and 1
-- days before cover ends, the day itself, the day before access goes (-6)
-- and the day it does (-7). Return type gains `paid`, so dropped and
-- created again.
-- ---------------------------------------------------------------------------
drop function if exists public.trials_needing_reminder();

create function public.trials_needing_reminder()
returns table (
  organization_id uuid,
  organization_name text,
  days_left int,
  ends_at timestamptz,
  pastor_phone text,
  pastor_email text,
  paid boolean
)
language sql
security definer
set search_path = public
as $$
  with c as (
    select
      o.id, o.name, o.trial_ends_at, o.subscription_status, o.trial_reminder_sent_at,
      ceil(extract(epoch from (o.trial_ends_at - now())) / 86400)::int as days_left,
      public.has_paid(o.id) as paid
    from public.organizations o
    where o.subscription_status in ('trialing', 'active', 'grace', 'expired')
  )
  select c.id, c.name, c.days_left, c.trial_ends_at, p.phone, u.email, c.paid
  from c
  join public.organization_members om on om.organization_id = c.id and om.role = 'pastor'
  join public.profiles p on p.id = om.profile_id
  join auth.users u on u.id = p.id
  where (
          (c.paid and c.days_left in (7, 3, 1, 0, -6, -7))
       or (not c.paid and c.subscription_status <> 'active'
           and c.days_left in (7, 3, 1, 0, -14, -29, -30, -45, -54, -59))
        )
    and (c.trial_reminder_sent_at is null
         or c.trial_reminder_sent_at < date_trunc('day', now()));
$$;

revoke all on function public.trials_needing_reminder() from public;
revoke all on function public.trials_needing_reminder() from anon;
revoke all on function public.trials_needing_reminder() from authenticated;
grant execute on function public.trials_needing_reminder() to service_role;
