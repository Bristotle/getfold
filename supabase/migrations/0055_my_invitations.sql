-- The invitations addressed to the caller, with the name of the church.
--
-- An invitee could read their invitation row but not the church it was for:
-- organizations is readable by members and overseers only, and an invitee
-- is neither until they join. Onboarding showed the "Join" card only when
-- the church's name came back, so it never showed, and every invited person
-- was offered "Set up your church" and nothing else. An elder did exactly
-- that and ended up in an empty copy of his own church.
--
-- Widening the organizations policy would hand every column of the church
-- to anybody with an invitation. This returns the name and nothing more,
-- and like accept_pending_invitations() only for a confirmed address, since
-- an unconfirmed one proves nothing about the mailbox.

create or replace function public.my_invitations()
returns table (id uuid, role text, organization_id uuid, church text)
language sql
stable
security definer
set search_path = public
as $$
  select i.id, i.role::text, i.organization_id, o.name
    from public.organization_invitations i
    join public.organizations o on o.id = i.organization_id
    join auth.users u on u.id = auth.uid()
   where lower(i.email) = lower(u.email)
     and u.email_confirmed_at is not null
     and i.accepted_at is null
   order by i.created_at;
$$;

revoke all on function public.my_invitations() from public;
revoke all on function public.my_invitations() from anon;
grant execute on function public.my_invitations() to authenticated;
