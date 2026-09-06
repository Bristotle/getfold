import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { TRANSFER_STATUSES, labelFor } from "@/lib/constants";
import {
  requestTransfer,
  approveTransfer,
  rejectTransfer,
} from "./actions";

type TransferRow = {
  id: string;
  status: string;
  requested_at: string;
  resolved_at: string | null;
  members: { full_name: string } | { full_name: string }[] | null;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const one = <T,>(v: T | T[] | null): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : v;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-primary/10 text-primary",
  approved: "bg-success/10 text-success",
  rejected: "bg-surface-soft text-muted-foreground",
};

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const canRequest = can(membership.role, "people.write");
  const canResolve = can(membership.role, "transfers.manage");

  const supabase = await createClient();

  const [{ data, error: loadError }, { data: memberList }] = await Promise.all([
    supabase
      .from("member_transfers")
      .select("id, status, requested_at, resolved_at, members ( full_name )")
      .order("requested_at", { ascending: false })
      .limit(100),
    supabase
      .from("members")
      .select("id, full_name")
      .eq("status", "active")
      .order("full_name"),
  ]);

  const transfers = (data ?? []) as TransferRow[];
  const members = (memberList ?? []) as { id: string; full_name: string }[];
  const pending = transfers.filter((t) => t.status === "pending");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Transfers</h1>
        <p className="text-sm text-muted-foreground">
          When a member moves to another church. Approving marks them
          transferred out; their giving and attendance history stays with your
          records.
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
          Could not load transfers: {loadError.message}
        </p>
      )}

      {canRequest && (
      <Card>
        <h2 className="text-sm font-bold text-foreground">
          Request a transfer
        </h2>
        {members.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No active members to transfer.
          </p>
        ) : (
          <form action={requestTransfer} className="mt-4 flex flex-wrap gap-3">
            <select
              name="memberId"
              defaultValue=""
              required
              className={`${inputClass} max-w-xs flex-1`}
            >
              <option value="" disabled>
                Choose a member…
              </option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
            <Button type="submit">Request transfer</Button>
          </form>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          The receiving church does not need to use Fold, this records the
          request either way.
        </p>
      </Card>
      )}

      {canResolve && pending.length > 0 && (
        <Card>
          <h2 className="text-sm font-bold text-foreground">
            Awaiting a decision ({pending.length})
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {pending.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {one(t.members)?.full_name ?? "Unknown member"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requested {dateFmt.format(new Date(t.requested_at))}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={approveTransfer}>
                    <input type="hidden" name="id" value={t.id} />
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form action={rejectTransfer}>
                    <input type="hidden" name="id" value={t.id} />
                    <Button type="submit" size="sm" variant="secondary">
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-0">
        {transfers.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No transfers recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-5 py-3 font-semibold">Requested</th>
                  <th className="px-5 py-3 font-semibold">Resolved</th>
                  <th className="px-5 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground">
                      {one(t.members)?.full_name ?? "Unknown member"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {dateFmt.format(new Date(t.requested_at))}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {t.resolved_at
                        ? dateFmt.format(new Date(t.resolved_at))
                        : "-"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          STATUS_STYLES[t.status] ?? STATUS_STYLES.rejected
                        }`}
                      >
                        {labelFor(TRANSFER_STATUSES, t.status)}
                      </span>
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
