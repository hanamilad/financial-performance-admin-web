export function KpiCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border bg-card p-4">
      <span className="truncate text-sm text-muted-foreground">{label}</span>
      <span className="text-center text-2xl font-semibold tabular-nums" dir="ltr">
        {value}
      </span>
      {caption ? (
        <span className="text-center text-xs text-muted-foreground tabular-nums" dir="ltr">
          {caption}
        </span>
      ) : null}
    </div>
  );
}
