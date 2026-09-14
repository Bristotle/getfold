-- ============================================================================
-- 0036  Hold a message until a sensible moment
-- ============================================================================
--
-- The thank you for a gift went out the instant the webhook confirmed it,
-- which sounded right and is not. In the same half minute the member has
-- already had two texts from MTN: the code to approve the payment, and then
-- MTN's own debit alert. A third arriving on top of those is noise, and it
-- lands while the person is still looking at a screen about money leaving
-- their account.
--
-- A few minutes later it arrives on its own, after the transaction has
-- settled in the member's mind, and reads as the church acknowledging the
-- gift rather than as part of the machinery.
--
-- So a notification now carries the earliest time it may be sent. Existing
-- rows default to now(), which means send at the next opportunity, exactly
-- as they behave today.

alter table public.notifications
  add column if not exists send_after timestamptz not null default now();

comment on column public.notifications.send_after is
  'Earliest time this may be delivered. A sender must skip rows in the future.';

-- The flush job asks one question: what is due and not yet sent. This is
-- that question as an index.
create index if not exists notifications_due_idx
  on public.notifications (send_after)
  where status in ('queued', 'no_provider');
