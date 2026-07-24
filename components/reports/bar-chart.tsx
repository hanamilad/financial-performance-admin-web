export type BarDatum = {
  label: string;
  value: number;
  display: string;
};

export function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(...data.map((datum) => datum.value), 1);

  return (
    <div className="flex flex-col gap-3">
      {data.map((datum) => (
        <div key={datum.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm sm:w-40" title={datum.label}>
            {datum.label}
          </span>
          <div className="h-6 min-w-0 flex-1 overflow-hidden rounded bg-muted">
            <div
              className="h-full rounded bg-primary/80"
              style={{ width: `${datum.value > 0 ? Math.max((datum.value / max) * 100, 2) : 0}%` }}
            />
          </div>
          <span className="w-40 shrink-0 text-end text-sm tabular-nums" dir="ltr">
            {datum.display}
          </span>
        </div>
      ))}
    </div>
  );
}
