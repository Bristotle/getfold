-- ============================================================================
-- 0048  A pastor can clear the church's records and start again
-- ============================================================================
--
-- Asked for by a church that imported a messy register and wanted to begin
-- again cleanly, rather than archive four hundred rows one at a time.
--
-- WHAT GOES: members, classes and groups, visitors, transfers, attendance,
-- vital records, giving recorded in Fold, funds, the message log and
-- meeting reminders. Everything a church typed in.
--
-- WHAT STAYS:
--   * The church itself, its settings, and the team with their roles, so
--     nobody is locked out of what they just emptied.
--   * Online payment records and invoices. Money that moved through
--     Paystack, and what the church owes Fold, are financial records with a
--     counterpart outside this database; deleting our copy would not undo
--     the payment, only our ability to answer a question about it.
--   * The activity log, plus one line saying who cleared everything and
--     when. A reset that erased the record of itself would be a way to
--     hide anything.
--
-- ONLY THE PASTOR, which is org.transfer in permissions.ts. Every other
-- role, administrators included, is refused here and not merely hidden
-- from in the interface. The church's name has to be typed to confirm,
-- checked here rather than in the form.
--
-- A read only church cannot reset: the read only trigger refuses the
-- deletes, and the whole function rolls back.

create or replace function public.reset_church(org_id uuid, confirm_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  church text;
  who    text;
begin
  if coalesce(public.org_role(org_id), '') not in ('super_admin', 'pastor') then
    raise exception 'Only the pastor can clear the church''s records.'
      using errcode = '42501';
  end if;

  select name into church from public.organizations where id = org_id;
  if church is null then
    raise exception 'No such church.' using errcode = 'P0002';
  end if;

  if lower(trim(coalesce(confirm_name, ''))) <> lower(trim(church)) then
    raise exception 'Type the church''s name exactly as it appears, %, to confirm.', church
      using errcode = '22023';
  end if;

  perform set_config('fold.reset', 'on', true);

  -- Order matters: transfers refuse to let a member go first, and giving
  -- goes before funds so the fund totals are not recalculated for nothing.
  delete from public.attendance_records where organization_id = org_id;
  delete from public.member_transfers   where organization_id = org_id;
  delete from public.vital_records      where organization_id = org_id;
  delete from public.visitors           where organization_id = org_id;
  delete from public.contributions      where organization_id = org_id;
  delete from public.funds              where organization_id = org_id;
  delete from public.notifications      where organization_id = org_id;
  delete from public.meetings           where organization_id = org_id;
  delete from public.members            where organization_id = org_id;
  delete from public.member_groups      where organization_id = org_id;

  perform set_config('fold.reset', 'off', true);

  select full_name into who from public.profiles where id = auth.uid();

  insert into public.activity_log (
    organization_id, actor_profile_id, actor_name,
    action, entity, entity_id, summary
  )
  values (
    org_id, auth.uid(), coalesce(who, 'The pastor'),
    'deleted', 'organizations', org_id,
    'Cleared every member, group, service, gift and message to start again. The team, invoices and online payment records were kept.'
  );
end;
$$;

revoke all on function public.reset_church(uuid, text) from public, anon;
grant execute on function public.reset_church(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- The activity recorder, unchanged from 0043 except that it stands aside
-- while a reset is running.
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
  -- A reset writes one line for the whole clear out, not one per row.
  if current_setting('fold.reset', true) = 'on' then
    return coalesce(new, old);
  end if;

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
