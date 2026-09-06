-- Fold — keep funds.current_amount honest. Apply FIFTH.
--
-- `funds.current_amount` duplicates information already in `contributions`
-- (sum of amounts where fund_id = the fund). Denormalised totals drift the
-- moment anything writes without remembering to update them — a correction,
-- a deletion, a contribution moved between funds, a future import script.
--
-- So the total is never written by application code. This trigger recomputes
-- it from the contributions themselves on every insert, update and delete,
-- which means it is correct by construction rather than by discipline.
--
-- SECURITY DEFINER because the caller's RLS grants let them write their own
-- contributions but not necessarily UPDATE the funds row. The fund id is
-- taken from the contribution row itself, which RLS has already authorised,
-- so this cannot be used to touch another church's fund.

create or replace function public.sync_fund_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- On UPDATE the contribution may have MOVED between funds, so the old
  -- fund needs recomputing too, not just the new one.
  if tg_op in ('UPDATE', 'DELETE') and old.fund_id is not null then
    update public.funds f
       set current_amount = coalesce(
             (select sum(c.amount) from public.contributions c where c.fund_id = f.id), 0)
     where f.id = old.fund_id;
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.fund_id is not null then
    update public.funds f
       set current_amount = coalesce(
             (select sum(c.amount) from public.contributions c where c.fund_id = f.id), 0)
     where f.id = new.fund_id;
  end if;

  return null;
end;
$$;

drop trigger if exists contributions_sync_fund on public.contributions;
create trigger contributions_sync_fund
  after insert or update or delete on public.contributions
  for each row execute function public.sync_fund_total();

-- Backfill anything that already exists.
update public.funds f
   set current_amount = coalesce(
         (select sum(c.amount) from public.contributions c where c.fund_id = f.id), 0);
