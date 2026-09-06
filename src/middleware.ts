import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // `api` is excluded: the Paystack webhook is authenticated by its
    // HMAC signature, not a session, and must not be touched by the auth
    // redirect logic.
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
