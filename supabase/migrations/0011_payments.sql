-- Fold, mobile money collection attempts. Apply ELEVENTH.
--
-- Finance roles only, matching contributions (0006). Note there is NO
-- insert/update policy for ordinary users on status: the webhook is the
-- only thing that may mark a payment successful, and it runs server-side
-- with the service role, bypassing RLS. A member-facing client can create
-- a pending charge and read its own org's payments, nothing more.

alter table public.payments enable row level security;

drop policy if exists "payments: finance roles read"   on public.payments;
drop policy if exists "payments: finance roles insert" on public.payments;
drop policy if exists "payments: admins delete"        on public.payments;

create policy "payments: finance roles read"
  on public.payments for select
  using (public.org_role(organization_id) in
    ('super_admin','admin','minister','finance_officer'));

create policy "payments: finance roles insert"
  on public.payments for insert
  with check (public.org_role(organization_id) in
    ('super_admin','admin','finance_officer'));

create policy "payments: admins delete"
  on public.payments for delete
  using (public.org_role(organization_id) in ('super_admin','admin'));
