-- ============================================================================
-- 0047  A church writes its own reminder
-- ============================================================================
--
-- The first church to use meeting reminders wanted its own voice: "Hello
-- brethren in Christ, this is a simple reminder to join our prayer session
-- in the next 30 minutes..." rather than our plain "starts in 30 minutes".
-- A reminder that sounds like the church is read; one that sounds like a
-- system is ignored.
--
-- Null means use Fold's wording. The join link is never part of this text:
-- it is always added underneath, so no church can save a reminder that
-- forgets to say where to join.
--
-- Capped at 480 characters. That is three texts per member per meeting,
-- which a church can choose to spend, and it keeps the WhatsApp template
-- well inside Meta's 1024 character limit for the whole message.

alter table public.meetings
  add column if not exists message text
  check (message is null or length(message) between 1 and 480);

comment on column public.meetings.message is
  'The church''s own reminder wording, with {name} {church} {meeting} {minutes}. Null uses Fold''s. The link is always appended.';
