-- ============================================================================
-- 0039  Keep the sales pitches out of the way
-- ============================================================================
--
-- Every enquiry this site has received has been a cold pitch: Instagram
-- followers, a promotional video, SEO rankings, and a template addressed to
-- "the http://getfold.org/xxx Owner". Before a real church writes in and is
-- lost among them, they need separating.
--
-- Quarantine, never rejection. A wrongly binned pitch costs nothing; a
-- wrongly binned church costs a customer and nobody would ever find out. So
-- the row is always saved and always readable, and the only consequence of
-- being scored as spam is that the alerts do not go out.

alter table public.contact_requests
  add column if not exists spam boolean not null default false,
  add column if not exists spam_score integer,
  add column if not exists spam_reasons text;

comment on column public.contact_requests.spam is
  'Scored as a cold sales pitch. The row is kept and readable; only the alerts were held back.';
comment on column public.contact_requests.spam_reasons is
  'Why it was scored that way, in plain words, so a wrong call can be seen and the rules corrected.';

create index if not exists contact_requests_real_idx
  on public.contact_requests (created_at desc) where not spam;
