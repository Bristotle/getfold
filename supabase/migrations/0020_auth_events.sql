-- ============================================================================
-- 0020  Auth event log and rate limiting
-- ============================================================================
--
-- Two of the checklist items need somewhere to write: rate limiting needs to
-- count recent failures, and logging suspicious attempts needs a log.
--
-- The table is reachable by nobody. RLS is on with no policy, so anon and
-- authenticated get nothing through PostgREST even though they hold grants.
-- All access goes through the two SECURITY DEFINER functions below, which is
-- what lets a signed-out visitor's failed login be recorded without handing
-- the anon key any read access to the log.
--
-- Note on what this does and does not cover. Supabase's auth API is directly
-- reachable with the public anon key, so an attacker can bypass our server
-- actions entirely. These limits protect our endpoints and give us the
-- record; Supabase's own rate limits are the control for direct API abuse.
-- Saying otherwise would be a false sense of safety.

create table if not exists public.auth_events (
  id          uuid primary key default gen_random_uuid(),
  -- Lowercased. Not a foreign key: most rows are for addresses that have no
  -- account, which is exactly what makes them worth recording.
  email       text,
  ip          text,
  event       text not null,
  user_agent  text,
  detail      text,
  created_at  timestamptz not null default now()
);

alter table public.auth_events enable row level security;

create index if not exists auth_events_email_time_idx
  on public.auth_events (lower(email), created_at desc);
create index if not exists auth_events_ip_time_idx
  on public.auth_events (ip, created_at desc);
create index if not exists auth_events_time_idx
  on public.auth_events (created_at desc);

-- ---------------------------------------------------------------------------
-- Record an attempt.
-- ---------------------------------------------------------------------------
create or replace function public.record_auth_event(
  p_email      text,
  p_event      text,
  p_ip         text default null,
  p_user_agent text default null,
  p_detail     text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.auth_events (email, event, ip, user_agent, detail)
  values (nullif(lower(trim(coalesce(p_email, ''))), ''), p_event,
          nullif(trim(coalesce(p_ip, '')), ''),
          left(coalesce(p_user_agent, ''), 300),
          left(coalesce(p_detail, ''), 300));
$$;

-- ---------------------------------------------------------------------------
-- How many failures recently, by account and by source.
--
-- Returns both counts so a caller can apply different thresholds: a handful
-- per address stops somebody guessing one pastor's password, a larger number
-- per address-less source stops somebody spraying many accounts from one
-- place.
-- ---------------------------------------------------------------------------
create or replace function public.auth_failures_recent(
  p_email   text,
  p_ip      text default null,
  p_minutes int default 15
)
returns table (by_email bigint, by_ip bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(*) from public.auth_events e
      where e.event like '%_failed'
        and e.email = nullif(lower(trim(coalesce(p_email, ''))), '')
        and e.created_at > now() - make_interval(mins => p_minutes)),
    (select count(*) from public.auth_events e
      where e.event like '%_failed'
        and p_ip is not null
        and e.ip = nullif(trim(p_ip), '')
        and e.created_at > now() - make_interval(mins => p_minutes));
$$;

revoke all on function public.record_auth_event(text, text, text, text, text) from public;
revoke all on function public.auth_failures_recent(text, text, int) from public;
grant execute on function public.record_auth_event(text, text, text, text, text) to anon, authenticated;
grant execute on function public.auth_failures_recent(text, text, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Housekeeping. A log nobody prunes becomes a liability of its own, and
-- these rows carry email addresses, which are personal data under Act 843.
-- Ninety days is enough to investigate an incident and short enough to be
-- defensible.
-- ---------------------------------------------------------------------------
create or replace function public.prune_auth_events()
returns integer
language sql
security definer
set search_path = public
as $$
  with gone as (
    delete from public.auth_events
     where created_at < now() - interval '90 days'
     returning 1
  )
  select count(*)::int from gone;
$$;

revoke all on function public.prune_auth_events() from public;
revoke all on function public.prune_auth_events() from anon;
revoke all on function public.prune_auth_events() from authenticated;
grant execute on function public.prune_auth_events() to service_role;
