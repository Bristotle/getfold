-- ============================================================================
-- 0035  Who changed what, and when
-- ============================================================================
--
-- A church's register and its offering book are records people are
-- accountable for. When a member's status changes or a contribution is
-- edited, somebody eventually asks who did that, and until now the honest
-- answer was that we did not keep one.
--
-- We do keep auth_events, but that is sign ins and failed attempts, it is
-- readable by nobody, and it is a security control rather than something a
-- pastor can look at. This is the other thing: a plain, church-visible
-- account of changes to the records that matter.
--
-- Written by TRIGGERS, not by the application. Three reasons, and the first
-- is the one that matters:
--
--   A log the application writes only records what the application
--   remembered to tell it. A log the database writes records what actually
--   happened, including a change made through a script, through the admin
--   API, or by a future page nobody has written yet.
--
--   It cannot be forgotten when a new action is added.
--
--   And it stays true even when the write path is the Paystack webhook,
--   which has no user session at all. Those are recorded as the system,
--   plainly, rather than attributed to a person who was not there.
--
-- The actor's name is SNAPSHOT at the time, not joined on read. A person
-- who leaves the church still has to be named in the record of what they
-- did, and a foreign key to a row that may be deleted cannot promise that.

create table if not exists public.activity_log (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,

  -- Null when the change came from the webhook or a scheduled job. The name
  -- carries the answer either way, so a reader never sees a blank.
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_name       text not null,

  action text not null check (action in ('created', 'updated', 'deleted')),
  entity text not null,
  entity_id uuid,

  -- One line, already written for a person. Assembled at write time because
  -- the row it describes may be gone by the time anybody reads this.
  summary text not null,

  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create index if not exists activity_log_org_idx
  on public.activity_log (organization_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Who may read it.
--
-- Leadership only. A class leader seeing that the treasurer edited a
-- contribution is not oversight, it is gossip, and the register carries
-- personal data about the whole congregation.
--
-- There is no insert, update or delete policy at all, deliberately. Nobody
-- may write to this table through the API, and nobody may tidy it up. A log
-- that the people it records can edit is not a log. The trigger below is
-- SECURITY DEFINER, which is how rows get in.
-- ---------------------------------------------------------------------------
drop policy if exists activity_log_select on public.activity_log;
create policy activity_log_select on public.activity_log
  for select
  using (
    public.org_role(organization_id) in ('super_admin', 'pastor', 'admin')
  );

grant select on public.activity_log to authenticated;

-- ---------------------------------------------------------------------------
-- The recorder.
--
-- One function for every table, so adding a table to the log is one
-- `create trigger` and nothing else. The summary is built per table because
-- "Kofi Mensah added" means nothing without saying what.
-- ---------------------------------------------------------------------------
create or replace function public.record_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data   jsonb;
  org        uuid;
  actor      uuid := auth.uid();
  who        text;
  what       text;
  the_action text;
begin
  -- On delete the new row does not exist, so describe the old one.
  if tg_op = 'DELETE' then
    row_data := to_jsonb(old);
    the_action := 'deleted';
  elsif tg_op = 'INSERT' then
    row_data := to_jsonb(new);
    the_action := 'created';
  else
    row_data := to_jsonb(new);
    the_action := 'updated';
  end if;

  org := (row_data ->> 'organization_id')::uuid;
  if org is null then
    return coalesce(new, old);
  end if;

  select full_name into who from public.profiles where id = actor;
  -- No session means the webhook or a scheduled job, and saying so is more
  -- honest than leaving it blank for a reader to guess at.
  who := coalesce(who, case when actor is null then 'Fold' else 'Somebody' end);

  what := case tg_table_name
    when 'members' then
      'Member ' || coalesce(row_data ->> 'full_name', 'record')
    when 'contributions' then
      initcap(coalesce(row_data ->> 'type', 'contribution'))
        || ' of GHS ' || coalesce(row_data ->> 'amount', '0')
    when 'attendance_records' then
      'Attendance for ' || coalesce(row_data ->> 'date', 'a service')
    when 'vital_records' then
      initcap(coalesce(row_data ->> 'type', 'record'))
    when 'organization_members' then
      'Team member with the role ' || coalesce(row_data ->> 'role', 'unknown')
    else tg_table_name
  end;

  insert into public.activity_log (
    organization_id, actor_profile_id, actor_name,
    action, entity, entity_id, summary
  )
  values (
    org, actor, who,
    the_action, tg_table_name, (row_data ->> 'id')::uuid,
    what
  );

  return coalesce(new, old);
end;
$$;

revoke all on function public.record_activity() from public;
revoke all on function public.record_activity() from anon;
revoke all on function public.record_activity() from authenticated;

-- ---------------------------------------------------------------------------
-- What gets logged.
--
-- The records a church is accountable for. Not notifications, not payments:
-- a payment already has its own row with its own gateway response, and
-- logging both would say the same thing twice.
-- ---------------------------------------------------------------------------
drop trigger if exists members_activity on public.members;
create trigger members_activity
  after insert or update or delete on public.members
  for each row execute function public.record_activity();

drop trigger if exists contributions_activity on public.contributions;
create trigger contributions_activity
  after insert or update or delete on public.contributions
  for each row execute function public.record_activity();

drop trigger if exists attendance_activity on public.attendance_records;
create trigger attendance_activity
  after insert or update or delete on public.attendance_records
  for each row execute function public.record_activity();

drop trigger if exists vital_records_activity on public.vital_records;
create trigger vital_records_activity
  after insert or update or delete on public.vital_records
  for each row execute function public.record_activity();

drop trigger if exists team_activity on public.organization_members;
create trigger team_activity
  after insert or update or delete on public.organization_members
  for each row execute function public.record_activity();
