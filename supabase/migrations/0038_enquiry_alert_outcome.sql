-- ============================================================================
-- 0038  Did anybody actually get told?
-- ============================================================================
--
-- An enquiry arrived, the SMS alert went out, and the email did not. Nobody
-- could say why, because nothing recorded the attempt: sendEmail returned a
-- boolean that the caller ignored, and a failure looked exactly like a
-- success from every angle afterwards.
--
-- That is the wrong shape for the one feature whose entire job is "do not
-- miss a customer". The row now carries what happened to its own alert, so
-- the answer to "why did I not hear about this one" is on the record rather
-- than in somebody's memory of what the inbox looked like.

alter table public.contact_requests
  add column if not exists alerted_at timestamptz,
  add column if not exists alert_error text;

comment on column public.contact_requests.alerted_at is
  'When the email alert was accepted by the provider. Null means it was not.';
comment on column public.contact_requests.alert_error is
  'Why the email alert failed, if it did. Null when it succeeded or was never attempted.';
