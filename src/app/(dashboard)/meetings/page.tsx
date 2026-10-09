import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardLabel, CardStat } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { providerStatus, whatsappStatus } from "@/lib/messaging";
import { WEEKDAYS, describeSchedule, whatsappShareUrl } from "@/lib/meetings";
import {
  createMeeting,
  updateMeeting,
  setMeetingEnabled,
  deleteMeeting,
} from "./actions";

type Meeting = {
  id: string;
  title: string;
  weekdays: number[];
  starts_at: string;
  join_url: string;
  remind_minutes: number;
  enabled: boolean;
  last_reminded_for: string | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const REMIND_CHOICES = [
  [10, "10 minutes before"],
  [15, "15 minutes before"],
  [30, "30 minutes before"],
  [60, "1 hour before"],
  [120, "2 hours before"],
] as const;

function MeetingFields({ meeting }: { meeting?: Meeting }) {
  return (
    <>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-medium text-foreground">Meeting</span>
        <input
          name="title"
          required
          maxLength={80}
          defaultValue={meeting?.title}
          placeholder="e.g. Tuesday Prayer Meeting"
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <span className="text-xs font-medium text-foreground">
          Link to join
        </span>
        <input
          name="joinUrl"
          type="url"
          required
          defaultValue={meeting?.join_url}
          placeholder="https://meet.google.com/abc-defg-hij"
          className={`${inputClass} font-numeric`}
        />
      </label>
      <fieldset className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
        <legend className="mb-1.5 text-xs font-medium text-foreground">
          Days
        </legend>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day, i) => (
            <label
              key={day}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface-soft px-2.5 py-1.5 text-xs text-foreground"
            >
              <input
                type="checkbox"
                name="weekday"
                value={i}
                defaultChecked={meeting?.weekdays.includes(i)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              {day.slice(0, 3)}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Starts at</span>
        <input
          name="startsAt"
          type="time"
          required
          defaultValue={meeting?.starts_at.slice(0, 5) ?? "19:00"}
          className={`${inputClass} font-numeric`}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Remind</span>
        <select
          name="remindMinutes"
          defaultValue={meeting?.remind_minutes ?? 30}
          className={inputClass}
        >
          {REMIND_CHOICES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; edit?: string }>;
}) {
  const { error, message, edit } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "people.write")) redirect("/dashboard");

  const canManage = can(membership.role, "org.manage");
  const whatsapp = whatsappStatus();
  const sms = providerStatus();

  const supabase = await createClient();
  const [{ data, error: loadError }, withPhone, agreed] = await Promise.all([
    supabase
      .from("meetings")
      .select(
        "id, title, weekdays, starts_at, join_url, remind_minutes, enabled, last_reminded_for"
      )
      .order("created_at"),
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .not("phone", "is", null),
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .not("phone", "is", null)
      .eq("whatsapp_opt_in", true),
  ]);

  const meetings = (data ?? []) as Meeting[];
  const reachable = withPhone.count ?? 0;
  const onWhatsApp = agreed.count ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Meeting reminders
        </h1>
        <p className="text-sm text-muted-foreground">
          For a prayer meeting, Bible study or service held online. Shortly
          before it starts, every active member with a phone number gets the
          link to join: on WhatsApp if they have agreed to it, by text if
          not.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success-text">
          {message}
        </p>
      )}
      {loadError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
          Could not load meetings: {loadError.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="min-w-0">
          <CardLabel>Members with a phone</CardLabel>
          <CardStat>{reachable}</CardStat>
        </Card>
        <Card className="min-w-0">
          <CardLabel>Agreed to WhatsApp</CardLabel>
          <CardStat>{onWhatsApp}</CardStat>
        </Card>
        <Card className="col-span-2 min-w-0 sm:col-span-1">
          <CardLabel>Sent by</CardLabel>
          <p className="mt-1 text-sm text-foreground">
            {whatsapp.configured
              ? sms.configured
                ? "WhatsApp, and text for everyone else"
                : "WhatsApp only. No text provider is connected."
              : sms.configured
                ? "Text. WhatsApp is not connected yet."
                : "Nothing is connected yet. Reminders are recorded but not sent."}
          </p>
        </Card>
      </div>

      <p className="rounded-lg border border-border bg-surface-soft px-3 py-2 text-xs text-muted-foreground">
        <strong className="text-foreground">
          WhatsApp needs each member&rsquo;s agreement.
        </strong>{" "}
        WhatsApp only lets a business message somebody who has agreed to it.
        Ask in your group, then tick &ldquo;Agreed to WhatsApp
        messages&rdquo; on each member, or add a WhatsApp column saying Yes
        when you{" "}
        <Link href="/members" className="font-medium text-primary underline">
          import your members
        </Link>
        . Everybody else is reminded by text, so nobody is left out.
      </p>

      {canManage && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">Add a meeting</h2>
          <form
            action={createMeeting}
            className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <MeetingFields />
            <div className="flex items-end sm:col-span-2">
              <SubmitButton className="w-full sm:w-auto">
                Save meeting
              </SubmitButton>
            </div>
          </form>
        </Card>
      )}

      {meetings.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            No meetings yet.{" "}
            {canManage
              ? "Add one above and the first reminder goes out before its next start."
              : "The pastor or an administrator can add one."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {meetings.map((m) =>
            canManage && edit === m.id ? (
              <Card key={m.id} className="min-w-0">
                <form action={updateMeeting} className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={m.id} />
                  <MeetingFields meeting={m} />
                  <div className="flex gap-2 sm:col-span-2">
                    <SubmitButton size="sm">Save</SubmitButton>
                    <Link
                      href="/meetings"
                      className="inline-flex h-9 items-center px-3 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              </Card>
            ) : (
              <Card key={m.id} className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground">
                      {m.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {describeSchedule(m.weekdays, m.starts_at)}, reminded{" "}
                      {m.remind_minutes >= 60
                        ? `${m.remind_minutes / 60} hour${m.remind_minutes === 60 ? "" : "s"}`
                        : `${m.remind_minutes} minutes`}{" "}
                      before
                    </p>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded px-2 py-1 text-xs font-semibold ${
                      m.enabled
                        ? "bg-success/10 text-success-text"
                        : "bg-surface-soft text-muted-foreground"
                    }`}
                  >
                    {m.enabled ? "On" : "Paused"}
                  </span>
                </div>
                <a
                  href={m.join_url}
                  className="mt-3 block truncate font-numeric text-sm text-primary underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {m.join_url}
                </a>
                <a
                  href={whatsappShareUrl(
                    membership.organization.name,
                    m.title,
                    m.weekdays,
                    m.starts_at,
                    m.join_url
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-semibold text-foreground hover:bg-surface-soft"
                >
                  Post the link on WhatsApp
                </a>
                {canManage && (
                  <div className="mt-4 flex flex-wrap items-center gap-1">
                    <Link
                      href={`/meetings?edit=${m.id}`}
                      className="inline-flex h-9 items-center rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-surface-soft hover:text-foreground"
                    >
                      Edit
                    </Link>
                    <form action={setMeetingEnabled}>
                      <input type="hidden" name="id" value={m.id} />
                      <input
                        type="hidden"
                        name="enabled"
                        value={m.enabled ? "false" : "true"}
                      />
                      <Button type="submit" variant="quiet" size="xs">
                        {m.enabled ? "Pause reminders" : "Turn reminders on"}
                      </Button>
                    </form>
                    <form action={deleteMeeting}>
                      <input type="hidden" name="id" value={m.id} />
                      <Button type="submit" variant="destructive" size="xs">
                        Remove
                      </Button>
                    </form>
                  </div>
                )}
              </Card>
            )
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Times are your church&rsquo;s local time. Reminders go out within five
        minutes of the time you choose, and every one sent is listed on the{" "}
        <Link href="/messages" className="font-medium text-primary underline">
          Messages
        </Link>{" "}
        page.
      </p>
    </div>
  );
}
