-- ============================================================================
-- 0043  What happens after the trial, decided
-- ============================================================================
--
-- The trial was recorded but never enforced. A church's status moved to
-- "grace" on day 31, a banner appeared, and nothing else changed: it could
-- go on adding members and taking money for ever without paying. That was
-- a reasonable choice for a product with no customers and an unreasonable
-- one for a business, and somebody had to decide the ending. The owner has.
--
--   Day 0 to 30    trial. Full use.
--   Day 31 to 60   grace. Full use, a banner, reminders by text and email.
--   Day 61 to 90   read only. Everything is still there and still theirs,
--                  they can read it and export it, but nothing new can be
--                  recorded until a band is chosen. Reminders continue.
--   Day 91         final notice, and the church and its records are deleted.
--
-- Two design decisions are worth stating.
--
-- READ ONLY IS ENFORCED BY THE DATABASE, not by hiding buttons. A trigger on
-- every table of church records refuses a write while the church is
-- expired, whatever path the write takes. It says so in plain words, so the
-- application can show the sentence rather than a code.
--
-- DELETION IS A REAL DELETE, not a flag. The privacy policy promises the
-- records are gone, and a row marked "deleted" that is still on disk is not
-- gone. organizations cascades to everything beneath it.

-- ---------------------------------------------------------------------------
-- A church's write access, as one question.
-- ---------------------------------------------------------------------------
create or replace function public.org_is_read_only(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select subscription_status = 'expired' from public.organizations where id = org_id),
    false
  );
$$;

revoke all on function public.org_is_read_only(uuid) from public;
grant execute on function public.org_is_read_only(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- The trigger that refuses a write on an expired church.
--
-- Fires BEFORE, so nothing is written. Skipped when the lifecycle job has
-- set fold.lifecycle, because the deletion on day 91 cascades through
-- exactly these tables and must not be refused by the guard that protects
-- them the rest of the time.
-- ---------------------------------------------------------------------------
create or replace function public.refuse_if_read_only()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  org uuid;
begin
  if current_setting('fold.lifecycle', true) = 'on' then
    return coalesce(new, old);
  end if;

  org := coalesce(
    (to_jsonb(new) ->> 'organization_id')::uuid,
    (to_jsonb(old) ->> 'organization_id')::uuid
  );

  if org is not null and public.org_is_read_only(org) then
    raise exception 'READ_ONLY: this church''s trial has ended and nothing new can be recorded until a plan is chosen. Everything already recorded is still here and can be exported.'
      using errcode = '42501';
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function public.refuse_if_read_only() from public;

-- The tables a church writes its records into. Not organizations, invoices,
-- payments or notifications: those are how a church pays and is told, and
-- must keep working precisely when it is read only.
do $$
declare t text;
begin
  foreach t in array array[
    'members', 'contributions', 'attendance_records', 'vital_records',
    'member_groups', 'visitors', 'member_transfers', 'funds',
    'organization_members', 'organization_invitations'
  ] loop
    execute format('drop trigger if exists %I on public.%I', t || '_read_only', t);
    execute format(
      'create trigger %I before insert or update or delete on public.%I
         for each row execute function public.refuse_if_read_only()',
      t || '_read_only', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- The daily step. Run by the reminder job before it sends anything.
--
-- Returns what it did, including the pastor of each church it deleted, so
-- the job can send the final notice and remove an account that now belongs
-- to no church.
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
  -- Day 31: trialing becomes grace. mark_trial_reminded used to do this as
  -- a side effect, which meant a church with no reminder sent never moved.
  update public.organizations
     set subscription_status = 'grace'
   where subscription_status = 'trialing'
     and trial_ends_at < now();

  -- Day 61: grace becomes expired, which the trigger above turns into read
  -- only.
  return query
  with moved as (
    update public.organizations o
       set subscription_status = 'expired'
     where o.subscription_status = 'grace'
       and o.trial_ends_at + interval '30 days' < now()
    returning o.id, o.name
  )
  select 'read_only'::text, m.id, m.name, om.profile_id, u.email::text
    from moved m
    left join public.organization_members om on om.organization_id = m.id and om.role = 'pastor'
    left join auth.users u on u.id = om.profile_id;

  -- Day 91: gone. The pastor is returned first, because after the delete
  -- there is no membership row left to find them by.
  return query
  with doomed as (
    select o.id, o.name, om.profile_id, u.email::text as email
      from public.organizations o
      left join public.organization_members om on om.organization_id = o.id and om.role = 'pastor'
      left join auth.users u on u.id = om.profile_id
     where o.subscription_status = 'expired'
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

revoke all on function public.advance_trial_lifecycle() from public;
revoke all on function public.advance_trial_lifecycle() from anon;
revoke all on function public.advance_trial_lifecycle() from authenticated;
grant execute on function public.advance_trial_lifecycle() to service_role;

-- The delete cascades through tables the read only trigger guards, so the
-- job sets the bypass for its own transaction. Exposed as a function the
-- service role may call, since SET cannot be sent through PostgREST.
create or replace function public.run_trial_lifecycle()
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
  perform set_config('fold.lifecycle', 'on', true);
  return query select * from public.advance_trial_lifecycle();
end;
$$;

revoke all on function public.run_trial_lifecycle() from public;
revoke all on function public.run_trial_lifecycle() from anon;
revoke all on function public.run_trial_lifecycle() from authenticated;
grant execute on function public.run_trial_lifecycle() to service_role;

-- ---------------------------------------------------------------------------
-- Reminders on the new milestones too.
--
-- days_left is measured from the END OF THE TRIAL, so after it these are
-- negative: day 60 is -30, day 84 is -54, day 90 is -60. Named in the
-- reminder job rather than here, so the message can say what each means.
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
  where o.subscription_status in ('trialing', 'grace', 'expired')
    and ceil(extract(epoch from (o.trial_ends_at - now())) / 86400)::int
        in (7, 3, 1, 0, -14, -29, -30, -45, -54, -59)
    and (o.trial_reminder_sent_at is null
         or o.trial_reminder_sent_at < date_trunc('day', now()));
$$;

-- mark_trial_reminded no longer moves status; the lifecycle does.
create or replace function public.mark_trial_reminded(org_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.organizations
     set trial_reminder_sent_at = now()
   where id = org_id;
$$;

-- ---------------------------------------------------------------------------
-- The activity log must not stop a church being deleted.
--
-- Found by testing the deletion: organizations cascades to members, the
-- AFTER DELETE trigger on members writes an activity_log row naming the
-- church, and the church is already gone, so the foreign key refuses it and
-- the whole delete fails. That would have broken every church deletion,
-- including a pastor closing their own account, not just the lifecycle.
--
-- A church that no longer exists has no log to write to, so the recorder
-- steps aside when the organisation is gone.
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
  if org is null or not exists (select 1 from public.organizations where id = org) then
    return coalesce(new, old);
  end if;

  select full_name into who from public.profiles where id = actor;
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
