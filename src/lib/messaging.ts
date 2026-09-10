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

const cedis = (n: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
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
};

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
