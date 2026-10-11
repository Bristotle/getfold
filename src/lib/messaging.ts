import "server-only";

/**
 * Outbound messaging.
 *
 * Two things are kept apart on purpose:
 *
 *   1. WHAT we say and to whom, templates and phone formatting. This is
 *      church logic and does not change with the provider.
 *   2. HOW it leaves the building, one `deliver()` function behind an env
 *      var. Ghana has no SMS provider on the Vercel Marketplace, so this
 *      will be Arkesel, Hubtel, mNotify or Twilio depending on what you
 *      sign up for. Swapping means editing one function, not the app.
 *
 * Until a provider is configured, nothing is faked: messages are stored
 * with status `no_provider` so the church can see exactly what would have
 * gone out, and they can be sent later once keys exist.
 */

export type SmsProvider = "arkesel" | "hubtel" | "twilio";

export function providerStatus(): {
  configured: boolean;
  provider: SmsProvider | null;
  missing: string[];
} {
  const provider = process.env.SMS_PROVIDER as SmsProvider | undefined;
  if (!provider) {
    return { configured: false, provider: null, missing: ["SMS_PROVIDER"] };
  }

  const needed: Record<SmsProvider, string[]> = {
    arkesel: ["ARKESEL_API_KEY", "SMS_SENDER_ID"],
    hubtel: ["HUBTEL_CLIENT_ID", "HUBTEL_CLIENT_SECRET", "SMS_SENDER_ID"],
    twilio: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"],
  };

  const missing = (needed[provider] ?? []).filter((k) => !process.env[k]);
  return { configured: missing.length === 0, provider, missing };
}

/**
 * Ghanaian numbers are written locally ("0244 000 000") but every provider
 * wants E.164. Returns null when there is nothing usable, so the caller can
 * skip rather than queue a message that can never be delivered.
 */
export function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) return digits.length >= 12 ? digits : null;
  // 0244000000 -> +233244000000
  if (digits.startsWith("0") && digits.length === 10) {
    return `+233${digits.slice(1)}`;
  }
  // 233244000000
  if (digits.startsWith("233") && digits.length === 12) return `+${digits}`;
  // 244000000 (leading zero dropped)
  if (digits.length === 9) return `+233${digits}`;

  return null;
}

export const cedis = (n: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    // "GHS 250.50", as the site writes money everywhere, not the cedi sign.
    currencyDisplay: "code",
    minimumFractionDigits: 2,
  }).format(n);

/**
 * Templates.
 *
 * Kept short because SMS is billed per 160-character segment and these go
 * to whole congregations, a stray sentence is a real recurring cost. Each
 * one names the church, because a number the member doesn't recognise
 * otherwise reads as spam.
 */
export const templates = {
  welcome: (churchName: string, memberName: string) =>
    `Akwaaba ${memberName}! You have been added to the register at ${churchName}. We are glad to have you with us.`,

  contributionReceipt: (
    churchName: string,
    memberName: string,
    amount: number,
    kind: string
  ) =>
    `${churchName}: received your ${kind} of ${cedis(amount)}. Thank you, ${memberName}. God bless you.`,

  birthday: (churchName: string, memberName: string) =>
    `Happy birthday ${memberName}! Everyone at ${churchName} is thanking God for your life today. May this year bring you joy and good health.`,

  absenceFollowUp: (churchName: string, memberName: string) =>
    `Hello ${memberName}, we have missed you at ${churchName} recently and wanted to check that all is well. You are welcome any time.`,

  // The church's own words where it wrote some, and the link always last,
  // on its own line, so it is the thing a thumb lands on.
  meetingReminder: (r: MeetingReminder) =>
    `${reminderMessage(r)}\n\nJoin here: ${r.url}`,
};

// ---------------------------------------------------------------------------
// WhatsApp
// ---------------------------------------------------------------------------

/**
 * What a meeting reminder is filled in with. Stored on the notification as
 * `params`, so a WhatsApp message that fails can be resent as a text, and
 * so a reminder that sat in the queue past the start is never sent late.
 */
export type MeetingReminder = {
  name: string;
  title: string;
  church: string;
  minutes: number;
  url: string;
  /** ISO time the meeting starts. Nothing is sent after it. */
  startsAt: string;
  /**
   * The church's reminder, already filled in, without the link. Absent on
   * reminders queued before churches could write their own.
   */
  message?: string;
};

/** Fold's wording, until a church writes its own. */
export const DEFAULT_MEETING_MESSAGE =
  "{church}: {meeting} starts in {minutes} minutes.";

/** What a church may put in its reminder, and what each becomes. */
export const MEETING_PLACEHOLDERS = {
  name: "the member's first name",
  church: "your church's name",
  meeting: "the meeting's name",
  minutes: "how many minutes until it starts",
} as const;

