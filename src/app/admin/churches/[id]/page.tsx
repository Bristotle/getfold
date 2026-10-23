import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { AdminHeader } from "@/components/admin/admin-header";
import { ROLE_LABELS } from "@/lib/permissions";
import { STATUS_LABEL, type DirectoryRow } from "@/lib/platform";
import { openChurch, closeChurch, recordPayment } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Church, Fold", robots: { index: false, follow: false } };

/**
 * One church, read only, for support.
 *
 * Nothing inside the church is readable until the church is opened with
 * start_platform_view(), which grants it for an hour and logs it in the
 * church's own activity log. Until then this page shows only the directory
 * line and the button, and row level security would return nothing anyway.
 *
 * Every query below names the church explicitly. The founder also belongs
 * to their own church, and an unfiltered query would mix the two.
 */

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const stamp = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const cedis = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
});

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v);

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <Card className="mt-4 min-w-0">
      <h2 className="text-sm font-bold text-foreground">
        {title}
        {count !== undefined && (
          <span className="ml-2 font-numeric font-normal text-muted-foreground">{count}</span>
        )}
      </h2>
      <div className="mt-3 min-w-0 text-sm">{children}</div>
    </Card>
  );
}

/*
  For a church that paid outside the website: mobile money to Fold's
  number, a bank transfer, cash in hand. Plain HTML, no JavaScript, so the
  amount is typed rather than filled in from the band; the prices sit
  beside it to copy from.
*/
function RecordPayment({ id, trialEndsAt }: { id: string; trialEndsAt: string | null }) {
  const today = new Date().toISOString().slice(0, 10);
  const from =
    trialEndsAt && new Date(trialEndsAt) > new Date() ? trialEndsAt.slice(0, 10) : today;
  const field =
    "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";
  return (
    <details className="mt-4 rounded-xl border border-border bg-surface p-4">
      <summary className="cursor-pointer text-sm font-semibold text-foreground">
        Record a payment made outside the website
      </summary>
      <p className="mt-2 text-xs text-muted-foreground">
        For mobile money sent to Fold&rsquo;s number, a bank transfer or cash. It
        marks the church as paid for the period, adds a paid invoice to their
        Billing page, notes it in their activity log and emails the pastor a
        receipt. Quarter: Society GHS 447, Society Plus GHS 897, Large Society
        GHS 1,497. Year (ten months&rsquo; price): GHS 1,490, 2,990, 4,990.
      </p>
      <form action={recordPayment} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={id} />
        <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
          Band
          <select name="band" required defaultValue="Society Plus" className={field}>
            <option>Society</option>
            <option>Society Plus</option>
            <option>Large Society</option>
            <option>Circuit and above</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
          For
          <select name="months" defaultValue="3" className={field}>
            <option value="3">A quarter (3 months)</option>
            <option value="12">A year (12 months)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
          Amount received (GHS)
          <input name="amount" inputMode="decimal" required placeholder="897" className={`${field} font-numeric`} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
          Paid by
          <select name="method" defaultValue="momo" className={field}>
            <option value="momo">Mobile money</option>
            <option value="bank">Bank transfer</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
          Transaction ID or reference
          <input name="reference" maxLength={120} placeholder="From the MoMo message" className={`${field} font-numeric`} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground">
          Paid on
          <input name="paidOn" type="date" defaultValue={today} className={`${field} font-numeric`} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-foreground sm:col-span-2">
          Cover starts
          <input name="startsOn" type="date" defaultValue={from} className={`${field} font-numeric`} />
          <span className="font-normal text-muted-foreground">
            Defaults to the end of their trial or current cover, so no days they
            already have are lost.
          </span>
        </label>
        <div className="sm:col-span-2">
          <SubmitButton pendingLabel="Recording…">Record payment</SubmitButton>
        </div>
      </form>
    </details>
  );
}

function Empty() {
  return <p className="text-muted-foreground">None.</p>;
}

