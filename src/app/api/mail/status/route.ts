import { NextResponse } from "next/server";

/**
 * Why did that email not arrive?
 *
 * Asks Resend from inside the deployment, where the key already lives, so
 * diagnosing delivery never requires the key to travel anywhere. Reports
 * the domain's verification status and the last few sends with their
 * delivery events, which is the difference between "we never sent it",
 * "we sent it and it bounced" and "we sent it and it is in spam".
 *
 * POST with ?send=1 to send one real test email to ALERT_EMAIL.
 *
 * Behind CRON_SECRET like the other diagnostics.
 */
export const dynamic = "force-dynamic";

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  const from = process.env.ALERT_FROM ?? null;

  if (!key) return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 400 });

  const h = { Authorization: `Bearer ${key}` };
  const out: Record<string, unknown> = { to, from };

  try {
    const res = await fetch("https://api.resend.com/domains", { headers: h, cache: "no-store" });
    const json = (await res.json()) as {
      data?: { name: string; status: string; region: string }[];
      message?: string;
    };
    out.domainsStatus = res.status;
    out.domains = (json.data ?? []).map((d) => ({
      name: d.name,
      status: d.status,
      region: d.region,
    }));
    if (!json.data) out.domainsMessage = json.message ?? null;
  } catch (e) {
    out.domainsError = (e as Error).message;
  }

  try {
    const res = await fetch("https://api.resend.com/emails?limit=5", { headers: h, cache: "no-store" });
    const json = (await res.json()) as {
      data?: { created_at: string; last_event?: string; to: string[]; subject: string }[];
      message?: string;
    };
    out.recentStatus = res.status;
    out.recent = (json.data ?? []).map((m) => ({
      at: m.created_at,
      event: m.last_event ?? null,
      to: m.to,
      subject: m.subject,
    }));
    if (!json.data) out.recentMessage = json.message ?? null;
  } catch (e) {
    out.recentError = (e as Error).message;
  }

  return NextResponse.json(out);
}

export async function POST(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  const from = process.env.ALERT_FROM ?? "Fold <no-reply@getfold.org>";
  if (!key || !to) {
    return NextResponse.json({ error: "RESEND_API_KEY or ALERT_EMAIL not set" }, { status: 400 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((t) => t.trim()).filter(Boolean),
      subject: "Fold: email delivery test",
      text: "If you are reading this, enquiry emails from getfold.org will reach you. Nothing else to do.",
    }),
  });

  const json = await res.json();
  return NextResponse.json({ status: res.status, result: json });
}
