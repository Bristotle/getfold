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

  /*
    /balance, not /integration.

    The first version of this asked /integration to name the business, and
    reported a rejected key when it failed. That was wrong: /integration
    returns 500 "Error occurred" for every key, test and live alike, while
    /balance, /bank and /subaccount all answer normally. It made a working
    key look broken and sent us hunting a problem that was not there.

    /balance is the right probe because it is read only, it requires a
    valid key, and on a live key it reports the real settlement balance,
    which is proof the account is actually trading rather than merely
    holding credentials.
  */
  let accepted = false;
  let balances: { currency: string; amount: number }[] = [];
  let message: string | null = null;
  try {
    const res = await fetch("https://api.paystack.co/balance", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    const json = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: { currency: string; balance: number }[];
    };
    accepted = res.ok && Boolean(json.status);
    message = json.message ?? null;
    balances = (json.data ?? []).map((b) => ({
      currency: b.currency,
      // Pesewas to cedis, so the number reads the way a treasurer expects.
      amount: b.balance / 100,
    }));
  } catch (e) {
    message = (e as Error).message;
  }

  /*
    ?reference= and ?recent=1

    A payment can sit at "Waiting" in the dashboard while Paystack has never
    heard of it, and from the outside the two cases look identical: a charge
    that was never sent, and a charge sent under a different key. The only
    way to tell them apart is to ask the deployment's own key, because that
    is the key the charge would have used.

    /transaction?perPage=n lists what this key has actually seen, which
    answers "did anything at all reach Paystack" even when a single
    reference lookup comes back not found.
  */
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference");

  let lookup: unknown = null;
  if (reference) {
    try {
      const res = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" }
      );
      const json = (await res.json()) as {
        message?: string;
        data?: {
          status?: string;
          amount?: number;
          gateway_response?: string;
          channel?: string;
          created_at?: string;
          subaccount?: { subaccount_code?: string };
        };
      };
      lookup = {
        http: res.status,
        message: json.message ?? null,
        status: json.data?.status ?? null,
        amountCedis: json.data?.amount ? json.data.amount / 100 : null,
        gatewayResponse: json.data?.gateway_response ?? null,
        channel: json.data?.channel ?? null,
        createdAt: json.data?.created_at ?? null,
        subaccount: json.data?.subaccount?.subaccount_code ?? null,
      };
    } catch (e) {
      lookup = { error: (e as Error).message };
    }
  }

  let recent: unknown = null;
  if (url.searchParams.get("recent")) {
    try {
      const res = await fetch("https://api.paystack.co/transaction?perPage=5", {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
      });
      const json = (await res.json()) as {
        message?: string;
        data?: {
          reference?: string;
          status?: string;
          amount?: number;
          channel?: string;
          gateway_response?: string;
          created_at?: string;
        }[];
      };
      recent = {
        http: res.status,
        message: json.message ?? null,
        count: json.data?.length ?? 0,
        transactions: (json.data ?? []).map((t) => ({
          reference: t.reference,
          status: t.status,
          amountCedis: t.amount ? t.amount / 100 : null,
          channel: t.channel,
          gatewayResponse: t.gateway_response,
          createdAt: t.created_at,
        })),
      };
    } catch (e) {
      recent = { error: (e as Error).message };
    }
  }

  return NextResponse.json({
    configured: true,
    mode,
    accepted,
    balances,
    message,
    alertEmailSet: Boolean(process.env.ALERT_EMAIL),
    resendKeySet: Boolean(process.env.RESEND_API_KEY),
    ...(lookup ? { lookup } : {}),
    ...(recent ? { recent } : {}),
  });
}
