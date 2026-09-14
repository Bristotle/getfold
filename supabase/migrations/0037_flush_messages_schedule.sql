-- ============================================================================
-- 0037  Something has to wake up every few minutes
-- ============================================================================
--
-- A thank you for a gift is held back three minutes so it does not land on
-- top of MTN's approval code and MTN's own debit alert. Something then has
-- to send it, and a serverless function cannot sit and wait.
--
-- Vercel's Hobby plan refuses any cron that runs more than once a day, and
-- it refuses it at deploy time, so this cannot be scheduled there without
-- paying for the Pro plan. Postgres can do it instead, at no cost, and the
-- database is awake anyway.
--
-- pg_cron runs the schedule, pg_net makes the request. The endpoint stays
-- where the logic already lives, in the application, rather than the SMS
-- provider being called from SQL and the sending rules living in two
-- places.
--
-- THE SECRET IS NOT IN THIS FILE. It goes into Supabase Vault, which
-- encrypts it, by scripts/schedule-flush.mjs reading the same CRON_SECRET
-- the deployment uses. A migration in git must never carry one.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------------------
-- Ask the application to send whatever is due.
--
-- Deliberately thin: it knows a URL and a secret and nothing about
-- messages. All the judgement about what may be sent, to whom, and in whose
-- name stays in one place in the application.
-- ---------------------------------------------------------------------------
create or replace function public.flush_due_messages()
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  base   text;
  secret text;
begin
  select decrypted_secret into base
    from vault.decrypted_secrets where name = 'app_base_url';
  select decrypted_secret into secret
    from vault.decrypted_secrets where name = 'cron_secret';

  -- Nothing configured means do nothing, quietly. A cron that raises every
  -- five minutes fills the log and tells nobody anything.
  if base is null or secret is null then
    return;
  end if;

  perform extensions.net.http_get(
    url     := base || '/api/cron/send-due',
    headers := jsonb_build_object('Authorization', 'Bearer ' || secret),
    timeout_milliseconds := 20000
  );
end;
$$;

revoke all on function public.flush_due_messages() from public;
revoke all on function public.flush_due_messages() from anon;
revoke all on function public.flush_due_messages() from authenticated;

-- Every five minutes. A thank you held for three is then sent within eight
-- of the payment, which is the "a few minutes later" this is for.
select cron.unschedule('flush-due-messages')
  where exists (select 1 from cron.job where jobname = 'flush-due-messages');

select cron.schedule(
  'flush-due-messages',
  '*/5 * * * *',
  $$select public.flush_due_messages()$$
);
