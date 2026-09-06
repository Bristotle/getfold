import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { createFund, updateFund, deleteFund } from "./actions";

type FundRow = {
  id: string;
  name: string;
  description: string | null;
  target_amount: string | number | null;
  current_amount: string | number;
};

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const cedis = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export default async function FundsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; edit?: string }>;
}) {
  const { error, message, edit } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  // RLS already returns nothing to these roles; redirecting is clearer than
  // rendering an empty page that looks broken.
  if (!can(membership.role, "finance.view")) redirect("/dashboard");

  const canWrite = can(membership.role, "finance.write");

  const supabase = await createClient();
  const { data, error: loadError } = await supabase
    .from("funds")
    .select("id, name, description, target_amount, current_amount")
    .order("name");

  const funds = (data ?? []) as FundRow[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Funds</h1>
        <p className="text-sm text-muted-foreground">
          Building projects, missions, welfare, anything you collect towards.
          Totals update automatically as contributions are recorded against
          them.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success-text">
          {message}
        </p>
      )}
      {loadError && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">
          Could not load funds: {loadError.message}
        </p>
      )}

      {canWrite && (
      <Card>
        <h2 className="text-sm font-bold text-foreground">Create a fund</h2>
        <form
          action={createFund}
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">Name</span>
            <input
              name="name"
              required
              placeholder="e.g. Church Building Fund"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Target (GHS){" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <input
              name="targetAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={`${inputClass} font-numeric`}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-foreground">
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>
            <input name="description" className={inputClass} />
          </label>
          <div className="flex items-end">
            <SubmitButton className="w-full">
              Create fund
            </SubmitButton>
          </div>
        </form>
      </Card>
      )}

      {funds.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            No funds yet. Create one above, then choose it when recording a
            contribution.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {funds.map((f) => {
            const current = Number(f.current_amount);
            const target = f.target_amount ? Number(f.target_amount) : null;
            const pct =
              target && target > 0
                ? Math.min(100, Math.round((current / target) * 100))
                : null;
            const isEditing = canWrite && edit === f.id;

            return (
              <Card key={f.id}>
                {isEditing ? (
                  <form action={updateFund} className="flex flex-col gap-3">
                    <input type="hidden" name="id" value={f.id} />
                    <input
                      name="name"
                      defaultValue={f.name}
                      required
                      className={inputClass}
                    />
                    <input
                      name="description"
                      defaultValue={f.description ?? ""}
                      placeholder="Description"
                      className={inputClass}
                    />
                    <input
                      name="targetAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={target ?? ""}
                      placeholder="Target (GHS)"
                      className={`${inputClass} font-numeric`}
                    />
                    <div className="flex gap-2">
                      <SubmitButton size="sm">
                        Save
                      </SubmitButton>
                      <Link
                        href="/funds"
                        className="inline-flex h-8 items-center px-3 text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          {f.name}
                        </h3>
                        {f.description && (
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {f.description}
                          </p>
                        )}
                      </div>
                      {canWrite && (
                        <Link
                          href={`/funds?edit=${f.id}`}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </Link>
                      )}
                    </div>

                    <p className="mt-4 font-numeric text-2xl font-bold text-foreground">
                      {cedis.format(current)}
                    </p>
                    {target ? (
                      <>
                        <p className="text-xs text-muted-foreground">
                          of {cedis.format(target)} target
                        </p>
                        <div
                          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-soft"
                          role="progressbar"
                          aria-valuenow={pct ?? 0}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${f.name} progress`}
                        >
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {pct}% of target
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No target set
                      </p>
                    )}

                    {canWrite && (
                      <form action={deleteFund} className="mt-4">
                        <input type="hidden" name="id" value={f.id} />
                        <Button type="submit" variant="destructive" size="xs">
                          Delete fund
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
