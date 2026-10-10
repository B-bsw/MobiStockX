import { formatMoney } from "@/lib/format";

export interface TrendPoint {
  label: string;
  value: number;
  count: number;
}

interface SalesTrendProps {
  data: TrendPoint[];
}

const WIDTH = 640;
const HEIGHT = 180;
const PAD_Y = 14;

export function SalesTrend({ data }: SalesTrendProps) {
  const max = Math.max(...data.map((point) => point.value), 1);
  const step = data.length > 1 ? WIDTH / (data.length - 1) : 0;

  const pointAt = (point: TrendPoint, index: number) => {
    const x = data.length > 1 ? index * step : WIDTH / 2;
    const y =
      HEIGHT - PAD_Y - (point.value / max) * (HEIGHT - PAD_Y * 2);
    return { x, y };
  };

  const coords = data.map(pointAt);
  const line = coords
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");
  const area = `${line} L${coords[coords.length - 1]?.x ?? 0},${HEIGHT} L${coords[0]?.x ?? 0},${HEIGHT} Z`;

  const peak = data.reduce(
    (best, point) => (point.value > best.value ? point : best),
    data[0],
  );

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`แนวโน้มยอดขาย ${data.length} วันล่าสุด สูงสุดวันที่ ${peak?.label} ${formatMoney(peak?.value ?? 0)} บาท`}
        className="h-44 w-full"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-chart-1)"
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor="var(--color-chart-1)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2={WIDTH}
            y1={PAD_Y + ratio * (HEIGHT - PAD_Y * 2)}
            y2={PAD_Y + ratio * (HEIGHT - PAD_Y * 2)}
            stroke="var(--color-border)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path d={area} fill="url(#trend-fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-chart-1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {coords.map(({ x, y }, index) => (
          <circle
            key={data[index].label}
            cx={x}
            cy={y}
            r="3"
            fill="var(--color-card)"
            stroke="var(--color-chart-1)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <ol className="mt-2 flex justify-between text-xs text-muted-foreground">
        {data.map((point) => (
          <li key={point.label} className="tabular-nums">
            {point.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
