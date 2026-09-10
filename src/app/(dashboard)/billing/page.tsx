import { redirect } from "next/navigation";
import Link from "next/link";
import { Info, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBanner } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { payInvoice } from "./actions";

export const metadata = { title: "Billing, Fold" };

const cedis = (pesewas: number) =>
  `GHS ${new Intl.NumberFormat("en-GH", { maximumFractionDigits: 2 }).format(pesewas / 100)}`;

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

type Invoice = {
  id: string;
  period_start: string;
  period_end: string;
  amount_pesewas: number;
  band_name: string;
  member_count: number | null;
  status: string;
  due_on: string | null;
  paid_at: string | null;
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  if (!can(membership.role, "finance.view")) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">
          Only the pastor, an administrator or a finance officer can see
          billing.
        </p>
      </Card>
    );
  }

  const supabase = await createClient();

  const [{ data: trialRows }, { data: invoiceRows }, memberCount] =
    await Promise.all([
      supabase.rpc("trial_status", { org_id: membership.organization.id }),
      supabase
        .from("invoices")
        .select(
          "id, period_start, period_end, amount_pesewas, band_name, member_count, status, due_on, paid_at"
        )
        .order("period_start", { ascending: false }),
      supabase
        .from("members")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", membership.organization.id)
        .eq("status", "active"),
    ]);

  const trial = (trialRows?.[0] ?? null) as
    | { status: string; ends_at: string; days_left: number }
    | null;
  const invoices = (invoiceRows ?? []) as Invoice[];
  const members = memberCount.count ?? 0;

  const band =
    members <= 100
      ? { name: "Society", monthly: 149 }
      : members <= 400
        ? { name: "Society Plus", monthly: 299 }
        : members <= 1000
          ? { name: "Large Society", monthly: 499 }
          : null;

  const outstanding = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue" || i.status === "draft"
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Billing</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Billed every three months, the same cycle as your statistical
          return. Pay by mobile money or card, whichever suits your treasurer.
        </p>
      </div>

      <StatusBanner error={error} message={message} />

      {/* ---------- where the church stands ---------- */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your band
            </p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {band ? band.name : "Circuit and above"}
            </p>
            <p className="mt-0.5 font-numeric text-sm text-muted-foreground">
              {members} active {members === 1 ? "member" : "members"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {trial?.status === "trialing" ? "Free trial" : "Status"}
            </p>
            {trial?.status === "trialing" ? (
              <>
                <p className="mt-1 font-numeric text-lg font-bold text-foreground">
                  {trial.days_left} days left
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Until {shortDate(trial.ends_at)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-lg font-bold text-foreground">
                {trial?.status === "active"
                  ? "Active"
                  : trial?.status === "grace"
                    ? "Trial ended"
                    : "Not on a plan"}
              </p>
            )}
          </div>
        </div>

        {band && (
          <p className="mt-5 border-t border-border pt-4 font-numeric text-sm text-muted-foreground">
            GHS {band.monthly} a month, billed as GHS {band.monthly * 3} every
            three months.{" "}
            <Link
              href="/pricing"
              className="rounded font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              See the bands
            </Link>
          </p>
        )}

        {!band && (
          <div className="mt-5 flex gap-3 border-t border-border pt-4">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-primary">
              <Info size={17} strokeWidth={1.9} />
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Above a thousand members, or more than one society, the rate is
              agreed rather than calculated. It is almost always less than
              each society paying separately.{" "}
              <Link
                href="/contact"
                className="rounded font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Talk to us
              </Link>
            </p>
          </div>
        )}
      </Card>

      {/* ---------- what is owed ---------- */}
      {outstanding.length > 0 && (
        <Card>
          <h2 className="text-base font-bold text-foreground">To pay</h2>
          <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
            {outstanding.map((i) => (
              <li
                key={i.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary-soft p-4"
              >
                <div className="min-w-0">
                  <p className="font-numeric text-lg font-bold text-foreground">
                    {cedis(i.amount_pesewas)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {shortDate(i.period_start)} to {shortDate(i.period_end)},{" "}
                    {i.band_name}
                    {i.due_on ? `, due ${shortDate(i.due_on)}` : ""}
                  </p>
                </div>
                <form action={payInvoice}>
                  <input type="hidden" name="invoiceId" value={i.id} />
                  <SubmitButton size="sm" pendingLabel="Opening…">
                    Pay by mobile money or card
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ---------- history ---------- */}
      <Card>
        <h2 className="text-base font-bold text-foreground">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Nothing yet. Your first invoice is raised when the free trial
            ends, and we tell you before it is.
          </p>
        ) : (
          <ul className="m-0 mt-4 flex list-none flex-col p-0">
            {invoices.map((i) => (
              <li
                key={i.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {shortDate(i.period_start)} to {shortDate(i.period_end)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {i.band_name}
                    {i.member_count !== null
                      ? `, ${i.member_count} members at the time`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-numeric text-sm font-semibold text-foreground">
                    {cedis(i.amount_pesewas)}
                  </span>
                  {i.status === "paid" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success-text">
                      <Check size={12} strokeWidth={3} aria-hidden="true" />
                      Paid
                    </span>
                  ) : (
                    <span className="rounded-full bg-surface-soft px-2.5 py-1 text-xs font-semibold capitalize text-muted-foreground">
                      {i.status}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
