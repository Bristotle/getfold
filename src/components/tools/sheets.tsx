/**
 * The printable sheets. Plain black tables that survive a church office
 * printer, laid out to fit one A4 page each. No colour, no icons: a
 * count sheet that prints in purple looks like an advertisement.
 */

const cell = "border border-black/70 px-2 py-1.5 align-top text-[13px] leading-snug";
const head = `${cell} bg-black/5 font-semibold`;
const line = "border-b border-black/60";

function Field({ label, wide = false }: { label: string; wide?: boolean }) {
  return (
    <div className={`flex min-w-0 items-end gap-2 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-[13px] font-semibold leading-snug">{label}</span>
      <span className={`h-5 flex-1 ${line}`} />
    </div>
  );
}

function SheetTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <header className="border-b-2 border-black pb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{sub}</p>
      <h2 className="mt-1 font-serif text-2xl font-bold leading-tight">{title}</h2>
    </header>
  );
}

function Foot() {
  return (
    <p className="sheet-gap mt-4 text-[10px] text-black/60">
      Free from getfold.org/tools. Print as many as you need.
    </p>
  );
}

const frame = "print-sheet mx-auto max-w-3xl rounded-2xl border border-border bg-white p-6 text-black sm:p-8";

/* ----------------------------------------------------------------- */

export function StatisticalReturnSheet() {
  const membership = ["", "", "", "", ""];
  const vital = ["Baptisms", "Confirmations", "Marriages", "Deaths", "New members received", "Transferred in", "Transferred out"];
  const income = ["Tithe", "Offering", "Thanksgiving / harvest", "Building fund", "Welfare", "Other funds"];
  return (
    <section className={frame} aria-label="Statistical return template">
      <SheetTitle sub="Statistical return" title="Quarterly return of the congregation" />
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label="Church" wide />
        <Field label="Circuit / district / presbytery" wide />
        <Field label="Period from" />
        <Field label="to" />
        <Field label="Prepared by" />
        <Field label="Date" />
      </div>

      <h3 className="mt-5 text-[13px] font-bold uppercase tracking-wide">1. Membership at the end of the period</h3>
      <table className="mt-2 w-full border-collapse">
        <thead>
          <tr>
            <th className={`${head} text-left`}>Category (in your church&rsquo;s words)</th>
            <th className={`${head} w-20 text-right`}>Male</th>
            <th className={`${head} w-20 text-right`}>Female</th>
            <th className={`${head} w-20 text-right`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {membership.map((_, i) => (
            <tr key={i}>
              <td className={`${cell} h-8`} />
              <td className={cell} />
              <td className={cell} />
              <td className={cell} />
            </tr>
          ))}
          <tr>
            <td className={`${cell} font-semibold`}>Total membership</td>
            <td className={cell} />
            <td className={cell} />
            <td className={cell} />
          </tr>
        </tbody>
      </table>

      <div className="sheet-gap mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-wide">2. Attendance</h3>
          <table className="mt-2 w-full border-collapse">
            <tbody>
              {["Services held in the period", "Total attendance, all services", "Average attendance per service", "Highest attendance", "First-time visitors"].map((r) => (
                <tr key={r}>
                  <td className={cell}>{r}</td>
                  <td className={`${cell} w-24`} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-wide">3. Vital records and movement</h3>
          <table className="mt-2 w-full border-collapse">
            <tbody>
              {vital.map((r) => (
                <tr key={r}>
                  <td className={cell}>{r}</td>
                  <td className={`${cell} w-24`} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="mt-5 text-[13px] font-bold uppercase tracking-wide">4. Income by type</h3>
      <table className="mt-2 w-full border-collapse">
        <thead>
          <tr>
            <th className={`${head} text-left`}>Type</th>
            <th className={`${head} w-28 text-right`}>Cash (GHS)</th>
            <th className={`${head} w-28 text-right`}>Mobile money (GHS)</th>
            <th className={`${head} w-28 text-right`}>Total (GHS)</th>
          </tr>
        </thead>
        <tbody>
          {income.map((r) => (
            <tr key={r}>
              <td className={cell}>{r}</td>
              <td className={cell} />
              <td className={cell} />
              <td className={cell} />
            </tr>
          ))}
          <tr>
            <td className={`${cell} font-semibold`}>Total income</td>
            <td className={cell} />
            <td className={cell} />
            <td className={cell} />
          </tr>
        </tbody>
      </table>

      <div className="sheet-gap mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Secretary (signature)" />
        <Field label="Minister / pastor (signature)" />
      </div>
      <Foot />
    </section>
  );
}

/* ----------------------------------------------------------------- */

export function AttendanceSheet() {
  const rows = Array.from({ length: 22 });
  const cols = [1, 2, 3, 4, 5];
  return (
    <section className={frame} aria-label="Attendance sheet">
      <SheetTitle sub="Attendance register" title="Class, cell or group attendance" />
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label="Church" />
        <Field label="Class / cell / group" />
        <Field label="Leader" />
        <Field label="Period" />
      </div>
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr>
            <th className={`${head} w-8 text-right`}>#</th>
            <th className={`${head} text-left`}>Member</th>
            {cols.map((c) => (
              <th key={c} className={`${head} w-14 text-center`}>
                <span className="block text-[10px] font-normal">Date</span>
              </th>
            ))}
            <th className={`${head} w-14 text-center`}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, i) => (
            <tr key={i}>
              <td className={`${cell} h-7 text-right font-numeric text-black/60`}>{i + 1}</td>
              <td className={cell} />
              {cols.map((c) => (
                <td key={c} className={cell} />
              ))}
              <td className={cell} />
            </tr>
          ))}
          <tr>
            <td className={cell} />
            <td className={`${cell} font-semibold`}>Present at each service</td>
            {cols.map((c) => (
              <td key={c} className={cell} />
            ))}
            <td className={`${cell} bg-black/5`} />
          </tr>
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-black/70">
        Tick for present. Total each column for the service headcount, each row to see who has been absent.
      </p>
      <Foot />
    </section>
  );
}

/* ----------------------------------------------------------------- */

export function OfferingCountSheet() {
  const notes = [200, 100, 50, 20, 10, 5, 2, 1];
  const coins = ["GHS 2", "GHS 1", "50 Gp", "20 Gp", "10 Gp"];
  const funds = ["Main offering", "Tithe (cash)", "Thanksgiving / harvest", "Building fund", "Welfare", "Other"];
  return (
    <section className={frame} aria-label="Offering count sheet">
      <SheetTitle sub="Offering count" title="Cash count and allocation" />
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label="Church" />
        <Field label="Service and date" />
      </div>

      <div className="sheet-gap mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-wide">1. Notes</h3>
          <table className="mt-2 w-full border-collapse">
            <thead>
              <tr>
                <th className={`${head} text-left`}>Note</th>
                <th className={`${head} w-16 text-right`}>Count</th>
                <th className={`${head} w-24 text-right`}>Value (GHS)</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => (
                <tr key={n}>
                  <td className={`${cell} font-numeric`}>GHS {n}</td>
                  <td className={cell} />
                  <td className={cell} />
                </tr>
              ))}
              <tr>
                <td className={`${cell} font-semibold`} colSpan={2}>Notes total</td>
                <td className={cell} />
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="text-[13px] font-bold uppercase tracking-wide">2. Coins</h3>
          <table className="mt-2 w-full border-collapse">
            <thead>
              <tr>
                <th className={`${head} text-left`}>Coin</th>
                <th className={`${head} w-16 text-right`}>Count</th>
                <th className={`${head} w-24 text-right`}>Value (GHS)</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((c) => (
                <tr key={c}>
                  <td className={`${cell} font-numeric`}>{c}</td>
                  <td className={cell} />
                  <td className={cell} />
                </tr>
              ))}
              <tr>
                <td className={`${cell} font-semibold`} colSpan={2}>Coins total</td>
                <td className={cell} />
              </tr>
              <tr>
                <td className={`${cell} font-semibold`} colSpan={2}>Cash total (notes + coins)</td>
                <td className={`${cell} bg-black/5`} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="mt-5 text-[13px] font-bold uppercase tracking-wide">3. Allocation by fund</h3>
      <table className="mt-2 w-full border-collapse">
        <thead>
          <tr>
            <th className={`${head} text-left`}>Fund</th>
            <th className={`${head} w-28 text-right`}>Cash (GHS)</th>
            <th className={`${head} w-32 text-right`}>Mobile money since last count (GHS)</th>
            <th className={`${head} w-28 text-right`}>Total (GHS)</th>
          </tr>
        </thead>
        <tbody>
          {funds.map((f) => (
            <tr key={f}>
              <td className={cell}>{f}</td>
              <td className={cell} />
              <td className={cell} />
              <td className={cell} />
            </tr>
          ))}
          <tr>
            <td className={`${cell} font-semibold`}>Grand total</td>
            <td className={cell} />
            <td className={cell} />
            <td className={`${cell} bg-black/5`} />
          </tr>
        </tbody>
      </table>

      <div className="sheet-gap mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Counted by (1)" />
        <Field label="Counted by (2)" />
        <Field label="Received by treasurer" />
        <Field label="Banked on / to" />
      </div>
      <p className="mt-3 text-[11px] text-black/70">
        Always count with two people present. Both sign. The cash total must equal the fund allocation total.
      </p>
      <Foot />
    </section>
  );
}

/* ----------------------------------------------------------------- */

export function MembershipForm() {
  return (
    <section className={frame} aria-label="Membership form">
      <SheetTitle sub="Membership form" title="New member registration" />
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <Field label="Church" wide />
      </div>

      <h3 className="mt-5 text-[13px] font-bold uppercase tracking-wide">1. About you</h3>
      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Surname" />
        <Field label="Other names" />
        <Field label="Sex" />
        <Field label="Date of birth" />
        <Field label="Phone" />
        <Field label="Other phone / WhatsApp" />
        <Field label="Email (optional)" wide />
        <Field label="Residence (town and area)" wide />
        <Field label="Hometown" />
        <Field label="Occupation" />
        <Field label="Marital status" />
        <Field label="Spouse's name (if any)" />
      </div>

      <h3 className="mt-6 text-[13px] font-bold uppercase tracking-wide">2. Your church history</h3>
      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Baptised?  Yes / No     Date" />
        <Field label="Church of baptism" />
        <Field label="Confirmed?  Yes / No     Date" />
        <Field label="Previous church (if transferring)" />
        <Field label="Transfer letter attached?  Yes / No" wide />
      </div>

      <h3 className="mt-6 text-[13px] font-bold uppercase tracking-wide">3. For the church office</h3>
      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Field label="Membership category" />
        <Field label="Class / cell / group" />
        <Field label="Date received" />
        <Field label="Entered on register by" />
      </div>

      <div className="mt-6 rounded border border-black/60 p-3 text-[11px] leading-snug">
        <p className="font-semibold">Why we ask for this</p>
        <p className="mt-1">
          This church keeps a register of its members so that it can care for them, keep in touch, record baptisms, confirmations, marriages and funerals, and report its membership to the church body it belongs to. Under the Data Protection Act, 2012 (Act 843) the church is the data controller for this information. It is kept securely, used for church purposes only, and never sold or shared for marketing. You may ask at any time to see what is held about you or to have it corrected.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Signature" />
          <Field label="Date" />
        </div>
      </div>
      <Foot />
    </section>
  );
}
