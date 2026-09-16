-- ============================================================================
-- 0040  Totals that are the real total
-- ============================================================================
--
-- The contributions page loaded fifty rows and then summed those fifty into
-- a card labelled "Total". A church recording more than fifty gifts was
-- shown a confident figure that was simply wrong, and a treasurer has no
-- way to tell a truncated total from a complete one by looking at it.
--
-- The fix is not a bigger limit. A bigger limit is the same bug further
-- away. The sum belongs in the database, over every row, while the page
-- goes on showing a recent handful.
--
-- SECURITY INVOKER, so row level security still decides what may be summed:
-- a class leader calling this gets zero, exactly as they get zero rows.
-- Never make it DEFINER to "make the numbers work".

create or replace function public.contribution_totals(org_id uuid)
returns table (
  entries      bigint,
  total        numeric,
  tithe_total  numeric
)
language sql
stable
as $$
  select
    count(*),
    coalesce(sum(c.amount), 0),
    coalesce(sum(c.amount) filter (where c.type = 'tithe'), 0)
  from public.contributions c
  where c.organization_id = org_id;
$$;

revoke all on function public.contribution_totals(uuid) from public;
revoke all on function public.contribution_totals(uuid) from anon;
grant execute on function public.contribution_totals(uuid) to authenticated;
