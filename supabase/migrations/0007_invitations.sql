-- Fold — inviting people and assigning roles. Apply SEVENTH.
--
-- Same bootstrap problem as 0003: accepting an invitation means inserting
-- into organization_members, but that table's INSERT policy requires you to
-- already be an admin of the org you are joining. An invitee is by
-- definition neither. So acceptance goes through a SECURITY DEFINER
-- function that will ONLY act on an invitation matching the caller's own
-- verified email address.

alter table public.organization_invitations enable row level security;

-- Admins manage invitations for their own org.
drop policy if exists "invitations: admins read" on public.organization_invitations;
create policy "invitations: admins read"
  on public.organization_invitations for select
  using (public.org_role(organization_id) in ('super_admin','admin'));

drop policy if exists "invitations: admins create" on public.organization_invitations;
create policy "invitations: admins create"
  on public.organization_invitations for insert
  with check (public.org_role(organization_id) in ('super_admin','admin'));

drop policy if exists "invitations: admins delete" on public.organization_invitations;
create policy "invitations: admins delete"
  on public.organization_invitations for delete
  using (public.org_role(organization_id) in ('super_admin','admin'));

-- An invitee can see invitations addressed to their own email, so the
-- onboarding page can offer "join this church" instead of "create one".
-- auth.jwt() carries the address the account actually verified.
drop policy if exists "invitations: invitee reads own" on public.organization_invitations;
create policy "invitations: invitee reads own"
  on public.organization_invitations for select
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- ---------- Accepting ----------
create or replace function public.accept_pending_invitations()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  uid        uuid := auth.uid();
  user_email text;
  claimed    int  := 0;
  inv        record;
begin
  if uid is null then
    raise exception 'You must be signed in.' using errcode = '42501';
  end if;

  select email into user_email from auth.users where id = uid;
  if user_email is null then
    return 0;
  end if;

  -- Make sure a profile exists; organization_members.profile_id references it.
  insert into public.profiles (id, full_name)
  select uid, coalesce(u.raw_user_meta_data ->> 'full_name', u.email)
  from auth.users u where u.id = uid
  on conflict (id) do nothing;

  for inv in
    select * from public.organization_invitations
     where lower(email) = lower(user_email)
       and accepted_at is null
  loop
    -- Already a member (perhaps invited twice, or added directly): mark the
    -- invitation used rather than raising a unique-violation.
    insert into public.organization_members (organization_id, profile_id, role)
    values (inv.organization_id, uid, inv.role)
    on conflict (organization_id, profile_id) do nothing;

    update public.organization_invitations
       set accepted_at = now()
     where id = inv.id;

    claimed := claimed + 1;
  end loop;

  return claimed;
end;
$$;

revoke all on function public.accept_pending_invitations() from public;
revoke all on function public.accept_pending_invitations() from anon;
grant execute on function public.accept_pending_invitations() to authenticated;

-- ---------- Guard against locking a church out of itself ----------
-- Demoting or removing the last admin would leave an organization with
-- nobody who can manage it — and no way back through the UI.
create or replace function public.prevent_last_admin_removal()
returns trigger
language plpgsql
as $$
declare
  remaining int;
  target_org uuid;
begin
  target_org := coalesce(old.organization_id, new.organization_id);

  -- Deleting the ORGANISATION itself cascades to its memberships, which
  -- would otherwise trip this guard on the final admin and make an
  -- organisation impossible to delete. By the time a cascaded delete
  -- reaches this row the parent is already gone, so its absence is a
  -- reliable signal that the whole church is being removed, not just a
  -- person.
  if tg_op = 'DELETE'
     and not exists (select 1 from public.organizations o where o.id = target_org) then
    return old;
  end if;

  -- Only care when an admin stops being an admin.
  if old.role not in ('super_admin','admin') then
    return coalesce(new, old);
  end if;
  if tg_op = 'UPDATE' and new.role in ('super_admin','admin') then
    return new;
  end if;

  select count(*) into remaining
    from public.organization_members om
   where om.organization_id = target_org
     and om.role in ('super_admin','admin')
     and om.id <> old.id;

  if remaining = 0 then
    raise exception 'This is the last administrator — promote someone else first.'
      using errcode = '23514';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists organization_members_last_admin on public.organization_members;
create trigger organization_members_last_admin
  before update or delete on public.organization_members
  for each row execute function public.prevent_last_admin_removal();
