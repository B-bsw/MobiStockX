import { cn } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
  caption?: string;
}

interface BarChartProps {
  data: BarDatum[];
  formatValue: (value: number) => string;
  barClass?: string;
  className?: string;
}

export function BarChart({
  data,
  formatValue,
  barClass = "bg-chart-1",
  className,
}: BarChartProps) {
  const max = Math.max(...data.map((datum) => datum.value), 1);

  return (
    <ul className={cn("space-y-3", className)}>
      {data.map((datum) => {
        const share = Math.round((datum.value / max) * 100);

        return (
          <li key={datum.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-foreground">
                {datum.label}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatValue(datum.value)}
              </span>
            </div>
            <div
              role="img"
              aria-label={`${datum.label} ${formatValue(datum.value)}`}
              className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn("h-full rounded-full", barClass)}
                style={{ width: `${Math.max(share, 2)}%` }}
              />
            </div>
            {datum.caption ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {datum.caption}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
