-- ============================================================================
-- 0034  Remember which way a church chose to pay an invoice
-- ============================================================================
--
-- The Pay button said "mobile money or card" and opened one Paystack page
-- carrying both, which is not a choice, it is a screen a treasurer has to
-- work out. Churches ask for the method by name: Visa, MoMo, or a bank
-- transfer against a cheque.
--
-- The link is stored on the invoice and reused, so that pressing Pay twice
-- does not open two transactions for the same quarter. That reuse is why
-- the method has to be remembered: a church that opened a card page and
-- then wanted MoMo would otherwise be handed the card page again forever,
-- because the stored link only carries the channel it was created with.
--
-- Bank and cheque never gets a Paystack link at all. It is settled off the
-- gateway, so the column records the intent and the invoice waits.

alter table public.invoices
  add column if not exists payment_method text
    check (payment_method in ('momo', 'card', 'bank'));

comment on column public.invoices.payment_method is
  'Which way the church chose to pay. Decides the Paystack channel, and whether a stored payment link can be reused or has to be raised again.';
