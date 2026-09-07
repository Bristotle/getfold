-- ============================================================================
-- 0018  The free trial, which until now existed only in the marketing copy
-- ============================================================================
--
-- The site has promised "30 days free, no card" since launch and nothing in
-- the database recorded when a church started or when that ended. This adds
-- the state, and nothing else: no card, no invoicing, no gateway.
--
-- Deliberately NOT a hard lockout. When a trial ends a church still owns its
-- register, and locking a pastor out of the membership list on day 31 would
-- be both cruel and the opposite of what we tell them about their data. The
-- status is recorded and surfaced; what we do about it is a decision for
-- people, not a trigger.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'SubscriptionStatus') then
    create type public."SubscriptionStatus" as enum (
      'trialing',   -- inside the 30 days
      'active',     -- paying
      'grace',      -- trial over, still usable, being chased
      'expired',    -- trial over and not taken up
      'cancelled'   -- was paying, has stopped
    );
  end if;
end $$;

alter table public.organizations
  add column if not exists trial_started_at timestamptz not null default now(),
  add column if not exists trial_ends_at   timestamptz not null
    default (now() + interval '30 days'),
  add column if not exists subscription_status public."SubscriptionStatus"
    not null default 'trialing',
  -- When each reminder was last sent, so a cron that runs daily cannot send
  -- the same reminder twice. Null means never sent.
  add column if not exists trial_reminder_sent_at timestamptz;

-- Churches created before this migration get their 30 days from when they
-- actually signed up, not from today. Anyone already past it lands in
-- 'grace' rather than 'expired', because they were never told.
update public.organizations
   set trial_started_at = created_at,
       trial_ends_at    = created_at + interval '30 days',
       subscription_status =
         case when created_at + interval '30 days' < now()
              then 'grace'::public."SubscriptionStatus"
              else 'trialing'::public."SubscriptionStatus"
         end
 where trial_started_at = trial_ends_at - interval '30 days'
   and trial_started_at >= now() - interval '1 minute';

create index if not exists organizations_trial_ends_at_idx
  on public.organizations (trial_ends_at)
  where subscription_status in ('trialing', 'grace');

-- ---------------------------------------------------------------------------
-- What a church sees about its own trial.
--
-- SECURITY INVOKER, so RLS decides: a caller only ever gets a row for a
-- church they belong to. Days are whole days remaining, negative once past.
-- ---------------------------------------------------------------------------
create or replace function public.trial_status(org_id uuid)
returns table (
  status      text,
  ends_at     timestamptz,
  days_left   int,
  is_expiring boolean
)
language sql
security invoker
stable
as $$
  select
    o.subscription_status::text,
    o.trial_ends_at,
    ceil(extract(epoch from (o.trial_ends_at - now())) / 86400)::int,
    (o.subscription_status = 'trialing'
      and o.trial_ends_at < now() + interval '7 days')
  from public.organizations o
  where o.id = org_id;
$$;

revoke all on function public.trial_status(uuid) from public;
revoke all on function public.trial_status(uuid) from anon;
grant execute on function public.trial_status(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Churches due a reminder.
--
-- SECURITY DEFINER and locked to the service role, because the reminder job
-- runs on a schedule with no user session and legitimately needs to read
-- across every church. This is the one place that is allowed to.
-- ---------------------------------------------------------------------------
create or replace function public.trials_needing_reminder()
returns table (
  organization_id uuid,
  organization_name text,
  days_left int,
  ends_at timestamptz,
  pastor_phone text,
  pastor_email text
)
language sql
security definer
set search_path = public
as $$
  select
    o.id,
    o.name,
    ceil(extract(epoch from (o.trial_ends_at - now())) / 86400)::int as days_left,
    o.trial_ends_at,
    p.phone,
    u.email
  from public.organizations o
  join public.organization_members om
    on om.organization_id = o.id and om.role = 'pastor'
  join public.profiles p on p.id = om.profile_id
  join auth.users u on u.id = p.id
  where o.subscription_status in ('trialing', 'grace')
    -- Day 23, day 27, day 29 and the day it ends. Anything already sent
    -- today is skipped so a re-run cannot double up.
    and ceil(extract(epoch from (o.trial_ends_at - now())) / 86400)::int
        in (7, 3, 1, 0)
    and (o.trial_reminder_sent_at is null
         or o.trial_reminder_sent_at < date_trunc('day', now()));
$$;

revoke all on function public.trials_needing_reminder() from public;
revoke all on function public.trials_needing_reminder() from anon;
revoke all on function public.trials_needing_reminder() from authenticated;
grant execute on function public.trials_needing_reminder() to service_role;

-- Marks a reminder as sent, and moves a church past its end date into grace.
create or replace function public.mark_trial_reminded(org_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.organizations
     set trial_reminder_sent_at = now(),
         subscription_status =
           case when subscription_status = 'trialing' and trial_ends_at < now()
                then 'grace'::public."SubscriptionStatus"
                else subscription_status
           end
   where id = org_id;
$$;

revoke all on function public.mark_trial_reminded(uuid) from public;
revoke all on function public.mark_trial_reminded(uuid) from anon;
revoke all on function public.mark_trial_reminded(uuid) from authenticated;
grant execute on function public.mark_trial_reminded(uuid) to service_role;
