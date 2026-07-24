export type TrendPoint = {
  label: string;
  netSales: number;
  cashflow: number;
};

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const count = points.length;
  const values = [0, ...points.map((point) => point.netSales), ...points.map((point) => point.cashflow)];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const x = (index: number) => (count <= 1 ? 50 : (index / (count - 1)) * 100);
  const y = (value: number) => 39 - ((value - min) / range) * 37;

  const areaPath =
    `M ${x(0)},39 ` +
    points.map((point, index) => `L ${x(index)},${y(point.netSales)} `).join("") +
    `L ${x(count - 1)},39 Z`;
  const salesLine = points.map((point, index) => `${x(index)},${y(point.netSales)}`).join(" ");
  const cashflowLine = points.map((point, index) => `${x(index)},${y(point.cashflow)}`).join(" ");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-primary/40" />
          صافي المبيعات
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-3 rounded-sm bg-primary" />
          صافي التدفق التشغيلي
        </span>
      </div>

      <div className="h-48 w-full">
        <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="الاتجاه الشهري">
          <path d={areaPath} className="fill-primary/10" />
          <polyline
            points={salesLine}
            className="fill-none stroke-primary/40"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={cashflowLine}
            className="fill-none stroke-primary"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="flex justify-between gap-1 text-xs text-muted-foreground" dir="ltr">
        {points.map((point) => (
          <span key={point.label} className="truncate tabular-nums">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
