import { NextResponse } from "next/server";

/**
 * Is the deployed Paystack key live, and does it work?
 *
 * Exists because the only way to know which key a deployment is actually
 * running is to ask the deployment, and a key pasted into a dashboard is
 * not the same as a key the running code can use. Reports the mode and
 * whether Paystack accepts it, and never the key itself.
 *
 * Behind CRON_SECRET, because the answer tells an attacker whether we are
 * taking real money yet.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return NextResponse.json({ configured: false });

  const mode = key.startsWith("sk_live")
    ? "live"
    : key.startsWith("sk_test")
      ? "test"
      : "unrecognised";

  // /integration is a read only call that tells us whether the key is
  // accepted and what business it belongs to.
  let accepted = false;
  let business: string | null = null;
  let message: string | null = null;
  try {
    const res = await fetch("https://api.paystack.co/integration", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    const json = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: { business_name?: string };
    };
    accepted = res.ok && Boolean(json.status);
    business = json.data?.business_name ?? null;
    message = json.message ?? null;
  } catch (e) {
    message = (e as Error).message;
  }

  return NextResponse.json({
    configured: true,
    mode,
    accepted,
    business,
    message,
    alertEmailSet: Boolean(process.env.ALERT_EMAIL),
    resendKeySet: Boolean(process.env.RESEND_API_KEY),
  });
}
