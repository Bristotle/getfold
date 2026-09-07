-- Fold, enquiries from the public site. Apply SIXTEENTH.
--
-- A public form means anon must be able to INSERT. The risk that creates is
-- enumeration: a table the world can write to must not be a table the world
-- can read. So there is an insert policy and no select policy at all, which
-- under RLS means nobody reads it through the API. The service role, which
-- bypasses RLS, is how these are actually looked at.

alter table public.contact_requests enable row level security;

drop policy if exists "contact: anyone may enquire" on public.contact_requests;

create policy "contact: anyone may enquire"
  on public.contact_requests for insert
  to anon, authenticated
  with check (
    -- Cheap sanity limits, enforced here so they hold no matter which
    -- client posts. Anything longer is a bot pasting, not a pastor typing.
    char_length(name) between 1 and 120
    and char_length(email) between 3 and 200
    and email like '%@%'
    and coalesce(char_length(message), 0) <= 4000
    and coalesce(char_length(church), 0) <= 200
    and coalesce(char_length(phone), 0) <= 40
  );

-- No select, update or delete policy on purpose. Read them with the service
-- role, or from the Supabase dashboard.
