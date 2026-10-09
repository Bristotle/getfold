-- ============================================================================
-- 0045  Remind members before a meeting, by WhatsApp or by text
-- ============================================================================
--
-- Runs after 0044, which adds the 'meeting_reminder' enum value.
--
-- Asked for by a church whose congregation is a WhatsApp prayer group. It
-- meets online at the same times every week, and people forget. Thirty
-- minutes before, every member should get the link to join.
--
-- Four pieces:
--
--   1. meetings: when a church meets and where to join. A weekly pattern
--      rather than a calendar, because a prayer meeting is "Tuesdays and
--      Fridays at 7pm", not a list of dates somebody has to keep adding.
--   2. members.whatsapp_opt_in: WhatsApp's rules require that a person
--      agreed to hear from a business there before it messages them. The
--      church records that agreement; without it the reminder goes by text.
--   3. notifications.params and provider_message_id: what a WhatsApp
--      template needs filled in, and the id Meta returns so a later
--      delivery failure can be matched to its row.
--   4. Two service role functions: which reminders are due now, and a
--      STOP reply switching WhatsApp off for that number.

-- ---------------------------------------------------------------------------
-- 1. Meetings
-- ---------------------------------------------------------------------------
create table if not exists public.meetings (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title           text not null check (length(trim(title)) between 1 and 80),
  -- 0 is Sunday, matching extract(dow).
  weekdays        smallint[] not null
                  check (cardinality(weekdays) > 0
                         and weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  -- Local time in the church's own timezone, organizations.timezone.
  -- Whole seconds, so an occurrence read out and written back into
  -- last_reminded_for compares equal. With microseconds it came back a
  -- fraction earlier and the same meeting was due again.
  starts_at       time(0) not null,
  -- https only. The link goes out under Fold's WhatsApp number, so a
  -- javascript: or plain http link must never be storable.
  join_url        text not null check (join_url ~ '^https://[^\s]+$' and length(join_url) <= 300),
  remind_minutes  int not null default 30 check (remind_minutes between 5 and 720),
  enabled         boolean not null default true,
  -- The occurrence most recently reminded, so a meeting is never reminded
  -- twice however often the job runs.
  last_reminded_for timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists meetings_org_idx on public.meetings (organization_id);

alter table public.meetings enable row level security;

drop policy if exists "meetings: org-mates read"    on public.meetings;
drop policy if exists "meetings: leadership insert" on public.meetings;
drop policy if exists "meetings: leadership update" on public.meetings;
drop policy if exists "meetings: leadership delete" on public.meetings;

create policy "meetings: org-mates read"
  on public.meetings for select
  using (public.is_org_member(organization_id));

-- org.manage in permissions.ts. Deciding the whole congregation will be
-- messaged twice a week is a leadership decision, like the automatic
-- message switches.
create policy "meetings: leadership insert"
  on public.meetings for insert
  with check (public.org_role(organization_id) in ('super_admin','pastor','admin'));

create policy "meetings: leadership update"
  on public.meetings for update
  using (public.org_role(organization_id) in ('super_admin','pastor','admin'));

create policy "meetings: leadership delete"
  on public.meetings for delete
  using (public.org_role(organization_id) in ('super_admin','pastor','admin'));

-- 0019 revoked the default grants, so without these RLS has nothing to
-- filter and the page shows nothing to anybody.
grant select, insert, update, delete on public.meetings to authenticated;
grant all on public.meetings to service_role;

drop trigger if exists meetings_read_only on public.meetings;
create trigger meetings_read_only
  before insert or update or delete on public.meetings
  for each row execute function public.refuse_if_read_only();

-- ---------------------------------------------------------------------------
-- 2. Agreement to WhatsApp messages
-- ---------------------------------------------------------------------------
alter table public.members
  add column if not exists whatsapp_opt_in    boolean not null default false,
  add column if not exists whatsapp_opt_in_at timestamptz;

comment on column public.members.whatsapp_opt_in is
  'The member agreed to receive messages on WhatsApp. Required by WhatsApp before a business may message them.';

-- The time is stamped by the database, not the form, so it records when
-- the agreement was actually recorded and cannot be backdated.
create or replace function public.stamp_whatsapp_opt_in()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.whatsapp_opt_in then
    if tg_op = 'INSERT' or not old.whatsapp_opt_in then
      new.whatsapp_opt_in_at := now();
    end if;
  else
    new.whatsapp_opt_in_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists members_stamp_whatsapp_opt_in on public.members;
create trigger members_stamp_whatsapp_opt_in
  before insert or update of whatsapp_opt_in on public.members
  for each row execute function public.stamp_whatsapp_opt_in();

-- ---------------------------------------------------------------------------
-- 3. What a WhatsApp template needs, and Meta's id for the message
-- ---------------------------------------------------------------------------
alter table public.notifications
  add column if not exists params jsonb,
  add column if not exists provider_message_id text;

comment on column public.notifications.params is
  'Values a provider template is filled with, kept so a failed WhatsApp message can be resent as a text.';

create unique index if not exists notifications_provider_message_idx
  on public.notifications (provider_message_id)
  where provider_message_id is not null;

-- ---------------------------------------------------------------------------
-- 4a. Which reminders are due now.
--
-- Looks at today and tomorrow in each church's own timezone, so a meeting
-- at ten past midnight is still reminded the evening before. A reminder is
-- due once its time has come and the meeting has not yet started: a
-- meeting added at 6.45 for 7pm is reminded straight away, and one whose
-- start has passed is never reminded late.
--
-- Read only churches are skipped. Service role only, because the sender
-- reads across every church with no user session.
-- ---------------------------------------------------------------------------
create or replace function public.due_meeting_reminders()
returns table (
  meeting_id        uuid,
  organization_id   uuid,
  organization_name text,
  title             text,
  join_url          text,
  remind_minutes    int,
  occurs_at         timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select m.id, o.id, o.name, m.title, m.join_url, m.remind_minutes, occ.at
  from public.meetings m
  join public.organizations o on o.id = m.organization_id
  cross join lateral (
    select
      ((((now() at time zone o.timezone)::date + d) + m.starts_at) at time zone o.timezone) as at,
      extract(dow from ((now() at time zone o.timezone)::date + d))::int as dow
    from generate_series(0, 1) as d
  ) occ
  where m.enabled
    and o.subscription_status <> 'expired'
    and occ.dow = any (m.weekdays)
    and occ.at > now()
    and occ.at - make_interval(mins => m.remind_minutes) <= now()
    and (m.last_reminded_for is null or m.last_reminded_for < occ.at);
$$;

revoke all on function public.due_meeting_reminders() from public;
revoke all on function public.due_meeting_reminders() from anon;
revoke all on function public.due_meeting_reminders() from authenticated;
grant execute on function public.due_meeting_reminders() to service_role;

-- ---------------------------------------------------------------------------
-- 4b. A STOP reply.
--
-- Every church's reminders come from the one Fold number, so a member who
-- replies STOP cannot say which church they mean. They are switched off
-- everywhere their number appears, which is the only reading that honours
-- the request.
--
-- Numbers are stored as typed ("0244 000 000"), so they are matched on
-- their last nine digits, which is the Ghanaian subscriber number whatever
-- prefix it was written with.
--
-- Sets the lifecycle bypass so a STOP is honoured even for a church that is
-- read only. Refusing somebody's opt out because their church has not paid
-- would be absurd.
-- ---------------------------------------------------------------------------
create or replace function public.whatsapp_opt_out(phone text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  tail text := right(regexp_replace(phone, '\D', '', 'g'), 9);
  n    int;
begin
  if length(tail) < 9 then
    return 0;
  end if;

  perform set_config('fold.lifecycle', 'on', true);

  update public.members
     set whatsapp_opt_in = false
   where whatsapp_opt_in
     and right(regexp_replace(coalesce(members.phone, ''), '\D', '', 'g'), 9) = tail;

  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.whatsapp_opt_out(text) from public;
revoke all on function public.whatsapp_opt_out(text) from anon;
revoke all on function public.whatsapp_opt_out(text) from authenticated;
grant execute on function public.whatsapp_opt_out(text) to service_role;
