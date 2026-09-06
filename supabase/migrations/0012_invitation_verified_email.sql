-- Fold, harden invitation acceptance. Apply TWELFTH.
--
-- accept_pending_invitations() granted membership by matching the caller's
-- email against a pending invitation. That is only safe while Supabase
-- enforces email confirmation: with confirmation off, anyone could register
-- pastor@somechurch.org without controlling the mailbox and inherit whatever
-- role was invited, including administrator.
--
-- An authorisation decision must not depend on a dashboard toggle. The
-- function now requires a verified address before it grants anything.

create or replace function public.accept_pending_invitations()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  uid        uuid := auth.uid();
  user_email text;
  confirmed  timestamptz;
  claimed    int  := 0;
  inv        record;
begin
  if uid is null then
    raise exception 'You must be signed in.' using errcode = '42501';
  end if;

  select email, email_confirmed_at
    into user_email, confirmed
    from auth.users
   where id = uid;

  if user_email is null then
    return 0;
  end if;

  -- The check that closes the hole. Without a confirmed address we cannot
  -- know the caller owns the mailbox the invitation was addressed to.
  if confirmed is null then
    raise exception 'Confirm your email address before joining a church.'
      using errcode = '42501';
  end if;

  insert into public.profiles (id, full_name)
  select uid, coalesce(u.raw_user_meta_data ->> 'full_name', u.email)
  from auth.users u where u.id = uid
  on conflict (id) do nothing;

  for inv in
    select * from public.organization_invitations
     where lower(email) = lower(user_email)
       and accepted_at is null
  loop
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
