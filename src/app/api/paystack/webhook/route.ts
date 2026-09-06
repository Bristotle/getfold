import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/paystack";

/**
 * Paystack webhook, the authoritative signal that money actually moved.
 *
 * Three things this endpoint must get right:
 *
 * 1. VERIFY FIRST. Anyone can POST here. The signature check happens before
 *    a single byte of the payload is trusted, and an unsigned request is
 *    rejected outright rather than logged and processed.
 *
 * 2. RAW BODY. The HMAC is over the exact bytes Paystack sent. Parsing and
 *    re-serialising the JSON changes them and every signature fails, so the
 *    body is read as text and only parsed after verification.
 *
 * 3. IDEMPOTENT. Paystack retries on any non-2xx, and may deliver the same
 *    event more than once regardless. Creating a contribution twice would
 *    overstate a church's income, so the write is guarded by the payment's
 *    own status and its unique contribution_id.
 *
 * It runs with the service role because there is no user session on a
 * webhook, RLS cannot be satisfied by an incoming HTTP call from Paystack.
 */

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    // 401, not 400: this is an authentication failure. Paystack does not
    // retry 4xx, which is correct, a forged request should not be retried.
    return new Response("Invalid signature", { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) {
    // 503 so Paystack retries once the key is present, rather than dropping
    // a real payment because of a deployment mistake.
    return new Response("Server not configured for webhooks", { status: 503 });
  }

  let event: {
    event?: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      gateway_response?: string;
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Malformed payload", { status: 400 });
  }

  const reference = event.data?.reference;
  if (!reference) return new Response("No reference", { status: 400 });

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: payment } = await supabase
    .from("payments")
    .select("id, organization_id, member_id, amount, type, status, contribution_id, phone")
    .eq("reference", reference)
    .maybeSingle();

  // A reference we never issued: acknowledge so Paystack stops retrying,
  // but change nothing.
  if (!payment) return new Response("Unknown reference", { status: 200 });

  // Already settled, a duplicate delivery. Acknowledge and stop.
  if (payment.status === "success" && payment.contribution_id) {
    return new Response("Already processed", { status: 200 });
  }

  const succeeded = event.event === "charge.success" || event.data?.status === "success";

  if (!succeeded) {
    await supabase
      .from("payments")
      .update({
        status: event.data?.status === "abandoned" ? "abandoned" : "failed",
        gateway_response: event.data?.gateway_response ?? event.event ?? null,
      })
      .eq("id", payment.id);
    return new Response("Recorded", { status: 200 });
  }

  // Trust Paystack's amount over our own record: the member may have been
  // charged a different figure, and the church's books must match the money
  // that actually moved.
  const amountCedis =
    typeof event.data?.amount === "number"
      ? event.data.amount / 100
      : Number(payment.amount);

  const { data: contribution, error: contributionError } = await supabase
    .from("contributions")
    .insert({
      organization_id: payment.organization_id,
      member_id: payment.member_id,
      type: payment.type,
      amount: amountCedis.toFixed(2),
      payment_method: "momo",
      note: `Mobile money · ${payment.phone}`,
      recorded_by_profile_id: null,
    })
    .select("id")
    .single();

  if (contributionError || !contribution) {
    // Leave the payment pending and return 5xx so Paystack retries. Better a
    // duplicate delivery we can detect than a payment silently lost.
    return new Response("Could not record contribution", { status: 500 });
  }

  await supabase
    .from("payments")
    .update({
      status: "success",
      contribution_id: contribution.id,
      gateway_response: event.data?.gateway_response ?? "Successful",
    })
    .eq("id", payment.id);

  return new Response("OK", { status: 200 });
}
