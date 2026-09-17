-- ============================================================================
-- 0042  Newsletter sign ups
-- ============================================================================
--
-- A box in the footer that says "straight to your inbox" has to put the
-- address somewhere, or it is a decoration that lies. This is where.
--
-- Same shape as contact_requests: the public may insert and nobody may read
-- through the API, so the form cannot become a way to read who else signed
-- up. Reading is done from the SQL editor, or later from an admin page
-- behind the same is_app_admin() gate the enquiries use.

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text,
  created_at timestamptz not null default now()
);

-- One row per address, case insensitively. A second sign up from the same
-- inbox is not an error the person needs to see, it is handled in the form.
create unique index if not exists newsletter_subscribers_email_key
  on public.newsletter_subscribers (lower(email));

alter table public.newsletter_subscribers enable row level security;

drop policy if exists newsletter_insert on public.newsletter_subscribers;
create policy newsletter_insert on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists newsletter_admin_read on public.newsletter_subscribers;
create policy newsletter_admin_read on public.newsletter_subscribers
  for select
  to authenticated
  using (public.is_app_admin());

grant insert on public.newsletter_subscribers to anon, authenticated;
grant select on public.newsletter_subscribers to authenticated;
