-- Fold, outbound message log. Apply TENTH.
--
-- Read by any staff member (a class leader should be able to see that a
-- welcome went out), written only by admins/ministers, and never updated
-- from the client: delivery status is set by the server action that talks
-- to the provider, so there is no UPDATE policy at all.

alter table public.notifications enable row level security;

drop policy if exists "notifications: staff read"   on public.notifications;
drop policy if exists "notifications: staff write"  on public.notifications;
drop policy if exists "notifications: staff update" on public.notifications;
drop policy if exists "notifications: admins delete" on public.notifications;

create policy "notifications: staff read"
  on public.notifications for select
  using (public.org_role(organization_id) in
    ('super_admin','admin','minister','finance_officer','class_leader'));

create policy "notifications: staff write"
  on public.notifications for insert
  with check (public.org_role(organization_id) in
    ('super_admin','admin','minister','finance_officer','class_leader'));

-- Needed so a send attempt can record its outcome.
create policy "notifications: staff update"
  on public.notifications for update
  using (public.org_role(organization_id) in
    ('super_admin','admin','minister','finance_officer','class_leader'));

create policy "notifications: admins delete"
  on public.notifications for delete
  using (public.org_role(organization_id) in ('super_admin','admin'));
