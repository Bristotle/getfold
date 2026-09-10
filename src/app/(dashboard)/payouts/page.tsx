import { redirect } from "next/navigation";
import { ShieldCheck, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Select, StatusBanner } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { listSettlementOptions, paystackStatus } from "@/lib/paystack";
import { setSettlement } from "./actions";

export const metadata = { title: "Where giving is paid, Fold" };

export default async function PayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  const mayManage = can(membership.role, "org.manage");
  const paystack = paystackStatus();

  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("settlement_type, settlement_label, settlement_updated_at, paystack_subaccount_code")
    .eq("id", membership.organization.id)
    .maybeSingle();

  const options = paystack.configured ? await listSettlementOptions() : [];
  const momo = options.filter((o) => o.type === "momo");
  const banks = options.filter((o) => o.type === "bank");
  const isSet = Boolean(org?.paystack_subaccount_code);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Where giving is paid
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          When a member gives by mobile money, the money is paid straight to
          your church. It does not pass through Fold at any point, and we
          never hold it.
        </p>
      </div>

      <StatusBanner error={error} message={message} />

      {/* ---------- the promise, made concrete ---------- */}
      <Card>
        <div className="flex gap-3.5">
          <span aria-hidden="true" className="mt-0.5 shrink-0 text-primary">
            <ShieldCheck size={20} strokeWidth={1.9} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Your money never touches ours
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              We record the destination with our payment processor, and they
              settle directly to you. Fold keeps a reference and the last four
              digits so you can check it is right. We do not store your full
              account number, and we take nothing from what your members
              give.
            </p>
          </div>
        </div>
      </Card>

      {/* ---------- current state ---------- */}
      {isSet && (
        <Card>
          <h2 className="text-base font-bold text-foreground">
            Currently paid to
          </h2>
          <p className="mt-2 font-numeric text-lg font-bold text-foreground">
            {org?.settlement_label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {org?.settlement_type === "momo" ? "Mobile money" : "Bank account"}
            {org?.settlement_updated_at
              ? `, set ${new Date(org.settlement_updated_at).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}`
              : ""}
          </p>
        </Card>
      )}

      {/* ---------- the form ---------- */}
      {!paystack.configured ? (
        <Card>
          <div className="flex gap-3.5">
            <span aria-hidden="true" className="mt-0.5 shrink-0 text-warning-text">
              <Info size={20} strokeWidth={1.9} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Mobile money giving is not switched on yet
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Cash giving works as normal and needs nothing set up here.
                When mobile money is available we will ask you where it should
                be paid.
              </p>
            </div>
          </div>
        </Card>
      ) : !mayManage ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Only the pastor or an administrator can change where giving is
            paid. Ask them if this needs updating.
          </p>
        </Card>
      ) : (
        <Card>
          <h2 className="text-base font-bold text-foreground">
            {isSet ? "Change the destination" : "Set the destination"}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Mobile money or a bank account, whichever your church actually
            uses. Put it in the church&apos;s name rather than an
            individual&apos;s, so it survives a change of treasurer.
          </p>

          <form action={setSettlement} className="mt-5 flex flex-col gap-4 sm:max-w-md">
            <Select label="Pay giving into" name="bankCode" required>
              <option value="">Choose one</option>
              {momo.length > 0 && (
                <optgroup label="Mobile money">
                  {momo.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {banks.length > 0 && (
                <optgroup label="Bank">
                  {banks.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </Select>

            <Input
              label="Account or mobile money number"
              name="accountNumber"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder="0244 000 000"
              className="font-numeric"
              hint="We check it with the payment processor before saving, and we do not keep the number itself."
            />

            <SubmitButton pendingLabel="Checking the account…">
              {isSet ? "Update destination" : "Save destination"}
            </SubmitButton>
          </form>
        </Card>
      )}
    </div>
  );
}
