export function shortMoney(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${value < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${value < 0 ? "-" : ""}$${Math.round(abs / 1_000)}k`;
  return `${value < 0 ? "-" : ""}$${Math.round(abs)}`;
}

type BarSeries = { label: string; color: string; values: number[] };

function ChartLegend({ series }: { series: BarSeries[] }) {
  return (
    <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-medium text-slate-600">
      {series.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function MiniGroupedBarChart({
  categories,
  series,
  formatter = (value: number) => String(Math.round(value)),
}: {
  categories: string[];
  series: BarSeries[];
  formatter?: (value: number) => string;
}) {
  const width = 320;
  const height = 170;
  const padding = { top: 10, right: 10, bottom: 36, left: 10 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...series.flatMap((item) => item.values));
  const groupWidth = plotWidth / Math.max(categories.length, 1);
  const barWidth = Math.min(22, Math.max(8, (groupWidth - 10) / Math.max(series.length, 1)));

  return (
    <div>
      <ChartLegend series={series} />
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[170px] w-full overflow-visible">
        <line
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={padding.left + plotWidth}
          y2={padding.top + plotHeight}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        {categories.map((category, categoryIndex) => {
          const groupX = padding.left + categoryIndex * groupWidth;
          return (
            <g key={category}>
              {series.map((item, seriesIndex) => {
                const value = item.values[categoryIndex] ?? 0;
                const barHeight = (value / maxValue) * plotHeight;
                const x = groupX + 5 + seriesIndex * barWidth;
                const y = padding.top + plotHeight - barHeight;
                return (
                  <rect
                    key={item.label}
                    x={x}
                    y={y}
                    width={barWidth - 3}
                    height={Math.max(barHeight, 2)}
                    rx="4"
                    fill={item.color}
                    opacity="0.95"
                  />
                );
              })}
              <text
                x={groupX + groupWidth / 2}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-medium"
              >
                {category}
              </text>
            </g>
          );
        })}
        <text x={width - 8} y={12} textAnchor="end" className="fill-slate-400 text-[10px] font-medium">
          {formatter(maxValue)}
        </text>
      </svg>
    </div>
  );
}

export function MiniLineChart({
  points,
  color = "#0D50AC",
  formatter = (value: number) => String(Math.round(value)),
  highlightIndex,
}: {
  points: { label: string; value: number }[];
  color?: string;
  formatter?: (value: number) => string;
  highlightIndex?: number;
}) {
  const width = 320;
  const height = 170;
  const padding = { top: 16, right: 10, bottom: 28, left: 10 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...points.map((point) => point.value));
  const minValue = Math.min(...points.map((point) => point.value));
  const valueRange = Math.max(1, maxValue - minValue);

  const coords = points.map((point, index) => {
    const x = padding.left + (plotWidth * index) / Math.max(points.length - 1, 1);
    const y = padding.top + plotHeight - ((point.value - minValue) / valueRange) * plotHeight;
    return { ...point, x, y };
  });

  const path = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[170px] w-full overflow-visible">
      <line
        x1={padding.left}
        y1={padding.top + plotHeight}
        x2={padding.left + plotWidth}
        y2={padding.top + plotHeight}
        stroke="#cbd5e1"
        strokeWidth="1"
      />
      <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((point, index) => {
        const highlighted = highlightIndex === index;
        return (
          <g key={point.label}>
            <circle
              cx={point.x}
              cy={point.y}
              r={highlighted ? 5.5 : 4}
              fill={highlighted ? "#0b6381" : color}
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              className={`text-[10px] font-medium ${highlighted ? "fill-slate-900" : "fill-slate-500"}`}
            >
              {point.label}
            </text>
          </g>
        );
      })}
      <text x={width - 8} y={12} textAnchor="end" className="fill-slate-400 text-[10px] font-medium">
        {formatter(maxValue)}
      </text>
      {minValue !== maxValue ? (
        <text x={width - 8} y={height - 34} textAnchor="end" className="fill-slate-300 text-[10px] font-medium">
          {formatter(minValue)}
        </text>
      ) : null}
    </svg>
  );
}

/** Compact line chart for preview strips (shorter height). */
export function MicroLineChart({
  points,
  color = "#0D50AC",
}: {
  points: { label: string; value: number }[];
  color?: string;
}) {
  const width = 280;
  const height = 72;
  const padding = { top: 8, right: 8, bottom: 18, left: 8 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...points.map((p) => p.value));
  const minValue = Math.min(...points.map((p) => p.value));
  const valueRange = Math.max(1, maxValue - minValue);
  const coords = points.map((point, index) => {
    const x = padding.left + (plotWidth * index) / Math.max(points.length - 1, 1);
    const y = padding.top + plotHeight - ((point.value - minValue) / valueRange) * plotHeight;
    return { ...point, x, y };
  });
  const path = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full" aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {coords.map((point, index) => (
        <circle key={point.label} cx={point.x} cy={point.y} r={2.5} fill={color} opacity={index === coords.length - 1 ? 1 : 0.45} />
      ))}
    </svg>
  );
}