export default async function ChurchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { id } = await params;
  const { error, message } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dir, error: dirError } = await supabase.rpc("platform_church_directory");
  if (dirError) redirect("/dashboard");
  const church = ((dir ?? []) as DirectoryRow[]).find((r) => r.organization_id === id);
  if (!church) notFound();

  const [{ data: open }, { data: canBill }] = await Promise.all([
    supabase.rpc("platform_view_orgs"),
    supabase.rpc("can_record_payments"),
  ]);
  const isOpen = ((open ?? []) as string[]).includes(id);

  const header = (
    <>
      <AdminHeader current="/admin/churches" />
      <h1 className="mt-8 text-xl font-bold text-foreground">{church.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {STATUS_LABEL[church.subscription_status] ?? church.subscription_status}
        {church.trial_ends_at && ` until ${day.format(new Date(church.trial_ends_at))}`} ·{" "}
        <span className="font-numeric">{church.member_count}</span> members ·{" "}
        {church.pastor_email ?? "no pastor"} · joined {day.format(new Date(church.created_at))}
      </p>
      {error && (
        <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">{error}</p>
      )}
      {message && (
        <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success-text">{message}</p>
      )}
      {canBill === true && <RecordPayment id={id} trialEndsAt={church.trial_ends_at} />}
    </>
  );

  if (!isOpen) {
    return (
      <main id="main" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {header}
        <Card className="mt-6">
          <p className="text-sm text-foreground">
            Opening this church shows its register, attendance, giving,
            messages and team, read only, for up to an hour.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            It is recorded in {church.name}&rsquo;s activity log as &ldquo;Fold
            support opened your church&rsquo;s records&rdquo;, which their
            pastor and administrators can see.
          </p>
          <form action={openChurch} className="mt-4">
            <input type="hidden" name="id" value={id} />
            <SubmitButton>Open read only</SubmitButton>
          </form>
        </Card>
      </main>
    );
  }

  const [team, members, attendance, giving, messages, invoices, activity] = await Promise.all([
    supabase
      .from("organization_members")
      .select("role, created_at, profiles ( full_name, phone )")
      .eq("organization_id", id)
      .order("created_at"),
    supabase
      .from("members")
      .select("id, full_name, phone, status, member_type", { count: "exact" })
      .eq("organization_id", id)
      .order("full_name")
      .limit(300),
    supabase
      .from("attendance_records")
      .select("id, date, service_type, male_count, female_count")
      .eq("organization_id", id)
      .order("date", { ascending: false })
      .limit(20),
    supabase
      .from("contributions")
      .select("id, type, amount, payment_method, created_at, members ( full_name )")
      .eq("organization_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("notifications")
      .select("id, type, channel, recipient, status, error, created_at")
      .eq("organization_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("invoices")
      .select("id, band_name, amount_pesewas, status, period_start, period_end, paid_at")
      .eq("organization_id", id)
      .order("period_start", { ascending: false })
      .limit(10),
    supabase
      .from("activity_log")
      .select("id, actor_name, action, summary, created_at")
      .eq("organization_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <main id="main" className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {header}

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface-soft px-3 py-2 text-xs text-muted-foreground">
        <span className="min-w-0 flex-1">
          Open read only. Nothing here can be changed, and the view closes by
          itself within the hour.
        </span>
        <form action={closeChurch}>
          <input type="hidden" name="id" value={id} />
          <SubmitButton size="xs" variant="secondary">Close</SubmitButton>
        </form>
      </div>

      <Section title="Team" count={team.data?.length ?? 0}>
        {(team.data ?? []).length === 0 ? <Empty /> : (
          <ul className="divide-y divide-border">
            {(team.data as { role: string; profiles: unknown }[]).map((t, i) => {
              const p = one(t.profiles as { full_name: string | null; phone: string | null } | null);
              return (
                <li key={i} className="flex flex-wrap justify-between gap-2 py-2">
                  <span className="text-foreground">{p?.full_name ?? "No name"}</span>
                  <span className="text-muted-foreground">
                    {ROLE_LABELS[t.role] ?? t.role}
                    {p?.phone && <span className="ml-2 font-numeric">{p.phone}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="Members" count={members.count ?? 0}>
        {(members.data ?? []).length === 0 ? <Empty /> : (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto">
            {(members.data as { id: string; full_name: string; phone: string | null; status: string; member_type: string | null }[]).map((m) => (
              <li key={m.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="text-foreground">
                  {m.full_name}
                  {m.status !== "active" && <span className="ml-2 text-xs text-muted-foreground">{m.status}</span>}
                </span>
                <span className="text-muted-foreground">
                  {m.member_type}
                  {m.phone && <span className="ml-2 font-numeric">{m.phone}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
        {(members.count ?? 0) > 300 && (
          <p className="mt-2 text-xs text-muted-foreground">Showing the first 300 by name.</p>
        )}
      </Section>

      <Section title="Recent services">
        {(attendance.data ?? []).length === 0 ? <Empty /> : (
          <ul className="divide-y divide-border">
            {(attendance.data as { id: string; date: string; service_type: string; male_count: number; female_count: number }[]).map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="text-foreground">
                  {day.format(new Date(a.date))} · {a.service_type.replace(/_/g, " ")}
                </span>
                <span className="font-numeric text-muted-foreground">
                  {a.male_count + a.female_count} ({a.male_count} men, {a.female_count} women)
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Recent giving">
        {(giving.data ?? []).length === 0 ? <Empty /> : (
          <ul className="divide-y divide-border">
            {(giving.data as { id: string; type: string; amount: string | number; payment_method: string | null; created_at: string; members: unknown }[]).map((g) => (
              <li key={g.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="text-foreground">
                  {one(g.members as { full_name: string } | null)?.full_name ?? "Not attributed"} · {g.type}
                  {g.payment_method && <span className="text-muted-foreground"> · {g.payment_method.replace(/_/g, " ")}</span>}
                </span>
                <span className="text-muted-foreground">
                  <span className="font-numeric text-foreground">{cedis.format(Number(g.amount))}</span>{" "}
                  {stamp.format(new Date(g.created_at))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Recent messages">
        {(messages.data ?? []).length === 0 ? <Empty /> : (
          <ul className="divide-y divide-border">
            {(messages.data as { id: string; type: string; channel: string; recipient: string; status: string; error: string | null; created_at: string }[]).map((n) => (
              <li key={n.id} className="py-2">
                <span className="flex flex-wrap justify-between gap-2">
                  <span className="text-foreground">
                    {n.type.replace(/_/g, " ")}
                    {n.channel === "whatsapp" && " (WhatsApp)"} ·{" "}
                    <span className="font-numeric">{n.recipient}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {n.status} · {stamp.format(new Date(n.created_at))}
                  </span>
                </span>
                {n.error && <span className="block text-xs text-danger-text">{n.error}</span>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Invoices">
        {(invoices.data ?? []).length === 0 ? <Empty /> : (
          <ul className="divide-y divide-border">
            {(invoices.data as { id: string; band_name: string | null; amount_pesewas: number; status: string; period_start: string; period_end: string; paid_at: string | null }[]).map((v) => (
              <li key={v.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="text-foreground">
                  {v.band_name ?? "Band"} · {day.format(new Date(v.period_start))} to {day.format(new Date(v.period_end))}
                </span>
                <span className="text-muted-foreground">
                  <span className="font-numeric text-foreground">{cedis.format(v.amount_pesewas / 100)}</span> {v.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Activity">
        {(activity.data ?? []).length === 0 ? <Empty /> : (
          <ul className="divide-y divide-border">
            {(activity.data as { id: string; actor_name: string; action: string; summary: string; created_at: string }[]).map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="min-w-0 text-foreground">
                  {a.actor_name} {a.action} · <span className="text-muted-foreground">{a.summary}</span>
                </span>
                <span className="text-muted-foreground">{stamp.format(new Date(a.created_at))}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </main>
  );
}
