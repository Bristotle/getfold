"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * The sent or error notice after a form submits, read on the client.
 *
 * This is the whole reason the homepage and the contact page were
 * uncacheable. Each read searchParams on the server to show a one line
 * banner, and a page that reads searchParams is rendered on the server for
 * every visitor and cached nowhere. The three most important pages on the
 * site were the three slowest, for an audience on Ghanaian mobile data.
 *
 * Read here instead, the page has no dynamic input at all and becomes
 * static HTML served from the edge. The cost is a few hundred bytes of
 * JavaScript for a banner that appears only after somebody has posted a
 * form, which is the one moment they demonstrably have JavaScript.
 *
 * Suspense is required around useSearchParams on a static page, or the
 * page bails out to client rendering, which would defeat the point.
 */
function Inner({ successText }: { successText: string }) {
  const params = useSearchParams();
  const sent = params.get("sent") === "1";
  const error = params.get("error");

  if (sent) {
    return (
      <p
        role="status"
        className="mt-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success-text"
      >
        {successText}
      </p>
    );
  }
  if (error) {
    return (
      <p
        role="alert"
        className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger-text"
      >
        {error}
      </p>
    );
  }
  return null;
}

export function QueryBanner({
  successText = "Thank you. We have your message and will reply within a day.",
}: {
  successText?: string;
}) {
  return (
    <Suspense fallback={null}>
      <Inner successText={successText} />
    </Suspense>
  );
}
