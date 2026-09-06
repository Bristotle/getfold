import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardLabel, CardStat } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import {
  CONTRIBUTION_TYPES,
  PAYMENT_METHODS,
  labelFor,
} from "@/lib/constants";
import { recordContribution } from "./actions";
import { collectByMomo, refreshPayment } from "./momo-actions";
import { MOMO_PROVIDERS, paystackStatus } from "@/lib/paystack";

type Row = {
  id: string;
  type: string;
  // DECIMAL(12,2) comes back as a number here but as a string from the
  // dashboard_stats RPC, always coerce with Number() rather than trusting
  // one shape.
  amount: string | number;
  payment_method: string;
  note: string | null;
  created_at: string;
  members: { full_name: string } | { full_name: string }[] | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const cedis = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
});

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function ContributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  // RLS already returns nothing to these roles; redirecting is clearer than
  // rendering an empty page that looks broken.
  if (!can(membership.role, "finance.view")) redirect("/dashboard");

  const canWrite = can(membership.role, "finance.write");
  const paystack = paystackStatus();

  const supabase = await createClient();

  const [{ data, error: loadError }, { data: memberList }, { data: fundList }] =
    await Promise.all([
    supabase
      .from("contributions")
      .select(
        "id, type, amount, payment_method, note, created_at, members ( full_name )"
      )
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("members")
      .select("id, full_name")
      .eq("status", "active")
      .order("full_name"),
    supabase.from("funds").select("id, name").order("name"),
  ]);

  const { data: paymentRows } = await supabase
    .from("payments")
    .select("id, reference, amount, provider, phone, status, gateway_response, created_at, members ( full_name )")
    .in("status", ["pending", "failed"])
    .order("created_at", { ascending: false })
    .limit(20);

  const pendingPayments = (paymentRows ?? []) as {
    id: string;
    reference: string;
    amount: string | number;
    provider: string;
    phone: string;
    status: string;
    gateway_response: string | null;
    created_at: string;
    members: { full_name: string } | { full_name: string }[] | null;
  }[];

  const rows = (data ?? []) as Row[];
  const members = (memberList ?? []) as { id: string; full_name: string }[];
  const funds = (fundList ?? []) as { id: string; name: string }[];

  const total = rows.reduce((s, r) => s + Number(r.amount), 0);
  const titheTotal = rows
    .filter((r) => r.type === "tithe")
    .reduce((s, r) => s + Number(r.amount), 0);

  const nameOf = (m: Row["members"]) => {
    const v = Array.isArray(m) ? m[0] : m;
    return v?.full_name ?? "Anonymous";
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contributions</h1>
        <p className="text-sm text-muted-foreground">
          Tithes, offerings and donations. Cash is the default, nothing here
          requires mobile money.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {message}
        </p>
      )}
      {loadError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          Could not load contributions: {loadError.message}
        </p>
      )}

      {canWrite && (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-bold text-foreground">
              Collect by mobile money
            </h2>
            {paystack.configured ? (
              paystack.testMode && (
                <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  Test mode
                </span>
              )
            ) : (
              <span className="rounded bg-surface-soft px-2 py-1 text-xs font-semibold text-muted-foreground">
                Not connected
              </span>
            )}
          </div>

          {!paystack.configured ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Add{" "}
              <code className="rounded bg-surface-soft px-1.5 py-0.5 font-numeric text-xs">
                PAYSTACK_SECRET_KEY
              </code>{" "}
              to <code className="rounded bg-surface-soft px-1.5 py-0.5 font-numeric text-xs">.env</code>{" "}
              to collect tithes over MTN MoMo, Telecel Cash or AirtelTigo
              Money. Test keys are free from dashboard.paystack.com. Cash
              entry below keeps working either way.
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-muted-foreground">
                Sends a prompt to the member&rsquo;s phone. Nothing is counted
                as given until they approve it.
              </p>
              <form
                action={collectByMomo}
                className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
              >
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-foreground">
                    Network
                  </span>
                  <select name="provider" defaultValue="mtn" className={inputClass}>
                    {MOMO_PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-foreground">
                    Phone
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    placeholder="0244 000 000"
                    className={`${inputClass} font-numeric`}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-foreground">
                    Amount (GHS)
                  </span>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    className={`${inputClass} font-numeric`}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-foreground">Type</span>
                  <select name="type" defaultValue="tithe" className={inputClass}>
                    {CONTRIBUTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-foreground">
                    Member{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </span>
                  <select name="memberId" defaultValue="" className={inputClass}>
                    <option value="">Anonymous</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end sm:col-span-2 lg:col-span-5">
                  <Button type="submit">Send payment prompt</Button>
                </div>
              </form>
            </>
          )}
        </Card>
      )}

      {canWrite && pendingPayments.length > 0 && (
        <Card className="p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold text-foreground">
              Awaiting confirmation ({pendingPayments.length})
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              These are not counted as given yet. Check with Paystack if one
              seems stuck.
            </p>
          </div>
          <table className="w-full text-left text-sm">
            <tbody>
              {pendingPayments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-foreground">
                    {nameOf(p.members)}
                    <span className="block font-numeric text-xs text-muted-foreground">
                      {p.phone} · {p.provider.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-numeric font-bold text-foreground">
                    {cedis.format(Number(p.amount))}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {p.status === "failed" ? "Failed" : "Waiting"}
                    {p.gateway_response && (
                      <span className="block text-xs">{p.gateway_response}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={refreshPayment}>
                      <input type="hidden" name="reference" value={p.reference} />
                      <button className="text-xs font-medium text-primary hover:underline">
                        Check status
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {canWrite && (
      <Card>
        <h2 className="text-sm font-bold text-foreground">
          Record a contribution
        </h2>
        <form
          action={recordContribution}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Type</span>
            <select name="type" defaultValue="tithe" className={inputClass}>
              {CONTRIBUTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Amount (GHS)
            </span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className={`${inputClass} font-numeric`}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Method</span>
            <select
              name="paymentMethod"
              defaultValue="cash"
              className={inputClass}
            >
              {PAYMENT_METHODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Member{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <select name="memberId" defaultValue="" className={inputClass}>
              <option value="">Anonymous / general</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Fund{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <select name="fundId" defaultValue="" className={inputClass}>
              <option value="">Not earmarked</option>
              {funds.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Note{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <input name="note" className={inputClass} />
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-6">
            <Button type="submit">Record contribution</Button>
          </div>
        </form>
      </Card>
      )}

      {rows.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardLabel>Entries shown</CardLabel>
            <CardStat>{rows.length}</CardStat>
          </Card>
          <Card>
            <CardLabel>Total</CardLabel>
            <CardStat className="text-2xl">{cedis.format(total)}</CardStat>
          </Card>
          <Card>
            <CardLabel>Of which tithe</CardLabel>
            <CardStat className="text-2xl">{cedis.format(titheTotal)}</CardStat>
          </Card>
        </div>
      )}

      <Card className="p-0">
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No contributions recorded yet. Tithes entered here feed the monthly
            figure on your dashboard.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">From</th>
                  <th className="px-5 py-3 font-semibold">Method</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-muted-foreground">
                      {dateFmt.format(new Date(r.created_at))}
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {labelFor(CONTRIBUTION_TYPES, r.type)}
                      {r.note && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {r.note}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {nameOf(r.members)}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {labelFor(PAYMENT_METHODS, r.payment_method)}
                    </td>
                    <td className="px-5 py-3 text-right font-numeric font-bold text-foreground">
                      {cedis.format(Number(r.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
