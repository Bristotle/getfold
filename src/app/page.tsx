import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        Built for how Ghanaian churches actually operate
      </p>
      <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
        Church management that fits your church — not a template.
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        Members, attendance, tithes, and reports — configurable to your
        denomination&rsquo;s structure, with mobile money and WhatsApp built in
        as options, never requirements.
      </p>
      <div className="flex gap-3 pt-2">
        <Link href="/login">
          <Button size="lg">Get started</Button>
        </Link>
      </div>
    </main>
  );
}
