import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { replyOnWhatsApp } from "@/lib/messaging";
import { fallBackToText, QUEUED_COLUMNS, type QueuedNotification } from "@/lib/dispatch";

/**
 * Meta's webhook for the Fold WhatsApp number.
 *
 * Two things arrive here that matter:
 *
 * 1. A DELIVERY FAILURE. Meta accepts a message to a number that is not on
 *    WhatsApp and only reports the failure a few seconds later. Without
 *    this, a member who never installed WhatsApp would silently get no
 *    reminder at all. With it, they get a text instead.
 *
 * 2. A STOP REPLY. The template tells members they can reply STOP, so a
 *    STOP has to do something.
 *
 * Verified the same way as the Paystack webhook: an HMAC over the raw body,
 * checked before a byte of it is trusted, and only parsed afterwards.
 * Service role, because Meta has no session and a status update has to be
 * matched to whichever church sent the message.
 */
export const dynamic = "force-dynamic";

/**
 * The handshake Meta performs once, when the webhook URL is saved in the
 * app dashboard. It must echo the challenge, and only for our own token.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    token &&
    params.get("hub.mode") === "subscribe" &&
    params.get("hub.verify_token") === token
  ) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

function verified(raw: string, header: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header) return false;
  const expected =
    "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(header, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

type Change = {
  value?: {
    statuses?: {
      id?: string;
      status?: string;
      errors?: { code?: number; title?: string; message?: string }[];
    }[];
    messages?: { from?: string; type?: string; text?: { body?: string } }[];
  };
};

const STOP = /^\s*(stop|unsubscribe|stop reminders)[\s.!]*$/i;

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verified(raw, request.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // 503 so Meta retries once the deployment is fixed.
    return new Response("Not configured", { status: 503 });
  }

  let payload: { entry?: { changes?: Change[] }[] };
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Malformed payload", { status: 400 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const changes = (payload.entry ?? []).flatMap((e) => e.changes ?? []);

  for (const change of changes) {
    for (const s of change.value?.statuses ?? []) {
      if (s.status !== "failed" || !s.id) continue;

      const reason = s.errors?.[0];
      /*
        Moved to failed only if it was not failed already. Meta delivers the
        same event more than once, and each delivery must not send the
        member another text.
      */
      const { data: rows } = await supabase
        .from("notifications")
        .update({
          status: "failed",
          error: `WhatsApp could not deliver it${reason?.title ? `: ${reason.title}` : ""}${reason?.code ? ` (${reason.code})` : ""}. Sent as a text instead.`,
        })
        .eq("provider_message_id", s.id)
        .neq("status", "failed")
        .select(QUEUED_COLUMNS);

      const n = (rows ?? [])[0] as QueuedNotification | undefined;
      if (!n) continue;

      const { data: org } = await supabase
        .from("organizations")
        .select("sms_sender_id")
        .eq("id", n.organization_id)
        .maybeSingle<{ sms_sender_id: string | null }>();

      await fallBackToText(supabase, n, org?.sms_sender_id ?? null);
    }

    for (const m of change.value?.messages ?? []) {
      if (m.type !== "text" || !m.from || !STOP.test(m.text?.body ?? "")) {
        continue;
      }
      await supabase.rpc("whatsapp_opt_out", { phone: `+${m.from}` });
      await replyOnWhatsApp(
        m.from,
        "Done. You will not get any more reminders on WhatsApp. Your church may still send them by text."
      );
    }
  }

  // Always 200 once verified. Anything else and Meta retries, and keeps
  // retrying, a payload that will never be handled differently.
  return new Response("OK", { status: 200 });
}
