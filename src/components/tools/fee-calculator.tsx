"use client";

import { useState } from "react";

/**
 * The giving fee calculator.
 *
 * One rate, because the processors in Ghana cluster at it: Paystack charges
 * 1.95 percent on mobile money and local cards with no monthly fee and no
 * minimum. The E-Levy on transfers ended in April 2025, so it is not
 * modelled. If a processor with a minimum fee is added, MIN_FEE is the
 * only thing to change.
 */
const RATE = 0.0195;
const MIN_FEE = 0;

const COMMON = [10, 20, 50, 100, 200, 500, 1000];

// "GHS 98.05", the way the rest of the site writes money, not the ₵ sign.
const ghs = (n: number) =>
  `GHS ${new Intl.NumberFormat("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;

function fee(amount: number) {
  return Math.max(amount * RATE, MIN_FEE);
}

export function FeeCalculator() {
  const [amount, setAmount] = useState(100);
  const [givers, setGivers] = useState(60);
  const [perMonth, setPerMonth] = useState(2);

  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
  const f = fee(safeAmount);
  const received = safeAmount - f;
  const gifts = Math.max(0, givers) * Math.max(0, perMonth);
  const monthGiven = safeAmount * gifts;
  const monthFee = f * gifts;

  const inputClass =
    "min-h-11 w-full rounded-lg border border-border bg-background px-3 font-numeric text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="min-w-0">
          <label htmlFor="fc-amount" className="block text-sm font-semibold text-foreground">
            A typical gift (GHS)
          </label>
          <input
            id="fc-amount"
            type="number"
            inputMode="decimal"
            min={1}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.valueAsNumber)}
            className={`mt-2 ${inputClass}`}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {COMMON.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAmount(c)}
                className={`rounded-full border px-2.5 py-1 font-numeric text-xs font-medium transition-colors ${
                  c === amount
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <label htmlFor="fc-givers" className="block text-sm font-semibold text-foreground">
            Members giving by mobile money
          </label>
          <input
            id="fc-givers"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={givers}
            onChange={(e) => setGivers(e.target.valueAsNumber)}
            className={`mt-2 ${inputClass}`}
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="fc-per" className="block text-sm font-semibold text-foreground">
            Gifts per member per month
          </label>
          <input
            id="fc-per"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={perMonth}
            onChange={(e) => setPerMonth(e.target.valueAsNumber)}
            className={`mt-2 ${inputClass}`}
          />
        </div>
      </div>

      <dl className="mt-7 grid gap-4 sm:grid-cols-3" aria-live="polite">
        <div className="min-w-0 rounded-xl border border-border bg-background p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fee on one gift</dt>
          <dd className="m-0 mt-1 font-numeric text-2xl font-bold text-foreground">{ghs(f)}</dd>
          <p className="mt-1 text-xs text-muted-foreground">1.95% of {ghs(safeAmount)}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-teal/40 bg-teal-soft p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-teal-text">Church receives per gift</dt>
          <dd className="m-0 mt-1 font-numeric text-2xl font-bold text-foreground">{ghs(received)}</dd>
          <p className="mt-1 text-xs text-muted-foreground">Settled to the church&rsquo;s own account</p>
        </div>
        <div className="min-w-0 rounded-xl border border-border bg-background p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Per month</dt>
          <dd className="m-0 mt-1 font-numeric text-2xl font-bold text-foreground">{ghs(monthGiven - monthFee)}</dd>
          <p className="mt-1 font-numeric text-xs text-muted-foreground">
            {gifts} gifts, {ghs(monthGiven)} given, {ghs(monthFee)} in fees
          </p>
        </div>
      </dl>

      <div className="mt-7 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <caption className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Common amounts
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-2 font-semibold">Gift</th>
              <th className="py-2 text-right font-semibold">Fee</th>
              <th className="py-2 text-right font-semibold">Church receives</th>
            </tr>
          </thead>
          <tbody className="font-numeric">
            {COMMON.map((c) => (
              <tr key={c} className="border-b border-border/60">
                <td className="py-2">{ghs(c)}</td>
                <td className="py-2 text-right text-muted-foreground">{ghs(fee(c))}</td>
                <td className="py-2 text-right font-semibold text-foreground">{ghs(c - fee(c))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Rate: Paystack Ghana, 1.95% per mobile money or local card transaction, no monthly fee, no minimum. The E-Levy was abolished in April 2025. Check your processor&rsquo;s current rates; this is arithmetic, not a quote.
      </p>
    </div>
  );
}
