-- Fold, close a privilege escalation. Apply FIFTEENTH.
--
-- Administrators need to update organization_members, because assigning
-- roles is their job. But that policy let an administrator set their own
-- role to 'pastor' with a direct PostgREST call, taking ownership of the
-- church. The interface refused it; the database did not, and the database
-- is the boundary.
--
-- Two rules, enforced here rather than in application code so no future
-- action can forget them:
--
--   1. Only a pastor may create a pastor.
--   2. Only a pastor may change or remove an existing pastor.
--
-- Found by testing the role model rather than by reading it: an admin
-- promoted themselves successfully before this existed.

create or replace function public.protect_pastor_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
  target_org uuid;
begin
  target_org := coalesce(new.organization_id, old.organization_id);

  -- A cascade from organizations reaches this row after the parent is gone,
  -- and deleting a church must stay possible.
  if tg_op = 'DELETE'
     and not exists (select 1 from public.organizations o where o.id = target_org) then
    return old;
  end if;

  actor_role := public.org_role(target_org);

  -- The service role has no membership and therefore no org_role. It runs
  -- the webhook and admin scripts, and is trusted by definition.
  if actor_role is null then
    return coalesce(new, old);
  end if;

  -- 1. appointing a pastor
  if tg_op in ('INSERT', 'UPDATE')
     and new.role = 'pastor'
     and coalesce(old.role::text, '') <> 'pastor'
     and actor_role not in ('super_admin', 'pastor') then
    raise exception 'Only a pastor can appoint another pastor.'
      using errcode = '42501';
  end if;

  -- 2. changing or removing one
  if tg_op in ('UPDATE', 'DELETE')
     and old.role = 'pastor'
     and actor_role not in ('super_admin', 'pastor') then
    raise exception 'Only a pastor can change the pastor of a church.'
      using errcode = '42501';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists organization_members_protect_pastor on public.organization_members;
create trigger organization_members_protect_pastor
  before insert or update or delete on public.organization_members
  for each row execute function public.protect_pastor_role();
