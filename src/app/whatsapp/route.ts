import { redirect } from "next/navigation";
import { SUPPORT_PHONE } from "@/lib/contact";

/**
 * Hands a visitor off to WhatsApp, with a greeting already typed.
 *
 * This used to exist to keep a personal handset's number out of the HTML.
 * The support line is a dedicated business SIM now, in src/lib/contact.ts,
 * but every "WhatsApp us" button still links here, so the number and the
 * greeting stay in one place.
 */
export const dynamic = "force-dynamic";

const GREETING =
  "Hello Fold, I have a question about using this for my church.";

export function GET() {
  redirect(
    `https://wa.me/${SUPPORT_PHONE.whatsapp}?text=${encodeURIComponent(GREETING)}`
  );
}
