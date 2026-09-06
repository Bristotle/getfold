-- Fold — restrict finance to finance roles. Apply SIXTH.
--
-- 0002_rls.sql gave contributions and funds the same policy as every other
-- tenant table: any member of the org can READ them, and any of the five
-- staff roles can WRITE them. That means a class leader could read the
-- church's entire giving history, and a plain member could too.
--
-- The product intent (README, Phase 2) is that finance is visible only to
-- those who need it. Doing that in the UI alone would be cosmetic — the
-- table is still readable through PostgREST with the same anon key. So the
-- restriction belongs here.
--
-- Roles, and why:
--   view  = super_admin, admin, minister, finance_officer
--           a minister needs oversight of giving; a class leader does not.
--   write = super_admin, admin, finance_officer
--           handling money is separated from pastoral oversight, so a
--           minister can see the figures without being able to alter them.
--   delete = super_admin, admin

-- ---------- contributions ----------
drop policy if exists "contributions: org-mates read"   on public.contributions;
drop policy if exists "contributions: staff write"      on public.contributions;
drop policy if exists "contributions: staff update"     on public.contributions;
drop policy if exists "contributions: admins delete"    on public.contributions;

create policy "contributions: finance roles read"
  on public.contributions for select
  using (public.org_role(organization_id) in
    ('super_admin','admin','minister','finance_officer'));

create policy "contributions: finance roles insert"
  on public.contributions for insert
  with check (public.org_role(organization_id) in
    ('super_admin','admin','finance_officer'));

create policy "contributions: finance roles update"
  on public.contributions for update
  using (public.org_role(organization_id) in
    ('super_admin','admin','finance_officer'));

create policy "contributions: admins delete"
  on public.contributions for delete
  using (public.org_role(organization_id) in ('super_admin','admin'));

-- ---------- funds ----------
drop policy if exists "funds: org-mates read"  on public.funds;
drop policy if exists "funds: staff write"     on public.funds;
drop policy if exists "funds: staff update"    on public.funds;
drop policy if exists "funds: admins delete"   on public.funds;

create policy "funds: finance roles read"
  on public.funds for select
  using (public.org_role(organization_id) in
    ('super_admin','admin','minister','finance_officer'));

create policy "funds: finance roles insert"
  on public.funds for insert
  with check (public.org_role(organization_id) in
    ('super_admin','admin','finance_officer'));

create policy "funds: finance roles update"
  on public.funds for update
  using (public.org_role(organization_id) in
    ('super_admin','admin','finance_officer'));

create policy "funds: admins delete"
  on public.funds for delete
  using (public.org_role(organization_id) in ('super_admin','admin'));

-- ---------- transfers: approving one changes a member's status ----------
drop policy if exists "member_transfers: staff update"  on public.member_transfers;

create policy "member_transfers: admins update"
  on public.member_transfers for update
  using (public.org_role(organization_id) in ('super_admin','admin'));

-- NOTE: dashboard_stats() is SECURITY INVOKER, so its tithe figure now
-- returns 0 for anyone without finance read access. That is intended — the
-- dashboard hides the tile for those roles rather than showing a false zero.
