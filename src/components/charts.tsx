/**
 * Charts, drawn as SVG and CSS rather than with a charting library.
 *
 * Recharts or Chart.js would add well over a hundred kilobytes of
 * JavaScript to a dashboard a church secretary opens on a phone on mobile
 * data. These are bar charts of at most a dozen values, which SVG draws
 * perfectly well, and drawing them on the server means the figures are on
 * screen in the first paint with no hydration at all.
 *
 * Colour carries meaning rather than decoration: female and male keep the
 * same two hues everywhere they appear, and giving types keep theirs, so a
 * reader learns the key once.
 */

export const SERIES = {
  female: "#7c4dff",
  male: "#00b3a4",
  attendance: "#6b2fd9",
  tithe: "#0cce6b",
  offering: "#ffa400",
  other: "#ff6b9d",
} as const;

function niceMax(values: number[]) {
  const max = Math.max(1, ...values);
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / pow) * pow;
}

/** A single series of bars over time. Attendance, giving, anything ordered. */
export function BarSeries({
  data,
  color,
  format,
  label,
}: {
  data: { label: string; value: number }[];
  color: string;
  format?: (n: number) => string;
  label: string;
}) {
  if (data.length === 0) return null;
  const max = niceMax(data.map((d) => d.value));
  const fmt = format ?? ((n: number) => String(n));

  return (
    <figure className="m-0">
      <figcaption className="sr-only">{label}</figcaption>
      <div className="flex items-end gap-1.5" style={{ height: "9rem" }}>
        {data.map((d) => {
          const pct = max === 0 ? 0 : (d.value / max) * 100;
          return (
            <div
              key={d.label}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
              style={{ height: "100%" }}
            >
              <span className="font-numeric text-[10px] font-semibold text-foreground/70">
                {d.value > 0 ? fmt(d.value) : ""}
              </span>
              <div
                title={`${d.label}: ${fmt(d.value)}`}
                className="w-full rounded-t-[3px] transition-all"
                style={{
                  height: `${Math.max(pct, d.value > 0 ? 3 : 0)}%`,
                  background: color,
                  minHeight: d.value > 0 ? 3 : 0,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 border-t border-border pt-2">
        {data.map((d) => (
          <span
            key={d.label}
            className="min-w-0 flex-1 truncate text-center font-numeric text-[10px] text-muted-foreground"
          >
            {d.label}
          </span>
        ))}
      </div>
    </figure>
  );
}

/** Two series side by side per category. Female and male, tithe and offering. */
export function GroupedBars({
  data,
  keys,
  label,
  format,
}: {
  data: { label: string; values: number[] }[];
  keys: { name: string; color: string }[];
  label: string;
  format?: (n: number) => string;
}) {
  if (data.length === 0) return null;
  const max = niceMax(data.flatMap((d) => d.values));
  const fmt = format ?? ((n: number) => String(n));

  return (
    <figure className="m-0">
      <figcaption className="sr-only">{label}</figcaption>
      <div className="flex items-end gap-2.5" style={{ height: "9rem" }}>
        {data.map((d) => (
          <div
            key={d.label}
            className="flex min-w-0 flex-1 items-end justify-center gap-[3px]"
            style={{ height: "100%" }}
          >
            {d.values.map((v, i) => (
              <div
                key={keys[i].name}
                title={`${d.label}, ${keys[i].name}: ${fmt(v)}`}
                className="w-full max-w-[1.4rem] rounded-t-[3px]"
                style={{
                  height: `${max === 0 ? 0 : Math.max((v / max) * 100, v > 0 ? 3 : 0)}%`,
                  background: keys[i].color,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2.5 border-t border-border pt-2">
        {data.map((d) => (
          <span
            key={d.label}
            className="min-w-0 flex-1 truncate text-center text-[10px] text-muted-foreground"
          >
            {d.label}
          </span>
        ))}
      </div>
      <ul className="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
        {keys.map((k) => (
          <li key={k.name} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: k.color }}
            />
            <span className="text-xs text-muted-foreground">{k.name}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** A horizontal split bar. Good for one total divided into parts. */
export function SplitBar({
  parts,
  format,
  label,
}: {
  parts: { name: string; value: number; color: string }[];
  format?: (n: number) => string;
  label: string;
}) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  if (total === 0) return null;
  const fmt = format ?? ((n: number) => String(n));

  return (
    <figure className="m-0">
      <figcaption className="sr-only">{label}</figcaption>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-soft">
        {parts.map((p) =>
          p.value > 0 ? (
            <span
              key={p.name}
              title={`${p.name}: ${fmt(p.value)}`}
              style={{
                width: `${(p.value / total) * 100}%`,
                background: p.color,
              }}
            />
          ) : null
        )}
      </div>
      <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
        {parts.map((p) => (
          <li key={p.name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: p.color }}
              />
              <span className="truncate text-sm text-foreground/80">
                {p.name}
              </span>
            </span>
            <span className="shrink-0 font-numeric text-sm font-semibold tabular-nums text-foreground">
              {fmt(p.value)}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
