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
  /** Full labels for native tooltips when `categories` are shortened for the axis. */
  categoryDetail,
}: {
  categories: string[];
  series: BarSeries[];
  formatter?: (value: number) => string;
  /** Wider canvas for dashboard modal (uses more horizontal space). */
  wide?: boolean;
  /** Dim non-hovered groups; shows native tooltips on bars. */
  interactive?: boolean;
  categoryDetail?: string[];
}) {
  const [hoverGroup, setHoverGroup] = useState<number | null>(null);
  const width = wide ? 720 : 320;
  const maxCatLen = categories.length ? Math.max(...categories.map((c) => c.length)) : 0;
  const rotateLabels =
    wide &&
    (categories.length > 5 || maxCatLen > 11 || categories.some((c) => c.length > 14));
  /** Dense x-axes: HTML row below SVG so labels are never clipped by the viewBox. */
  const htmlAxisLabels = rotateLabels;
  const topPad = wide ? 28 : 12;
  const bottomPad = wide ? (htmlAxisLabels ? 10 : 56) : 36;
  const height = wide ? (htmlAxisLabels ? topPad + 196 + bottomPad : 252) : 170;
  const padding = { top: topPad, right: 14, bottom: bottomPad, left: 14 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...series.flatMap((item) => item.values));
  const groupWidth = plotWidth / Math.max(categories.length, 1);
  const barWidth = Math.min(22, Math.max(8, (groupWidth - 10) / Math.max(series.length, 1)));
  const axisY = padding.top + plotHeight;

  return (
    <div className={["dashboard-chart-plot", htmlAxisLabels ? "pb-1" : ""].filter(Boolean).join(" ")}>
      <ChartLegend series={series} />
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`block w-full ${wide ? (htmlAxisLabels ? "min-h-[220px]" : "min-h-[252px]") : "h-[170px]"}`}
        style={{ overflow: "visible" }}
        preserveAspectRatio="xMidYMin meet"
      >
        <text x={padding.left + plotWidth} y={padding.top - 2} textAnchor="end" className="fill-slate-500">
          <tspan className="text-[9px] font-medium uppercase tracking-wide">Max scale </tspan>
          <tspan className="text-[11px] font-bold tabular-nums text-slate-700">{formatter(maxValue)}</tspan>
        </text>
        <line
          x1={padding.left}
          y1={axisY}
          x2={padding.left + plotWidth}
          y2={axisY}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        {categories.map((category, categoryIndex) => {
          const groupX = padding.left + categoryIndex * groupWidth;
          const dim =
            interactive && hoverGroup !== null && hoverGroup !== categoryIndex ? 0.28 : 1;
          return (
            <g
              key={`grp-${categoryIndex}-${category.slice(0, 24)}`}
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
                      {(categoryDetail?.[categoryIndex] ?? category)} — {item.label}: {formatter(value)}
                    </title>
                  </rect>
                );
              })}
              {!htmlAxisLabels ? (
                (() => {
                  const cx = groupX + groupWidth / 2;
                  const labelY = axisY + 18;
                  return (
                    <text
                      x={cx}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="hanging"
                      className="fill-slate-700 text-[10px] font-medium pointer-events-none"
                    >
                      {category.length > 16 ? `${category.slice(0, 14)}…` : category}
                    </text>
                  );
                })()
              ) : null}
            </g>
          );
        })}
      </svg>
      {htmlAxisLabels ? (
        <div
          className="mt-2 grid gap-x-1.5 px-0 text-[9px] font-medium text-slate-700"
          style={{
            gridTemplateColumns: `repeat(${Math.max(categories.length, 1)}, minmax(3.25rem, 1fr))`,
            paddingLeft: padding.left,
            paddingRight: padding.right,
          }}
        >
          {categories.map((cat, i) => (
            <div
              key={`axis-${i}`}
              className="min-h-[1.1rem] min-w-0 cursor-default truncate px-0.5 text-center leading-tight tracking-tight text-slate-700"
              title={categoryDetail?.[i] ?? cat}
            >
              {cat}
            </div>
          ))}
        </div>
      ) : null}
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

  const svg = (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full overflow-visible transition-opacity duration-300 ${wide ? "min-h-[210px]" : "h-[170px]"}`}
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
  if (wide) return <div className="dashboard-chart-plot">{svg}</div>;
  return svg;
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

  const svg = (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full overflow-visible ${wide ? "min-h-[210px]" : "h-[170px]"}`}
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
  if (wide) return <div className="dashboard-chart-plot">{svg}</div>;
  return svg;
}

export type DonutSlice = { label: string; value: number; color: string };

