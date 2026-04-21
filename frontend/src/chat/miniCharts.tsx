import { useId, useState } from "react";

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
  wide = false,
  interactive = false,
}: {
  categories: string[];
  series: BarSeries[];
  formatter?: (value: number) => string;
  /** Wider canvas for dashboard modal (uses more horizontal space). */
  wide?: boolean;
  /** Dim non-hovered groups; shows native tooltips on bars. */
  interactive?: boolean;
}) {
  const [hoverGroup, setHoverGroup] = useState<number | null>(null);
  const width = wide ? 720 : 320;
  const height = wide ? 200 : 170;
  const padding = { top: 10, right: 10, bottom: 36, left: 10 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...series.flatMap((item) => item.values));
  const groupWidth = plotWidth / Math.max(categories.length, 1);
  const barWidth = Math.min(22, Math.max(8, (groupWidth - 10) / Math.max(series.length, 1)));

  return (
    <div>
      <ChartLegend series={series} />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`w-full overflow-visible ${wide ? "h-[200px] max-h-[220px]" : "h-[170px]"}`}
      >
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
          const dim =
            interactive && hoverGroup !== null && hoverGroup !== categoryIndex ? 0.28 : 1;
          return (
            <g
              key={category}
              style={{ opacity: dim, transition: "opacity 0.18s ease" }}
              onMouseEnter={interactive ? () => setHoverGroup(categoryIndex) : undefined}
              onMouseLeave={interactive ? () => setHoverGroup(null) : undefined}
            >
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
                    className={interactive ? "motion-safe:transition-[filter] motion-safe:duration-200" : undefined}
                    style={
                      interactive && hoverGroup === categoryIndex
                        ? { filter: "brightness(1.08)" }
                        : undefined
                    }
                  >
                    <title>
                      {category} — {item.label}: {formatter(value)}
                    </title>
                  </rect>
                );
              })}
              <text
                x={groupX + groupWidth / 2}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-500 text-[10px] font-medium pointer-events-none"
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
  wide = false,
}: {
  points: { label: string; value: number }[];
  color?: string;
  formatter?: (value: number) => string;
  highlightIndex?: number;
  wide?: boolean;
}) {
  const width = wide ? 720 : 320;
  const height = wide ? 210 : 170;
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
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full overflow-visible transition-opacity duration-300 ${wide ? "h-[210px] max-h-[240px]" : "h-[170px]"}`}
    >
      <line
        x1={padding.left}
        y1={padding.top + plotHeight}
        x2={padding.left + plotWidth}
        y2={padding.top + plotHeight}
        stroke="#cbd5e1"
        strokeWidth="1"
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={wide ? 2.5 : 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="motion-safe:transition-[stroke-width] motion-safe:duration-300"
      />
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
            >
              <title>
                {point.label}: {formatter(point.value)}
              </title>
            </circle>
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

/** Filled area + line — same semantics as MiniLineChart. */
export function MiniAreaChart({
  points,
  color = "#0D50AC",
  formatter = (value: number) => String(Math.round(value)),
  highlightIndex,
  wide = false,
}: {
  points: { label: string; value: number }[];
  color?: string;
  formatter?: (value: number) => string;
  highlightIndex?: number;
  wide?: boolean;
}) {
  const width = wide ? 720 : 320;
  const height = wide ? 210 : 170;
  const padding = { top: 16, right: 10, bottom: 28, left: 10 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...points.map((point) => point.value));
  const minValue = Math.min(...points.map((point) => point.value));
  const valueRange = Math.max(1, maxValue - minValue);
  const baseline = padding.top + plotHeight;

  const coords = points.map((point, index) => {
    const x = padding.left + (plotWidth * index) / Math.max(points.length - 1, 1);
    const y = padding.top + plotHeight - ((point.value - minValue) / valueRange) * plotHeight;
    return { ...point, x, y };
  });

  const linePath = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1].x} ${baseline} L ${coords[0].x} ${baseline} Z`
      : "";
  const gradId = useId().replace(/:/g, "");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full overflow-visible ${wide ? "h-[210px] max-h-[240px]" : "h-[170px]"}`}
    >
      <defs>
        <linearGradient id={`area-fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <line
        x1={padding.left}
        y1={baseline}
        x2={padding.left + plotWidth}
        y2={baseline}
        stroke="#cbd5e1"
        strokeWidth="1"
      />
      <path d={areaPath} fill={`url(#area-fill-${gradId})`} stroke="none" />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={wide ? 2.5 : 3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
            >
              <title>
                {point.label}: {formatter(point.value)}
              </title>
            </circle>
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

export type DonutSlice = { label: string; value: number; color: string };

/** Market share / composition — hover highlights slice + legend. */
export function MiniDonutChart({
  slices,
  formatter = (v: number) => `${v.toFixed(1)}%`,
  wide = false,
}: {
  slices: DonutSlice[];
  formatter?: (value: number) => string;
  wide?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = wide ? 720 : 320;
  const height = wide ? 220 : 180;
  const cx = width * 0.28;
  const cy = height / 2;
  const outer = Math.min(width, height) * 0.34;
  const inner = outer * 0.58;
  const total = Math.max(1e-9, slices.reduce((s, x) => s + Math.max(0, x.value), 0));

  let angle = -Math.PI / 2;
  const paths = slices.map((slice) => {
    const sweep = (slice.value / total) * Math.PI * 2;
    const a0 = angle;
    const a1 = angle + sweep;
    angle = a1;
    const x0o = cx + outer * Math.cos(a0);
    const y0o = cy + outer * Math.sin(a0);
    const x1o = cx + outer * Math.cos(a1);
    const y1o = cy + outer * Math.sin(a1);
    const x0i = cx + inner * Math.cos(a0);
    const y0i = cy + inner * Math.sin(a0);
    const x1i = cx + inner * Math.cos(a1);
    const y1i = cy + inner * Math.sin(a1);
    const large = sweep > Math.PI ? 1 : 0;
    const d = [
      `M ${x0o} ${y0o}`,
      `A ${outer} ${outer} 0 ${large} 1 ${x1o} ${y1o}`,
      `L ${x1i} ${y1i}`,
      `A ${inner} ${inner} 0 ${large} 0 ${x0i} ${y0i}`,
      "Z",
    ].join(" ");
    return { d, slice };
  });

  const legendX = width * 0.52;
  const legendTop = height * 0.22;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className={`w-full ${wide ? "h-[220px]" : "h-[180px]"}`}>
        {paths.map(({ d, slice }, i) => {
          const dim = hover !== null && hover !== i ? 0.35 : 1;
          return (
            <path
              key={`${slice.label}-${i}`}
              d={d}
              fill={slice.color}
              opacity={dim}
              style={{ transition: "opacity 0.18s ease", transformOrigin: `${cx}px ${cy}px` }}
              className="motion-safe:hover:brightness-110"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <title>
                {slice.label}: {formatter(slice.value)}
              </title>
            </path>
          );
        })}
        <text x={cx} y={cy + 2} textAnchor="middle" className="fill-slate-700 text-[11px] font-bold">
          {formatter(total)}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="fill-slate-400 text-[9px] font-medium">
          combined
        </text>
        {slices.map((slice, i) => {
          const active = hover === null || hover === i;
          const ly = legendTop + i * 16;
          return (
            <g key={slice.label} opacity={active ? 1 : 0.4}>
              <rect x={legendX} y={ly - 6} width="8" height="8" rx="2" fill={slice.color} />
              <text x={legendX + 12} y={ly + 2} className="fill-slate-700 text-[10px] font-medium">
                {slice.label.length > 22 ? `${slice.label.slice(0, 20)}…` : slice.label}
              </text>
              <text x={width - 10} y={ly + 2} textAnchor="end" className="fill-slate-500 text-[10px] tabular-nums">
                {formatter(slice.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** One horizontal bar, segments sum visually (e.g. ad mix). */
export function MiniStackedHorizontalBar({
  segments,
  formatter = (v: number) => shortMoney(v),
  wide = false,
}: {
  segments: { label: string; value: number; color: string }[];
  formatter?: (value: number) => string;
  wide?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = wide ? 720 : 320;
  const height = wide ? 88 : 76;
  const pad = 12;
  const barH = 22;
  const total = Math.max(1e-9, segments.reduce((s, x) => s + x.value, 0));
  const plotW = width - pad * 2;
  let x = pad;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={`w-full ${wide ? "h-[88px]" : "h-[76px]"}`}>
      <text x={pad} y={16} className="fill-slate-500 text-[10px] font-semibold uppercase tracking-wide">
        Mix (share of spend)
      </text>
      {segments.map((seg, i) => {
        const w = (seg.value / total) * plotW;
        const dim = hover !== null && hover !== i ? 0.35 : 1;
        const el = (
          <g key={seg.label} opacity={dim}>
            <rect
              x={x}
              y={height - pad - barH}
              width={Math.max(w, 2)}
              height={barH}
              rx={4}
              fill={seg.color}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="motion-safe:transition-[filter] motion-safe:duration-200"
              style={hover === i ? { filter: "brightness(1.06)" } : undefined}
            >
              <title>
                {seg.label}: {formatter(seg.value)} ({((seg.value / total) * 100).toFixed(0)}%)
              </title>
            </rect>
          </g>
        );
        x += w;
        return el;
      })}
    </svg>
  );
}

/** Sorted horizontal bars — one metric per row (e.g. brand revenue). */
export function MiniHorizontalBarChart({
  rows,
  formatter = (v: number) => shortMoney(v),
  color = "#0D50AC",
  wide = false,
}: {
  rows: { label: string; value: number }[];
  formatter?: (value: number) => string;
  color?: string;
  wide?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const width = wide ? 720 : 320;
  const rowH = 26;
  const top = 8;
  const height = top + rows.length * rowH + 8;
  const maxValue = Math.max(1, ...rows.map((r) => r.value));
  const barLeft = 120;
  const barRight = width - 12;
  const plotW = barRight - barLeft;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: `${Math.min(height, 220)}px` }}>
      {rows.map((row, i) => {
        const y = top + i * rowH;
        const bw = (row.value / maxValue) * plotW;
        const dim = hover !== null && hover !== i ? 0.35 : 1;
        return (
          <g
            key={row.label}
            style={{ opacity: dim, transition: "opacity 0.16s ease" }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <text x={8} y={y + 16} className="fill-slate-700 text-[10px] font-medium">
              {row.label.length > 16 ? `${row.label.slice(0, 14)}…` : row.label}
            </text>
            <rect
              x={barLeft}
              y={y + 4}
              width={Math.max(bw, 2)}
              height={16}
              rx={4}
              fill={color}
              style={hover === i ? { filter: "brightness(1.08)" } : undefined}
            >
              <title>
                {row.label}: {formatter(row.value)}
              </title>
            </rect>
            <text x={barRight} y={y + 16} textAnchor="end" className="fill-slate-500 text-[10px] tabular-nums">
              {formatter(row.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
