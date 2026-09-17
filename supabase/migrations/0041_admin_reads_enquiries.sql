-- ============================================================================
-- 0041  The enquiries page stops using the service role
-- ============================================================================
--
-- /admin/enquiries read contact_requests with the service role key, which
-- bypasses row level security completely, and then decided for itself who
-- was allowed to look by comparing an address against an environment
-- variable. That is our own rule broken: the service role exists for the
-- Paystack webhook, which has no user session, and for nothing else.
--
-- It failed closed, so nothing was ever exposed. The objection is that the
-- page was the only thing standing between a reader and every enquiry ever
-- sent, and a page is the wrong place for that to live. If the guard were
-- ever edited, moved, or a second page added, the database would not have
-- noticed.
--
-- So the decision moves into the database, where every other access
-- decision in this project already lives.

create table if not exists public.app_admins (
  email      text primary key,
  note       text,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

comment on table public.app_admins is
  'Who may read enquiries. Deliberately has no policy at all, so nobody can read or change it through the API, only through the SQL editor or a migration.';

-- No policy, on purpose. RLS on with no policy denies everyone except the
-- roles that bypass it, so the list of administrators cannot be read or
-- edited by anybody holding an API key, including an administrator.

-- ---------------------------------------------------------------------------
-- Who is asking.
--
-- SECURITY DEFINER because the caller may not read app_admins, which is the
-- whole point of it. Compares the address on the caller's own verified JWT,
-- so it cannot be spoofed by anything the client sends in a body or a form.
-- ---------------------------------------------------------------------------
create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_app_admin() from public;
revoke all on function public.is_app_admin() from anon;
grant execute on function public.is_app_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Now an administrator can read enquiries through the ordinary client.
--
-- Still no insert, update or delete policy for anybody: an enquiry is
-- written by the public insert policy and never edited afterwards.
-- ---------------------------------------------------------------------------
drop policy if exists contact_admin_read on public.contact_requests;
create policy contact_admin_read on public.contact_requests
  for select
  to authenticated
  using (public.is_app_admin());

grant select on public.contact_requests to authenticated;

-- ---------------------------------------------------------------------------
-- A column nobody ever read or wrote.
--
-- `handled` was added with the table and never used by any page or action.
-- A field that is always false teaches a reader something untrue about how
-- the product works.
-- ---------------------------------------------------------------------------
alter table public.contact_requests drop column if exists handled;
