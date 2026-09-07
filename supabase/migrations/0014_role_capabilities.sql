-- Fold, what each role may do. Apply FOURTEENTH.
--
-- Rewrites every role list in the policies so pastor and elder are real
-- rather than decorative. The shape:
--
--   pastor          everything, including money. Owns the church.
--   admin           everything the pastor delegated, including money.
--   finance_officer the money, and reading people.
--   elder           pastoral work without money.
--   minister        legacy, treated exactly as elder.
--   class_leader    their class. Members, attendance. No money.
--   member          reads only.
--
-- Money is deliberately narrow: giving is the most sensitive thing a church
-- records, and an elder or class leader has no reason to see the
-- congregation's contributions.

-- convenience lists, inlined below because a policy cannot call a function
-- that reads settings

-- ---------- people, attendance, groups, visitors, records ----------
do $$
declare t text;
begin
  foreach t in array array[
    'member_groups','members','visitors','member_transfers',
    'attendance_records','vital_records'
  ] loop
    execute format('drop policy if exists "%1$s: org-mates read" on public.%1$s', t);
    execute format('drop policy if exists "%1$s: staff write" on public.%1$s', t);
    execute format('drop policy if exists "%1$s: staff update" on public.%1$s', t);
    execute format('drop policy if exists "%1$s: admins delete" on public.%1$s', t);

    execute format(
      'create policy "%1$s: org-mates read" on public.%1$s for select
         using (public.is_org_member(organization_id))', t);

    execute format(
      'create policy "%1$s: staff write" on public.%1$s for insert
         with check (public.org_role(organization_id) in
           (''super_admin'',''pastor'',''admin'',''minister'',''elder'',''finance_officer'',''class_leader''))', t);

    execute format(
      'create policy "%1$s: staff update" on public.%1$s for update
         using (public.org_role(organization_id) in
           (''super_admin'',''pastor'',''admin'',''minister'',''elder'',''finance_officer'',''class_leader''))', t);

    execute format(
      'create policy "%1$s: admins delete" on public.%1$s for delete
         using (public.org_role(organization_id) in
           (''super_admin'',''pastor'',''admin''))', t);
  end loop;
end $$;

-- attendance check-ins follow the same rule as attendance itself
drop policy if exists "check_ins: staff write"  on public.attendance_check_ins;
drop policy if exists "check_ins: staff delete" on public.attendance_check_ins;

create policy "check_ins: staff write"
  on public.attendance_check_ins for insert
  with check (public.org_role(organization_id) in
    ('super_admin','pastor','admin','minister','elder','finance_officer','class_leader'));

create policy "check_ins: staff delete"
  on public.attendance_check_ins for delete
  using (public.org_role(organization_id) in
    ('super_admin','pastor','admin','minister','elder','finance_officer','class_leader'));

-- ---------- money: pastor, admin, finance officer only ----------
do $$
declare t text;
begin
  foreach t in array array['contributions','funds','payments'] loop
    execute format('drop policy if exists "%1$s: finance roles read" on public.%1$s', t);
    execute format('drop policy if exists "%1$s: finance roles insert" on public.%1$s', t);
    execute format('drop policy if exists "%1$s: finance roles update" on public.%1$s', t);
    execute format('drop policy if exists "%1$s: admins delete" on public.%1$s', t);

    execute format(
      'create policy "%1$s: finance roles read" on public.%1$s for select
         using (public.org_role(organization_id) in
           (''super_admin'',''pastor'',''admin'',''finance_officer''))', t);

    execute format(
      'create policy "%1$s: finance roles insert" on public.%1$s for insert
         with check (public.org_role(organization_id) in
           (''super_admin'',''pastor'',''admin'',''finance_officer''))', t);

    execute format(
      'create policy "%1$s: finance roles update" on public.%1$s for update
         using (public.org_role(organization_id) in
           (''super_admin'',''pastor'',''admin'',''finance_officer''))', t);

    execute format(
      'create policy "%1$s: admins delete" on public.%1$s for delete
         using (public.org_role(organization_id) in
           (''super_admin'',''pastor'',''admin''))', t);
  end loop;
end $$;

-- ---------- who may manage people and invitations ----------
drop policy if exists "organization_members: admins manage" on public.organization_members;
drop policy if exists "organization_members: admins update" on public.organization_members;
drop policy if exists "organization_members: admins delete" on public.organization_members;

create policy "organization_members: admins manage"
  on public.organization_members for insert
  with check (public.org_role(organization_id) in ('super_admin','pastor','admin'));

create policy "organization_members: admins update"
  on public.organization_members for update
  using (public.org_role(organization_id) in ('super_admin','pastor','admin'));

create policy "organization_members: admins delete"
  on public.organization_members for delete
  using (public.org_role(organization_id) in ('super_admin','pastor','admin'));

drop policy if exists "invitations: admins read"   on public.organization_invitations;
drop policy if exists "invitations: admins create" on public.organization_invitations;
drop policy if exists "invitations: admins delete" on public.organization_invitations;

create policy "invitations: admins read"
  on public.organization_invitations for select
  using (public.org_role(organization_id) in ('super_admin','pastor','admin'));

create policy "invitations: admins create"
  on public.organization_invitations for insert
  with check (public.org_role(organization_id) in ('super_admin','pastor','admin'));

create policy "invitations: admins delete"
  on public.organization_invitations for delete
  using (public.org_role(organization_id) in ('super_admin','pastor','admin'));

-- organizations and transfers
drop policy if exists "organizations: admins can update"     on public.organizations;
drop policy if exists "member_transfers: admins update"      on public.member_transfers;

create policy "organizations: admins can update"
  on public.organizations for update
  using (public.org_role(id) in ('super_admin','pastor','admin'));

create policy "member_transfers: admins update"
  on public.member_transfers for update
  using (public.org_role(organization_id) in ('super_admin','pastor','admin'));

-- notifications follow the pastoral set, not the money set
drop policy if exists "notifications: staff read"   on public.notifications;
drop policy if exists "notifications: staff write"  on public.notifications;
drop policy if exists "notifications: staff update" on public.notifications;
drop policy if exists "notifications: admins delete" on public.notifications;

create policy "notifications: staff read"
  on public.notifications for select
  using (public.org_role(organization_id) in
    ('super_admin','pastor','admin','minister','elder','finance_officer','class_leader'));

create policy "notifications: staff write"
  on public.notifications for insert
  with check (public.org_role(organization_id) in
    ('super_admin','pastor','admin','minister','elder','finance_officer','class_leader'));

create policy "notifications: staff update"
  on public.notifications for update
  using (public.org_role(organization_id) in
    ('super_admin','pastor','admin','minister','elder','finance_officer','class_leader'));

create policy "notifications: admins delete"
  on public.notifications for delete
  using (public.org_role(organization_id) in ('super_admin','pastor','admin'));