/** Market share / composition — donut + HTML legend (full names, wraps). */
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
  const total = Math.max(1e-9, slices.reduce((s, x) => s + Math.max(0, x.value), 0));
  const size = wide ? 200 : 168;
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.38;
  const inner = outer * 0.56;

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

  return (
    <div
      className={[
        "flex flex-col gap-4",
        wide ? "sm:flex-row sm:items-start sm:gap-6" : "",
      ].join(" ")}
    >
      <div className="relative mx-auto shrink-0 sm:mx-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full overflow-visible" aria-hidden>
          {paths.map(({ d, slice }, i) => {
            const dim = hover !== null && hover !== i ? 0.35 : 1;
            return (
              <path
                key={`${slice.label}-${i}`}
                d={d}
                fill={slice.color}
                opacity={dim}
                style={{ transition: "opacity 0.18s ease" }}
                className="cursor-default"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <title>
                  {slice.label}: {formatter(slice.value)}
                </title>
              </path>
            );
          })}
          <text x={cx} y={cy - 2} textAnchor="middle" className="fill-slate-800 text-[13px] font-bold">
            {formatter(total)}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" className="fill-slate-400 text-[9px] font-medium">
            of market
          </text>
        </svg>
      </div>
      <ul className="min-w-0 flex-1 list-none space-y-2 p-0">
        {slices.map((slice, i) => {
          const active = hover === null || hover === i;
          const pct = (slice.value / total) * 100;
          return (
            <li
              key={`${slice.label}-${i}`}
              className={[
                "flex cursor-default gap-2.5 rounded-xl border px-2.5 py-2 text-[12px] leading-snug transition-opacity duration-150",
                active ? "border-slate-200/90 bg-white shadow-sm" : "border-transparent bg-slate-50/50 opacity-55",
              ].join(" ")}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <span
                className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm shadow-sm"
                style={{ backgroundColor: slice.color }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="break-words font-semibold text-slate-900" title={slice.label}>
                  {slice.label}
                </p>
                <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[11px] text-slate-600">
                  <span className="tabular-nums font-medium text-slate-800">{formatter(slice.value)}</span>
                  <span className="text-slate-400">({pct.toFixed(1)}% of chart)</span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Stacked channel mix — thick bar + legend grid (not SVG-only). */
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
  const total = Math.max(1e-9, segments.reduce((s, x) => s + x.value, 0));

  return (
    <div className={["space-y-4", wide ? "min-h-[140px]" : ""].join(" ")}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Spend mix by channel</p>
      <div
        className="flex h-14 w-full overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100/70 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)]"
        role="img"
        aria-label="Stacked bar of advertising spend by channel"
      >
        {segments.map((seg, i) => {
          const pct = (seg.value / total) * 100;
          const dim = hover !== null && hover !== i ? 0.38 : 1;
          return (
            <div
              key={seg.label}
              className="h-full min-w-[4px] cursor-default border-r border-white/25 last:border-r-0 motion-safe:transition-[filter,opacity] motion-safe:duration-150"
              style={{
                width: `${pct}%`,
                backgroundColor: seg.color,
                opacity: dim,
                filter: hover === i ? "brightness(1.05)" : undefined,
              }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              title={`${seg.label}: ${formatter(seg.value)} (${pct.toFixed(0)}% of spend)`}
            />
          );
        })}
      </div>
      <div
        className={[
          "grid gap-3",
          wide ? "sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2",
        ].join(" ")}
      >
        {segments.map((seg) => {
          const pct = (seg.value / total) * 100;
          return (
            <div key={seg.label} className="flex gap-2 rounded-lg border border-slate-100/90 bg-slate-50/80 px-2 py-1.5">
              <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-sm shadow-sm" style={{ backgroundColor: seg.color }} />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold leading-tight text-slate-900">{seg.label}</p>
                <p className="mt-0.5 text-[11px] tabular-nums text-slate-600">
                  <span className="font-medium text-slate-800">{formatter(seg.value)}</span>
                  <span className="text-slate-400"> · {pct.toFixed(0)}%</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
  const rowH = 40;
  const top = 10;
  const height = top + rows.length * rowH + 12;
  const maxValue = Math.max(1, ...rows.map((r) => r.value));
  const labelW = wide ? 132 : 108;
  const barLeft = labelW + 8;
  const barRight = width - 8;
  const plotW = barRight - barLeft;

  return (
    <div className="dashboard-chart-plot">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ height: `${Math.max(height, rows.length * 40 + 24)}px` }}
      >
        {rows.map((row, i) => {
          const y = top + i * rowH;
          const bw = (row.value / maxValue) * plotW;
          const dim = hover !== null && hover !== i ? 0.38 : 1;
          return (
            <g
              key={row.label}
              style={{ opacity: dim, transition: "opacity 0.16s ease" }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{row.label}</title>
              <text x={6} y={y + 22} className="fill-slate-800 text-[11px] font-semibold">
                {row.label.length > 18 ? `${row.label.slice(0, 16)}…` : row.label}
              </text>
              <rect
                x={barLeft}
                y={y + 6}
                width={Math.max(bw, 3)}
                height={22}
                rx={5}
                fill={color}
                className="motion-safe:transition-[filter] motion-safe:duration-150"
                style={hover === i ? { filter: "brightness(1.07)" } : undefined}
              >
                <title>
                  {row.label}: {formatter(row.value)}
                </title>
              </rect>
              <text x={barRight} y={y + 22} textAnchor="end" className="fill-slate-700 text-[11px] font-bold tabular-nums">
                {formatter(row.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
