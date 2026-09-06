import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Paystack, mobile money collection for Ghana.
 *
 * Chosen over Stripe (the only Marketplace payments option) because Stripe
 * does not support MTN MoMo in Ghana. See the README for the comparison
 * against Hubtel.
 */

export const MOMO_PROVIDERS = [
  { value: "mtn", label: "MTN MoMo" },
  { value: "vod", label: "Telecel Cash (Vodafone)" },
  { value: "atl", label: "AirtelTigo Money" },
] as const;

export type MomoProvider = (typeof MOMO_PROVIDERS)[number]["value"];

export function paystackStatus(): {
  configured: boolean;
  missing: string[];
  testMode: boolean;
} {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const missing: string[] = [];
  if (!secret) missing.push("PAYSTACK_SECRET_KEY");
  return {
    configured: missing.length === 0,
    missing,
    testMode: !!secret && secret.startsWith("sk_test_"),
  };
}

/**
 * Paystack works in the currency's smallest unit. For GHS that is pesewas,
 * so GHS 12.34 must be sent as 1234. Getting this wrong is a factor-of-100
 * error in real money, so it is done in exactly one place.
 */
export const toPesewas = (cedis: number) => Math.round(cedis * 100);
export const fromPesewas = (pesewas: number) => pesewas / 100;

/** Our own idempotency key, echoed back by the webhook. */
export function newReference(orgSlug: string) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `fold_${orgSlug.slice(0, 12)}_${Date.now()}_${rand}`;
}

type ChargeResult =
  | {
      ok: true;
      status: string;
      reference: string;
      displayText: string | null;
    }
  | { ok: false; error: string };

/**
 * Initiates a mobile-money charge.
 *
 * In Ghana the response comes back as `pay_offline`: the member gets a
 * prompt on their handset and approves it with their PIN. Nothing is
 * confirmed here, the webhook is the authoritative signal that money moved.
 */
export async function initiateMomoCharge(params: {
  email: string;
  amountCedis: number;
  phone: string;
  provider: MomoProvider;
  reference: string;
}): Promise<ChargeResult> {
  const status = paystackStatus();
  if (!status.configured) {
    return {
      ok: false,
      error: `Paystack is not configured (missing ${status.missing.join(", ")}).`,
    };
  }

  try {
    const res = await fetch("https://api.paystack.co/charge", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: toPesewas(params.amountCedis),
        currency: "GHS",
        reference: params.reference,
        mobile_money: {
          phone: params.phone,
          provider: params.provider,
        },
      }),
    });

    const json = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: { status?: string; reference?: string; display_text?: string };
    };

    if (!res.ok || !json.status) {
      return { ok: false, error: json.message ?? `HTTP ${res.status}` };
    }

    return {
      ok: true,
      status: json.data?.status ?? "pending",
      reference: json.data?.reference ?? params.reference,
      displayText: json.data?.display_text ?? null,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Verifies a webhook came from Paystack.
 *
 * Two details matter and are easy to get wrong:
 *   - the algorithm is HMAC-SHA512, not the SHA-256 most gateways use;
 *   - it must be computed over the EXACT raw body. Re-serialising the
 *     parsed JSON changes the bytes and every signature fails.
 *
 * Compared in constant time so a timing side-channel can't be used to
 * forge a signature byte by byte.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  // timingSafeEqual throws on a length mismatch, which would itself leak.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Asks Paystack directly what happened to a transaction.
 *
 * Used as a fallback when a payment is stuck pending, a webhook can be
 * missed, so the record must never depend solely on receiving one.
 */
export async function verifyTransaction(reference: string): Promise<
  | { ok: true; status: string; amountCedis: number; gatewayResponse: string }
  | { ok: false; error: string }
> {
  const status = paystackStatus();
  if (!status.configured) {
    return { ok: false, error: "Paystack is not configured." };
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );
    const json = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: { status?: string; amount?: number; gateway_response?: string };
    };

    if (!res.ok || !json.status || !json.data) {
      return { ok: false, error: json.message ?? `HTTP ${res.status}` };
    }

    return {
      ok: true,
      status: json.data.status ?? "unknown",
      amountCedis: fromPesewas(json.data.amount ?? 0),
      gatewayResponse: json.data.gateway_response ?? "",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