/**
 * Fills a church's reminder in.
 *
 * A placeholder we do not recognise is removed rather than sent, because
 * "{nmae}" arriving on a member's phone is worse than a clipped sentence.
 * {link} is removed too: the link is always added underneath, and a church
 * that also wrote it into the text would send it twice.
 */
export function renderMeetingMessage(
  template: string | null | undefined,
  v: { name: string; church: string; meeting: string; minutes: number }
): string {
  return (template?.trim() || DEFAULT_MEETING_MESSAGE)
    .replace(/\{name\}/gi, v.name.split(/\s+/)[0] || "friend")
    .replace(/\{church\}/gi, v.church)
    .replace(/\{meeting\}/gi, v.meeting)
    .replace(/\{minutes\}/gi, String(v.minutes))
    .replace(/\{[^}]*\}/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function reminderMessage(r: MeetingReminder) {
  return (
    r.message ??
    renderMeetingMessage(null, {
      name: r.name,
      church: r.church,
      meeting: r.title,
      minutes: r.minutes,
    })
  );
}

/**
 * Every church's reminders go out from one Fold number on the WhatsApp
 * Business Platform, called directly on Meta's Cloud API.
 *
 * A business may only start a WhatsApp conversation with a template Meta
 * has approved, so the wording is not ours to vary per church. It lives in
 * Meta's WhatsApp Manager under WHATSAPP_TEMPLATE_MEETING, and
 * `meetingReminderWhatsAppText` below must say exactly what that template
 * says, because it is what the Messages page shows the church was sent.
 */
export function whatsappStatus(): { configured: boolean; missing: string[] } {
  const missing = ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"].filter(
    (k) => !process.env[k]
  );
  return { configured: missing.length === 0, missing };
}

/**
 * The approved template, word for word, with {{1}} to {{5}} filled in.
 *
 * Meta rejects a template that begins or ends on a variable, which is one
 * reason the STOP line is last. The other is that it is the member's way
 * out, and WhatsApp expects every business to offer one.
 */
export const WHATSAPP_MEETING_TEMPLATE =
  "Hello {{1}}, a reminder from {{2}}:\n\n{{3}}\n\nJoin here: {{4}}\n\nReply STOP to stop these reminders.";

function meetingReminderValues(r: MeetingReminder): string[] {
  return [
    r.name.split(/\s+/)[0] || "friend",
    r.church,
    reminderMessage(r),
    r.url,
  ].map(
    // Meta refuses a parameter containing a newline, a tab or more than
    // four spaces in a row, and fails the whole message for it.
    (v) => v.replace(/[\n\t]+/g, " ").replace(/ {2,}/g, " ").trim()
  );
}

export function meetingReminderWhatsAppText(r: MeetingReminder): string {
  const values = meetingReminderValues(r);
  return WHATSAPP_MEETING_TEMPLATE.replace(
    /\{\{(\d)\}\}/g,
    (_, i: string) => values[Number(i) - 1] ?? ""
  );
}

function graphUrl(path: string) {
  const version = process.env.WHATSAPP_API_VERSION || "v23.0";
  return `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/${path}`;
}

