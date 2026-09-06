"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Shown when a dashboard page throws.
 *
 * Says what happened in words a church secretary can act on, and offers the
 * one thing that usually helps. The underlying message is deliberately not
 * shown: it is Postgres or network detail that means nothing to the reader
 * and can name tables and columns.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the detail where an engineer can find it.
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg">
      <h1 className="text-lg font-bold text-foreground">
        Something went wrong loading this page
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your records are safe. This was a problem displaying them, not storing
        them. Trying again usually works, especially if your connection dropped
        for a moment.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload the page
        </Button>
      </div>

      {error.digest && (
        <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
          If you report this, quote reference{" "}
          <span className="font-numeric text-foreground">{error.digest}</span>.
        </p>
      )}
    </Card>
  );
}
