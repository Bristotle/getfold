import { redirect } from "next/navigation";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/marketing/logo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enquiries, Fold", robots: { index: false, follow: false } };

/**
 * Every enquiry from the public site, in one place.
 *
 * contact_requests deliberately has no select policy, so a church can write
 * an enquiry and can never read anybody else's. That is right, and it means
 * the only way to read them is the service role, which is why this page
 * exists at all rather than the table being queried from the dashboard.
 *
 * Access is by email address against ALERT_EMAIL. Crude, and appropriate:
 * there is no super administrator concept in the product, inventing one for
 * a single internal page would put a role in the database that churches
 * could see, and this page shows nothing belonging to any church.
 *
 * The alerts are the primary route. This is the safety net for when an SMS
 * fails or an inbox filter eats an email, because a missed enquiry is a
 * church that concluded we do not reply.
 */
type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  church: string | null;
  message: string | null;
  source: string | null;
  created_at: string;
};

function allowed(email: string | null): boolean {
  const list = (process.env.ALERT_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email && list.includes(email.toLowerCase()));
}

export default async function EnquiriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!allowed(user.email ?? null)) {
    // Deliberately the same answer a signed out visitor gets, so this page
    // does not confirm its own existence to somebody who should not see it.
    redirect("/dashboard");
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data } = await service
    .from("contact_requests")
    .select("id, name, email, phone, church, message, source, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as Row[];

  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <Logo />
        <span className="font-numeric text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? "enquiry" : "enquiries"}
        </span>
      </div>

      <h1 className="mt-8 text-xl font-bold text-foreground">Enquiries</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything sent through the contact form and the homepage.
      </p>

      {rows.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-muted-foreground">
            Nothing yet. When somebody enquires you get a text straight away,
            and it appears here.
          </p>
        </Card>
      ) : (
        <ul className="m-0 mt-6 flex list-none flex-col gap-4 p-0">
          {rows.map((r) => (
            <li key={r.id}>
              <Card>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-base font-bold text-foreground">
                    {r.name}
                    {r.church ? (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {r.church}
                      </span>
                    ) : null}
                  </h2>
                  <time
                    dateTime={r.created_at}
                    className="font-numeric text-xs text-muted-foreground"
                  >
                    {new Date(r.created_at).toLocaleString("en-GH", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>

                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <a
                    href={`mailto:${r.email}`}
                    className="rounded font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {r.email}
                  </a>
                  {r.phone && (
                    <a
                      href={`https://wa.me/${r.phone.replace(/\D/g, "").replace(/^0/, "233")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded font-numeric font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {r.phone}
                    </a>
                  )}
                  {r.source && (
                    <span className="text-xs text-muted-foreground">
                      from {r.source}
                    </span>
                  )}
                </p>

                {r.message && (
                  <p className="mt-3 whitespace-pre-wrap border-t border-border pt-3 text-[15px] leading-relaxed text-foreground/85">
                    {r.message}
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
