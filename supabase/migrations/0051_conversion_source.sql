-- ============================================================================
-- 0051  Which page brought a church
-- ============================================================================
--
-- Fold writes articles, guides, tools and comparison pages to bring churches
-- in, and until now could not tell which of them did. Only page views were
-- counted, so a post read by thousands who never signed up looked better
-- than one read by forty who all did.
--
-- Nothing is stored in the visitor's browser: the privacy policy promises
-- the public site sets no cookies, and that promise stands. Instead, each
-- form sends, alongside what the person typed, the page on this site that
-- led them to it, the name of the site that sent them if they came from
-- elsewhere (a host name, never a full address), and any utm_ tags on the
-- link. It is saved on the enquiry or subscription, and on the account at
-- signup. Nothing about what they read on the way is kept.
--
-- The support console reads it in aggregate through platform_attribution(),
-- which only Fold staff with can_view_churches may call.

do $$
declare t text;
begin
  foreach t in array array['contact_requests', 'newsletter_subscribers'] loop
    execute format($f$
      alter table public.%1$I
        add column if not exists from_page  text check (char_length(from_page)  <= 300),
        add column if not exists from_site text check (char_length(from_site) <= 200),
        add column if not exists utm_source     text check (char_length(utm_source)     <= 100),
        add column if not exists utm_medium     text check (char_length(utm_medium)     <= 100),
        add column if not exists utm_campaign   text check (char_length(utm_campaign)   <= 100)
    $f$, t);
    execute format(
      'grant insert (from_page, from_site, utm_source, utm_medium, utm_campaign) on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Every signup and enquiry in a window, with where it came from. Signups
-- carry the same five values in the account's metadata, written at signup.
-- ---------------------------------------------------------------------------
create or replace function public.platform_attribution(days int default 90)
returns table (
  kind           text,
  happened_at    timestamptz,
  from_page  text,
  from_site text,
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  has_church     boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_platform_viewer() then
    raise exception 'Not permitted.' using errcode = '42501';
  end if;

  return query
  select
    'signup'::text,
    u.created_at,
    u.raw_user_meta_data ->> 'from_page',
    u.raw_user_meta_data ->> 'from_site',
    u.raw_user_meta_data ->> 'utm_source',
    u.raw_user_meta_data ->> 'utm_medium',
    u.raw_user_meta_data ->> 'utm_campaign',
    exists (select 1 from public.organization_members om where om.profile_id = u.id)
  from auth.users u
  where u.created_at > now() - make_interval(days => days)
    and lower(u.email) not like '%@example.com'
  union all
  select
    'enquiry'::text,
    c.created_at at time zone 'UTC',
    c.from_page, c.from_site, c.utm_source, c.utm_medium, c.utm_campaign,
    null::boolean
  from public.contact_requests c
  where c.created_at at time zone 'UTC' > now() - make_interval(days => days)
    and not c.spam;
end;
$$;

revoke all on function public.platform_attribution(int) from public, anon;
grant execute on function public.platform_attribution(int) to authenticated;