async function postWhatsApp(
  payload: Record<string, unknown>
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  const status = whatsappStatus();
  if (!status.configured) {
    return {
      ok: false,
      error: `WhatsApp is not connected (missing ${status.missing.join(", ")})`,
    };
  }

  try {
    const res = await fetch(graphUrl("messages"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
    });
    const json = (await res.json().catch(() => null)) as {
      messages?: { id?: string }[];
      error?: { message?: string; code?: number };
    } | null;

    if (!res.ok) {
      const e = json?.error;
      return {
        ok: false,
        error: `WhatsApp: ${e?.message ?? `HTTP ${res.status}`}${e?.code ? ` (${e.code})` : ""}`,
      };
    }
    return { ok: true, messageId: json?.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Sends a meeting reminder by WhatsApp.
 *
 * "ok" means Meta accepted it, not that it arrived. A number that is not
 * on WhatsApp is accepted here and fails a few seconds later, which the
 * webhook at /api/whatsapp/webhook hears about and answers with a text.
 */
export function deliverWhatsAppReminder(to: string, r: MeetingReminder) {
  return postWhatsApp({
    // Meta wants the number without the plus.
    to: to.replace(/^\+/, ""),
    type: "template",
    template: {
      name: process.env.WHATSAPP_TEMPLATE_MEETING || "meeting_reminder",
      language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en" },
      components: [
        {
          type: "body",
          parameters: meetingReminderValues(r).map((text) => ({
            type: "text",
            text,
          })),
        },
      ],
    },
  });
}

/**
 * A plain reply. Only allowed within 24 hours of the member writing to us,
 * which is exactly when it is used: confirming a STOP.
 */
export function replyOnWhatsApp(to: string, body: string) {
  return postWhatsApp({
    to: to.replace(/^\+/, ""),
    type: "text",
    text: { body },
  });
}

/**
 * Hands one message to the configured provider.
 *
 * Returns a result rather than throwing: a failed send must still be
 * recorded against the notification row, never swallowed.
 */
export async function deliver(
  to: string,
  body: string,
  /**
   * The church's own sender name, so a member sees "SHEKINAH" rather than
   * the platform's. Falls back to SMS_SENDER_ID when a church has not set
   * one.
   *
   * Eleven characters maximum, by the GSM standard rather than by anyone's
   * choice, and it has to be approved by the provider before anything
   * actually arrives.
   */
  senderId?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const status = providerStatus();
  if (!status.configured || !status.provider) {
    return {
      ok: false,
      error: `No SMS provider configured (missing ${status.missing.join(", ")})`,
    };
  }

  const sender = (senderId?.trim() || process.env.SMS_SENDER_ID) ?? undefined;

  try {
    switch (status.provider) {
      case "arkesel": {
        const res = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
          method: "POST",
          headers: {
            "api-key": process.env.ARKESEL_API_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender,
            message: body,
            // Sent in full E.164 form, plus included, matching Arkesel's
            // documented example. Their v1 URL API took a bare number, which
            // is why stripping the plus looks plausible and is wrong here.
            recipients: [to],
          }),
        });
        if (!res.ok) return { ok: false, error: `Arkesel: HTTP ${res.status}` };
        return { ok: true };
      }

      case "hubtel": {
        const auth = Buffer.from(
          `${process.env.HUBTEL_CLIENT_ID}:${process.env.HUBTEL_CLIENT_SECRET}`
        ).toString("base64");
        const url = new URL("https://smsc.hubtel.com/v1/messages/send");
        url.searchParams.set("from", sender!);
        url.searchParams.set("to", to);
        url.searchParams.set("content", body);
        const res = await fetch(url, {
          headers: { Authorization: `Basic ${auth}` },
        });
        if (!res.ok) return { ok: false, error: `Hubtel: HTTP ${res.status}` };
        return { ok: true };
      }

      case "twilio": {
        const sid = process.env.TWILIO_ACCOUNT_SID!;
        const auth = Buffer.from(
          `${sid}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString("base64");
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: to,
              From: process.env.TWILIO_FROM_NUMBER!,
              Body: body,
            }),
          }
        );
        if (!res.ok) return { ok: false, error: `Twilio: HTTP ${res.status}` };
        return { ok: true };
      }
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ---------------------------------------------------------------------------
// Church written messages
// ---------------------------------------------------------------------------

/**
 * The placeholders a church can use, and what each one becomes.
 *
 * Deliberately few and obvious. Somebody writing a birthday greeting on a
 * phone should not have to learn a syntax, and every extra placeholder is
 * another way for a message to go out reading "Hello {nmae}".
 */
export const PLACEHOLDERS = {
  name: "the member's name",
  church: "your church's name",
  amount: "the amount given, in cedis, for the thank you only",
  type: "tithe, offering or pledge, for the thank you only",
} as const;

/** The wording used until a church writes its own. */
export const DEFAULT_TEMPLATES = {
  welcome:
    "Akwaaba {name}! You have been added to the register at {church}. We are glad to have you with us.",
  birthday:
    "Happy birthday {name}! Everyone at {church} is thanking God for your life today. May this year bring you joy and good health.",
  thanks:
    "{church}: received your {type} of {amount}. Thank you, {name}. God bless you.",
} as const;

/**
 * Fills a template in.
 *
 * Any placeholder we do not have a value for is removed rather than left
 * on the page, because "{amount}" arriving on a member's phone is worse
 * than a slightly clipped sentence. Double spaces left behind by that are
 * tidied for the same reason.
 */
export function renderTemplate(
  template: string,
  values: { name?: string; church?: string; amount?: string; type?: string }
): string {
  return template
    .replace(/\{name\}/g, values.name ?? "")
    .replace(/\{church\}/g, values.church ?? "")
    .replace(/\{amount\}/g, values.amount ?? "")
    .replace(/\{type\}/g, values.type ?? "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * How many 160 character messages this will actually cost to send.
 *
 * Worth showing a church while they type. A sentence that feels short can
 * tip into a second segment and quietly double the bill for every message
 * they ever send.
 */
export function smsSegments(text: string): number {
  if (text.length === 0) return 0;
  return Math.ceil(text.length / 160);
}
