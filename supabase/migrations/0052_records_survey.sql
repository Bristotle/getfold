-- ============================================================================
-- 0052  An anonymous survey of how churches keep their records
-- ============================================================================
--
-- Original data, the kind other sites have to link to rather than copy.
-- See src/lib/survey.ts for why it is a survey and not Fold's own usage.
--
-- Anyone may answer, through the anon insert policy. Nobody may read a
-- single response through the API, not even Fold staff: the only way out
-- is survey_results(), which returns counts per answer and returns nothing
-- but the total until at least 30 have answered. The email address, kept
-- only for people who ask for the results, never leaves this table by any
-- function.

create table if not exists public.survey_responses (
  id         uuid primary key default gen_random_uuid(),
  survey     text not null check (survey ~ '^[a-z0-9-]{3,60}$'),
  answers    jsonb not null check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) < 4000),
  email      text check (email is null or (char_length(email) <= 200 and email like '%@%')),
  from_page  text check (char_length(from_page) <= 300),
  from_site  text check (char_length(from_site) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists survey_responses_survey_idx on public.survey_responses (survey);

alter table public.survey_responses enable row level security;

drop policy if exists "survey: anyone may answer" on public.survey_responses;
create policy "survey: anyone may answer"
  on public.survey_responses for insert
  to anon, authenticated
  with check (true);

grant insert (survey, answers, email, from_page, from_site) on public.survey_responses to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Counts per question and answer, for one survey. Public, because the
-- results are meant to be published, but only once there are enough of
-- them to mean something and to hide any one church inside the total.
-- ---------------------------------------------------------------------------
create or replace function public.survey_results(survey_slug text, min_responses int default 30)
returns table (question text, answer text, n bigint, total bigint)
language sql
stable
security definer
set search_path = public
as $$
  with total as (
    select count(*) as t from public.survey_responses where survey = survey_slug
  )
  select null::text, null::text, null::bigint, total.t
    from total
  union all
  select kv.key, kv.value, count(*), total.t
    from public.survey_responses r
    cross join lateral jsonb_each_text(r.answers) kv
    cross join total
   where r.survey = survey_slug
     and total.t >= greatest(min_responses, 30)
   group by kv.key, kv.value, total.t;
$$;

revoke all on function public.survey_results(text, int) from public;
grant execute on function public.survey_results(text, int) to anon, authenticated;
