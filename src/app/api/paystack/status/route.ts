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
    /transaction, not /balance, and not /integration.

    This probe has now been wrong twice, both times by picking an endpoint
    that fails for reasons of its own and reading that as a rejected key.

    /integration returns 500 for every key, test and live alike. /balance
    answered normally one hour and 401 "Invalid key" the next on a key that
    was demonstrably working, because a Paystack account that has not
    finished activation has no balance to report.

    /transaction is the right probe, and it is the only one tested rather
    than assumed. A deliberately invalid key returns 401 "Invalid key"; the
    deployed key returns 200 "Transactions retrieved". That difference is
    what makes it evidence. /bank proves nothing either way, it answers 200
    for any string at all because it needs no authentication.

    The lesson worth keeping: a probe is only a probe if a bad key fails it.
    Check that before trusting what it says.
  */
  let accepted = false;
  let message: string | null = null;
  try {
    const res = await fetch("https://api.paystack.co/transaction?perPage=1", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    const json = (await res.json()) as { status?: boolean; message?: string };
    accepted = res.ok && Boolean(json.status);
    message = json.message ?? null;
  } catch (e) {
    message = (e as Error).message;
  }

  /*
    The balance is reported separately and never decides whether the key is
    accepted, because a live account awaiting activation has none.
  */
  let balances: { currency: string; amount: number }[] = [];
  let balanceMessage: string | null = null;
  try {
    const res = await fetch("https://api.paystack.co/balance", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    const json = (await res.json()) as {
      message?: string;
      data?: { currency: string; balance: number }[];
    };
    balanceMessage = json.message ?? null;
    balances = (json.data ?? []).map((b) => ({
      currency: b.currency,
      // Pesewas to cedis, so the number reads the way a treasurer expects.
      amount: b.balance / 100,
    }));
  } catch (e) {
    balanceMessage = (e as Error).message;
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

  /*
    ?probe=1

    /balance answering "Invalid key" while /transaction answers normally on
    the SAME key is not something a single endpoint can explain, so this
    asks several and shows the answers side by side.

    It also describes the key without disclosing it. A key pasted with a
    trailing newline, or truncated by a copy that missed the end, fails in
    exactly this confusing way, and the length plus a hash prefix identifies
    which key is deployed without putting the key anywhere it could be read.
  */
  /*
    ?channels=1

    Which payment channels will this account actually accept?

    A church picked "Visa or Mastercard" on the billing page and Paystack
    answered "No active channel to process transaction. Please contact
    merchant", which is what it says when the requested channel is not
    enabled on the integration. That is an account setting, not a bug in
    our code, and there is no endpoint that lists enabled channels, so the
    only way to know is to ask for each one and see which are refused.

    Initialising creates a pending transaction and charges nobody, so this
    is safe to run. The transactions are abandoned and cost nothing.
  */
  let channels: unknown = null;
  if (url.searchParams.get("channels")) {
    const each = ["mobile_money", "card", "bank_transfer", "ussd", "qr", "eft", "NONE"];
    const results: Record<string, { ok: boolean; message: string | null }> = {};
    for (const channel of each) {
      try {
        const res = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "channel-probe@example.com",
            amount: 100,
            currency: "GHS",
            // NONE omits the key entirely, which is what the fallback does
            // when a named channel is refused. Verified to work, so the
            // fallback is not itself relying on a channel being enabled.
            ...(channel === "NONE" ? {} : { channels: [channel] }),
            reference: `probe_${channel}_${Date.now()}`,
          }),
        });
        const json = (await res.json()) as { status?: boolean; message?: string };
        results[channel] = {
          ok: res.ok && Boolean(json.status),
          message: json.message ?? null,
        };
      } catch (e) {
        results[channel] = { ok: false, message: (e as Error).message };
      }
    }
    channels = results;
  }

  let probe: unknown = null;
  if (url.searchParams.get("probe")) {
    const endpoints = [
      ["balance", "https://api.paystack.co/balance"],
      ["transaction", "https://api.paystack.co/transaction?perPage=1"],
      ["subaccount", "https://api.paystack.co/subaccount?perPage=5"],
      ["bank", "https://api.paystack.co/bank?currency=GHS&perPage=1"],
    ] as const;

    const results: Record<
      string,
      { http: number; message: string | null; found?: string[] }
    > = {};
    for (const [name, endpoint] of endpoints) {
      try {
        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${key}` },
          cache: "no-store",
        });
        const json = (await res.json()) as {
          message?: string;
          data?: { subaccount_code?: string; business_name?: string }[];
        };
        results[name] = { http: res.status, message: json.message ?? null };

        /*
          Name the subaccounts this key can see. A charge quotes a
          subaccount code, and a code the key cannot see fails the charge,
          so "the key works" is not the same question as "the key can settle
          this church". Codes are opaque identifiers, not account numbers.
        */
        if (name === "subaccount" && Array.isArray(json.data)) {
          results[name].found = json.data.map(
            (s) => `${s.subaccount_code} (${s.business_name ?? "unnamed"})`
          );
        }
      } catch (e) {
        results[name] = { http: 0, message: (e as Error).message };
      }
    }

    const { createHash } = await import("node:crypto");
    probe = {
      endpoints: results,
      key: {
        length: key.length,
        startsWith: key.slice(0, 8),
        fingerprint: createHash("sha256").update(key).digest("hex").slice(0, 8),
        hasSurroundingWhitespace: key !== key.trim(),
      },
    };
  }

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
    balanceMessage,
    message,
    alertEmailSet: Boolean(process.env.ALERT_EMAIL),
    resendKeySet: Boolean(process.env.RESEND_API_KEY),
    ...(lookup ? { lookup } : {}),
    ...(recent ? { recent } : {}),
    ...(probe ? { probe } : {}),
    ...(channels ? { channels } : {}),
  });
}
