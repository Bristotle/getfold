import { redirect } from "next/navigation";

/**
 * Hands a visitor off to WhatsApp without ever putting the number in the page.
 *
 * The obvious way to do this is href="https://wa.me/233...", but that puts
 * the number in the HTML, where a scraper reads it as easily as a person
 * does. While the support line is somebody's personal handset, that
 * matters.
 *
 * So the page links here instead, and the number lives only in the
 * environment. Change NEXT_PUBLIC_WHATSAPP to a business line later and
 * nothing else has to change.
 *
 * The variable has no NEXT_PUBLIC_ prefix on purpose. Next inlines every
 * NEXT_PUBLIC_ value into the client bundle wherever it is referenced, and
 * a number we are taking out of the HTML should not be reachable in the
 * JavaScript either. Server only, both ways.
 */
export const dynamic = "force-dynamic";

const GREETING =
  "Hello Fold, I have a question about using this for my church.";

export function GET() {
  const number =
    process.env.WHATSAPP_NUMBER ??
    process.env.NEXT_PUBLIC_WHATSAPP ??
    "233247902348";
  redirect(`https://wa.me/${number}?text=${encodeURIComponent(GREETING)}`);
}
