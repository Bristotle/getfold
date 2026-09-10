-- ============================================================================
-- 0029  Grant read on invoices
-- ============================================================================
--
-- A consequence of 0019, and a correct one that still needs following
-- through. That migration revoked the default privileges which used to hand
-- anon and authenticated full DML on every new table in public. So tables
-- created afterwards get NO grants at all, and invoices was the first.
--
-- The billing page would have shown nothing to anybody: RLS was right, but
-- there was no privilege for the policy to filter. Caught by a test.
--
-- SELECT only, and only to authenticated. There is deliberately no insert,
-- update or delete: an invoice is raised by us, paid through the gateway
-- and marked paid by the webhook. Nobody inside a church should be able to
-- change what they owe, and the absence of a grant is a stronger guarantee
-- of that than the absence of a policy.

grant select on public.invoices to authenticated;
