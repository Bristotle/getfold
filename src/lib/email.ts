import "server-only";

/**
 * Sends one email to one person through Resend, and says what happened.
 *
 * For messages to a church's own people, such as an invitation to join
 * the team. Operational alerts to Fold staff use sendAlert in alert.ts.
 * Never throws: the caller records or shows the error instead.
 */
export async function sendEmail(m: {
  to: string;
  subject: string;
  text: string;
  /** Where a reply goes. Without it, replies go to no-reply and die. */
  replyTo?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "Email is not set up on this server." };
  const from = process.env.ALERT_FROM ?? "Fold <no-reply@getfold.org>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [m.to],
        subject: m.subject,
        text: m.text,
        ...(m.replyTo ? { reply_to: m.replyTo } : {}),
      }),
    });
    if (res.ok) return { ok: true };
    const detail = await res
      .json()
      .then((j: { message?: string }) => j.message)
      .catch(() => null);
    return { ok: false, error: detail ?? `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
