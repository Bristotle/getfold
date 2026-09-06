/**
 * A recreation of the real dashboard, built in CSS rather than screenshotted.
 *
 * Sharper than an image at any density, adapts to mobile, works in both
 * themes, and stays honest — the figures and labels below mirror what the
 * product actually shows. Marked as an example so nobody mistakes it for a
 * particular church's real numbers.
 */
export function DashboardPreview() {
  const tiles = [
    { label: "Active members", value: "248" },
    { label: "This week's attendance", value: "312" },
    { label: "This month's tithe", value: "GHS 8,450" },
    { label: "Pending transfers", value: "2" },
  ];

  const classes = [
    { name: "Wesley Bible Class", count: 42, pct: 100 },
    { name: "Ebenezer Class", count: 38, pct: 90 },
    { name: "Grace Fellowship", count: 31, pct: 74 },
    { name: "Youth Fellowship", count: 27, pct: 64 },
  ];

  return (
    <div
      aria-label="Example of the Fold dashboard"
      className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_18px_50px_-24px_rgba(26,16,51,0.28)]"
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-soft px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-3 truncate font-numeric text-[11px] text-muted-foreground">
          getfold.org/dashboard
        </span>
      </div>

      {/* app header */}
      <div className="border-b border-border px-5 py-3.5">
        <p className="text-sm font-bold text-foreground">
          Shekinah Prayer Ministry International
        </p>
        <p className="text-xs text-muted-foreground">Administrator</p>
      </div>

      {/* nav */}
      <div className="flex gap-1 overflow-hidden border-b border-border px-3">
        {["Dashboard", "Members", "Groups", "Attendance", "Giving", "Reports"].map(
          (item, i) => (
            <span
              key={item}
              className={`whitespace-nowrap border-b-2 px-2.5 py-2 text-xs font-medium ${
                i === 0
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {item}
            </span>
          )
        )}
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((t) => (
            <div
              key={t.label}
              className="rounded-lg border border-border bg-surface p-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t.label}
              </p>
              <p className="mt-1 font-numeric text-lg font-bold text-foreground">
                {t.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Membership by class
          </p>
          <div className="mt-3 flex flex-col gap-2.5">
            {classes.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-xs text-foreground sm:w-40">
                  {c.name}
                </span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-soft">
                  <span
                    className="block h-full rounded-full bg-primary/70"
                    style={{ width: `${c.pct}%` }}
                  />
                </span>
                <span className="w-7 shrink-0 text-right font-numeric text-xs text-muted-foreground">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
