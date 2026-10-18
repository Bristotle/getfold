-- ============================================================================
-- 0050  Confirming a reset does not hang on a full stop
-- ============================================================================
--
-- The first pastor to use Start again typed "EAGLES IMPACT MINISTRY INT"
-- for a church named "EAGLES IMPACT MINISTRY INT." and was refused over
-- the full stop, then shown "That did not save" because the application
-- hid the real message. The comparison now ignores case, spaces and
-- punctuation; every letter and number still has to be typed, which is
-- the point of asking.
--
-- Same signature as 0048, so this replaces it rather than adding a second
-- function.

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

  -- Letters and numbers only. A pastor typing "EAGLES IMPACT MINISTRY INT"
  -- for "EAGLES IMPACT MINISTRY INT." has plainly confirmed, and refusing
  -- over the full stop is what the first church to try it ran into.
  if regexp_replace(lower(coalesce(confirm_name, '')), '[^[:alnum:]]', '', 'g')
     <> regexp_replace(lower(church), '[^[:alnum:]]', '', 'g')
     or regexp_replace(lower(coalesce(confirm_name, '')), '[^[:alnum:]]', '', 'g') = '' then
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
