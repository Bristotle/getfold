import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Rate limiting and logging for the auth actions.
 *
 * What this covers, and what it does not. Supabase's auth API is reachable
 * directly with the public anon key, so an attacker can skip our server
 * actions entirely. These limits protect our endpoints and give us a
 * record of what was tried; Supabase's own rate limits are the control for
 * direct API abuse. Treating this as complete protection would be a false
 * sense of safety, which is worse than none.
 *
 * Thresholds are deliberately different by dimension. Five failures against
 * one address in fifteen minutes is somebody guessing a particular pastor's
 * password. Twenty from one source is somebody spraying many accounts. A
 * church secretary who has genuinely forgotten hers will hit neither before
 * she gives up and uses the reset link.
 */
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 20;
const WINDOW_MINUTES = 15;

export type AuthEvent =
  | "login_ok"
  | "login_failed"
  | "signup_ok"
  | "signup_failed"
  | "reset_requested"
  | "password_changed"
  | "rate_limited";

/**
 * The caller's address, as far as we can tell behind Vercel's proxy.
 * x-forwarded-for is a list; the first entry is the client.
 */
async function callerIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim() || null;
  return h.get("x-real-ip");
}

async function callerAgent(): Promise<string | null> {
  return (await headers()).get("user-agent");
}

export async function logAuthEvent(
  email: string | null,
  event: AuthEvent,
  detail?: string
) {
  try {
    const supabase = await createClient();
    await supabase.rpc("record_auth_event", {
      p_email: email,
      p_event: event,
      p_ip: await callerIp(),
      p_user_agent: await callerAgent(),
      p_detail: detail ?? null,
    });
  } catch {
    // Logging must never be the reason somebody cannot sign in.
  }
}

/**
 * True when this attempt should be refused before it reaches Supabase.
 *
 * Fails open. If the check itself errors we let the attempt through rather
 * than locking every church out of their own records because a query
 * failed, and Supabase's own limits still apply underneath.
 */
export async function isRateLimited(email: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("auth_failures_recent", {
      p_email: email,
      p_ip: await callerIp(),
      p_minutes: WINDOW_MINUTES,
    });
    const row = data?.[0] as { by_email: number; by_ip: number } | undefined;
    if (!row) return false;
    return (
      Number(row.by_email) >= MAX_PER_EMAIL || Number(row.by_ip) >= MAX_PER_IP
    );
  } catch {
    return false;
  }
}

export const RATE_LIMIT_MESSAGE =
  "Too many attempts. Wait fifteen minutes and try again, or use the reset link.";
