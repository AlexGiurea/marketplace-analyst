import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { DemoScenario, DemoSnapshot, DemoScorecardRow, DemoStrategicGraphPoint } from "../types/demoSnapshot";
import { buildCitationHref, resolveCitationDestination } from "../workspace/citationLinks";

type InlinePart =
  | { kind: "text"; text: string }
  | { kind: "citation"; id: string };

export type SupportedQuarterMetric =
  | "overall_share"
  | "revenue"
  | "net_income"
  | "ending_cash"
  | "scorecard_index";

export type SupportedBrandMetric = "demand" | "sold" | "revenue" | "brand_profit";

type ChartKey =
  | "competitor-share"
  | "brand-demand-vs-sold"
  | "brand-profit"
  | "segment-demand"
  | "capacity-vs-forecast"
  | "scorecard-themes"
  | "quarter-trend"
  | "brand-history"
  | "strategic-graph";

const CHART_KEYS: ChartKey[] = [
  "competitor-share",
  "brand-demand-vs-sold",
  "brand-profit",
  "segment-demand",
  "capacity-vs-forecast",
  "scorecard-themes",
  "quarter-trend",
  "brand-history",
  "strategic-graph",
];

const WIDGET_METRICS = [
  "overall_share",
  "revenue",
  "net_income",
  "ending_cash",
  "scorecard_index",
  "demand",
  "sold",
  "brand_profit",
  "market_appeal",
  "share_pct",
  "cumulative_profit",
] as const;

type WidgetMetric = (typeof WIDGET_METRICS)[number];

export type CoachWidget =
  | {
      type: "tradeoff_compare";
      title: string;
      left: { label: string; summary?: string; bullets?: string[] };
      right: { label: string; summary?: string; bullets?: string[] };
      verdict?: string;
    }
  | {
      type: "chart";
      chartKey: ChartKey;
      title?: string;
      caption?: string;
      metric?: SupportedQuarterMetric | SupportedBrandMetric | "market_appeal" | "share_pct" | "cumulative_profit";
      brand?: string;
    };

export type AssistantSegment =
  | { kind: "text"; content: string }
  | { kind: "widget"; widget: CoachWidget };

export type ChatRenderContext = {
  snapshot: DemoSnapshot;
  scenario?: DemoScenario;
  activeQuarterIndex: number;
};

function parseInlineParts(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const regex = /\[([^[\]]+)\]/g;
  let lastIndex = 0;

  for (const match of text.matchAll(regex)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      parts.push({ kind: "text", text: text.slice(lastIndex, start) });
    }
    parts.push({ kind: "citation", id: match[1].trim() });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ kind: "text", text: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ kind: "text", text }];
}

export function InlineRichText({ text }: { text: string }) {
  const parts = parseInlineParts(text);

  return (
    <>
      {parts.map((part, index) => {
        if (part.kind === "text") {
          return <span key={index}>{part.text}</span>;
        }

        const destination = resolveCitationDestination(part.id);
        if (!destination) {
          return (
            <span key={index} className="font-medium text-slate-500">
              [{part.id}]
            </span>
          );
        }

        return (
          <Link
            key={index}
            to={buildCitationHref(part.id)}
            title={`${destination.title} (${part.id})`}
            className="rounded-md border border-sky-200/60 bg-sky-50/90 px-1.5 py-0.5 font-medium text-[#0D50AC] underline decoration-[#0D50AC]/35 underline-offset-2 backdrop-blur-sm transition hover:-translate-y-px hover:border-sky-300/80 hover:bg-sky-100/95"
          >
            [{destination.label}]
          </Link>
        );
      })}
    </>
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function coerceTradeoffSide(value: unknown): { label: string; summary?: string; bullets?: string[] } | null {
  if (!value || typeof value !== "object") return null;
  const side = value as Record<string, unknown>;
  if (typeof side.label !== "string" || !side.label.trim()) return null;
  return {
    label: side.label.trim(),
    summary: typeof side.summary === "string" ? side.summary.trim() : undefined,
    bullets: isStringArray(side.bullets) ? side.bullets.filter(Boolean) : undefined,
  };
}

function parseCoachWidget(raw: string): CoachWidget | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.type === "tradeoff_compare") {
      const left = coerceTradeoffSide(parsed.left);
      const right = coerceTradeoffSide(parsed.right);
      if (!left || !right || typeof parsed.title !== "string" || !parsed.title.trim()) return null;
      return {
        type: "tradeoff_compare",
        title: parsed.title.trim(),
        left,
        right,
        verdict: typeof parsed.verdict === "string" ? parsed.verdict.trim() : undefined,
      };
    }

    if (
      parsed.type === "chart" &&
      typeof parsed.chartKey === "string" &&
      CHART_KEYS.includes(parsed.chartKey as ChartKey)
    ) {
      return {
        type: "chart",
        chartKey: parsed.chartKey as ChartKey,
        title: typeof parsed.title === "string" ? parsed.title.trim() : undefined,
        caption: typeof parsed.caption === "string" ? parsed.caption.trim() : undefined,
        metric:
          typeof parsed.metric === "string" && WIDGET_METRICS.includes(parsed.metric.trim() as WidgetMetric)
            ? (parsed.metric.trim() as WidgetMetric)
            : undefined,
        brand: typeof parsed.brand === "string" ? parsed.brand.trim() : undefined,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function parseAssistantSegments(content: string): AssistantSegment[] {
  const regex = /```coach-widget\s*([\s\S]*?)```/g;
  const segments: AssistantSegment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(regex)) {
    const start = match.index ?? 0;
    const before = content.slice(lastIndex, start).trim();
    if (before) {
      segments.push({ kind: "text", content: before });
    }

    const widget = parseCoachWidget(match[1]?.trim() ?? "");
    if (widget) {
      segments.push({ kind: "widget", widget });
    }

    lastIndex = start + match[0].length;
  }

  const tail = content.slice(lastIndex).trim();
  if (tail) {
    segments.push({ kind: "text", content: tail });
  }

  return segments.length > 0 ? segments : [{ kind: "text", content }];
}

function shortMoney(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${value < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `${value < 0 ? "-" : ""}$${Math.round(abs / 1_000)}k`;
  return `${value < 0 ? "-" : ""}$${Math.round(abs)}`;
}

type BarSeries = { label: string; color: string; values: number[] };

function WidgetShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="animate-panel-rise rounded-2xl border border-[#0B6381]/20 bg-gradient-to-br from-[#f5fafc]/95 to-white/98 p-3.5 shadow-[0_12px_40px_-16px_rgba(11,99,129,0.12)] backdrop-blur-[1px] transition-[box-shadow,transform] duration-300 hover:-translate-y-px hover:shadow-[0_16px_48px_-14px_rgba(11,99,129,0.16)] motion-reduce:hover:translate-y-0">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {children}
      {footer ? <div className="mt-3 text-xs leading-5 text-slate-600">{footer}</div> : null}
    </section>
  );
}

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

function MiniGroupedBarChart({
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

function MiniLineChart({
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

function scorecardLabels(rows: DemoScorecardRow[]): string[] {
  return rows.map((row) => row.theme.replace(/ & /g, "\n").split(" ")[0]);
}

function strategicValue(point: DemoStrategicGraphPoint, metric: string | undefined): number {
  switch (metric) {
    case "market_appeal":
      return point.marketAppealIndex;
    case "cumulative_profit":
      return point.cumulativeProfit;
    case "share_pct":
    default:
      return point.sharePct;
  }
}

function renderChartWidget(widget: Extract<CoachWidget, { type: "chart" }>, ctx: ChatRenderContext) {
  const { snapshot, scenario, activeQuarterIndex } = ctx;

  switch (widget.chartKey) {
    case "competitor-share": {
      const categories = [snapshot.company.name, ...snapshot.performance.competitors.map((c) => c.name)];
      const values = [snapshot.performance.overallSharePct, ...snapshot.performance.competitors.map((c) => c.sharePct)];
      return (
        <WidgetShell
          title={widget.title ?? "Competitor share snapshot"}
          subtitle="Current quarter share positioning"
          footer={widget.caption ? <InlineRichText text={widget.caption} /> : null}
        >
          <MiniGroupedBarChart
            categories={categories}
            series={[{ label: "Share %", color: "#0D50AC", values }]}
            formatter={(value) => `${value.toFixed(0)}%`}
          />
        </WidgetShell>
      );
    }
    case "brand-demand-vs-sold": {
      const categories = snapshot.performance.brands.map((brand) => brand.name);
      return (
        <WidgetShell
          title={widget.title ?? "Brand demand vs sell-through"}
          subtitle="Demand, sold units, and stock pressure"
          footer={widget.caption ? <InlineRichText text={widget.caption} /> : null}
        >
          <MiniGroupedBarChart
            categories={categories}
            series={[
              { label: "Demand", color: "#7dd3fc", values: snapshot.performance.brands.map((brand) => brand.demand) },
              { label: "Sold", color: "#0D50AC", values: snapshot.performance.brands.map((brand) => brand.sold) },
            ]}
          />
        </WidgetShell>
      );
    }
    case "brand-profit": {
      const categories = snapshot.performance.brands.map((brand) => brand.name);
      return (
        <WidgetShell
          title={widget.title ?? "Brand profit"}
          subtitle="Current-quarter brand contribution"
          footer={widget.caption ? <InlineRichText text={widget.caption} /> : null}
        >
          <MiniGroupedBarChart
            categories={categories}
            series={[{ label: "Brand profit", color: "#0b6381", values: snapshot.performance.brands.map((brand) => brand.brandProfit) }]}
            formatter={shortMoney}
          />
        </WidgetShell>
      );
    }
    case "segment-demand": {
      const categories = snapshot.performance.segmentDemand.map((segment) => segment.segment);
      return (
        <WidgetShell
          title={widget.title ?? "Segment demand"}
          subtitle="Team volume against total market demand"
          footer={widget.caption ? <InlineRichText text={widget.caption} /> : null}
        >
          <MiniGroupedBarChart
            categories={categories}
            series={[
              {
                label: "Industry units",
                color: "#cbd5e1",
                values: snapshot.performance.segmentDemand.map((segment) => segment.industryUnits),
              },
              {
                label: "Team units",
                color: "#0D50AC",
                values: snapshot.performance.segmentDemand.map((segment) => segment.teamUnits),
              },
            ]}
          />
        </WidgetShell>
      );
    }
    case "capacity-vs-forecast": {
      const categories = snapshot.performance.brands.map((brand) => brand.name);
      return (
        <WidgetShell
          title={widget.title ?? "Capacity pressure"}
          subtitle="Current demand and next-quarter forecast by brand"
          footer={widget.caption ? <InlineRichText text={widget.caption} /> : null}
        >
          <MiniGroupedBarChart
            categories={categories}
            series={[
              { label: "Demand", color: "#7dd3fc", values: snapshot.performance.brands.map((brand) => brand.demand) },
              {
                label: "Forecast next",
                color: "#0b6381",
                values: snapshot.performance.brands.map(
                  (brand) => snapshot.manufacturing.demandForecastNext[brand.name] ?? brand.demand,
                ),
              },
            ]}
          />
          <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            <span>Operating capacity</span>
            <span className="font-semibold text-slate-900">
              {snapshot.manufacturing.operatingCapacityUnits.toLocaleString()} units at {snapshot.manufacturing.utilizationPct}%
              {" "}utilization
            </span>
          </div>
        </WidgetShell>
      );
    }
    case "scorecard-themes": {
      const rows = snapshot.balancedScorecard;
      return (
        <WidgetShell
          title={widget.title ?? "Balanced scorecard themes"}
          subtitle="Current score against prior quarter"
          footer={widget.caption ? <InlineRichText text={widget.caption} /> : null}
        >
          <MiniGroupedBarChart
            categories={scorecardLabels(rows)}
            series={[
              { label: "Current", color: "#0D50AC", values: rows.map((row) => row.score) },
              { label: "Prior", color: "#cbd5e1", values: rows.map((row) => row.priorScore) },
            ]}
            formatter={(value) => `${Math.round(value)}`}
          />
        </WidgetShell>
      );
    }
    case "quarter-trend": {
      if (!scenario || scenario.quarters.length < 2) return null;
      const metric = widget.metric as SupportedQuarterMetric | undefined;
      const points = scenario.quarters.map((quarter) => {
        const value =
          metric === "revenue"
            ? quarter.accounting.revenue
            : metric === "net_income"
              ? quarter.accounting.netIncome
              : metric === "ending_cash"
                ? quarter.accounting.endingCash
                : metric === "scorecard_index"
                  ? quarter.quarter.cumulativeBalancedScorecardIndex
                  : quarter.performance.overallSharePct;
        return { label: quarter.quarter.label.replace("Quarter ", "Q"), value };
      });
      const formatter =
        metric === "overall_share"
          ? (value: number) => `${value.toFixed(0)}%`
          : metric === "scorecard_index"
            ? (value: number) => `${Math.round(value)}`
            : shortMoney;
      return (
        <WidgetShell
          title={widget.title ?? "Quarter trend"}
          subtitle="Trend across loaded quarters"
          footer={widget.caption ? <InlineRichText text={widget.caption} /> : null}
        >
          <MiniLineChart
            points={points}
            formatter={formatter}
            highlightIndex={Math.min(activeQuarterIndex, points.length - 1)}
          />
        </WidgetShell>
      );
    }
    case "brand-history": {
      if (!scenario || scenario.quarters.length < 2) return null;
      const metric = (widget.metric as SupportedBrandMetric | undefined) ?? "brand_profit";
      const brandName = widget.brand?.trim().toLowerCase();
      const rows = scenario.quarters
        .map((quarter) => {
          const brand = quarter.performance.brands.find((item) => item.name.toLowerCase() === brandName);
          if (!brand) return null;
          const value =
            metric === "demand"
              ? brand.demand
              : metric === "sold"
                ? brand.sold
                : metric === "revenue"
                  ? brand.revenue
                  : brand.brandProfit;
          return { label: quarter.quarter.label.replace("Quarter ", "Q"), value };
        })
        .filter((row): row is { label: string; value: number } => Boolean(row));

      if (rows.length < 2) return null;
      const formatter = metric === "revenue" || metric === "brand_profit" ? shortMoney : (value: number) => String(Math.round(value));
      return (
        <WidgetShell
          title={widget.title ?? `${widget.brand ?? "Brand"} history`}
          subtitle={`${metric.replaceAll("_", " ")} across quarters`}
          footer={widget.caption ? <InlineRichText text={widget.caption} /> : null}
        >
          <MiniLineChart points={rows} formatter={formatter} highlightIndex={Math.min(activeQuarterIndex, rows.length - 1)} />
        </WidgetShell>
      );
    }
    case "strategic-graph": {
      const metric = widget.metric;
      const points = snapshot.performance.strategicGraph.map((point) => ({
        label: point.quarterLabel.replace("Quarter ", "Q"),
        value: strategicValue(point, metric),
      }));
      if (points.length < 2) return null;
      const formatter =
        metric === "cumulative_profit" ? shortMoney : metric === "market_appeal" ? (value: number) => `${Math.round(value)}` : (value: number) => `${value.toFixed(0)}%`;
      return (
        <WidgetShell
          title={widget.title ?? "Strategic graph trend"}
          subtitle="Embedded from the current performance history"
          footer={widget.caption ? <InlineRichText text={widget.caption} /> : null}
        >
          <MiniLineChart points={points} formatter={formatter} highlightIndex={points.length - 1} />
        </WidgetShell>
      );
    }
    default:
      return null;
  }
}

function TradeoffColumn({
  title,
  summary,
  bullets,
}: {
  title: string;
  summary?: string;
  bullets?: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-3">
      <div className="mb-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
        {title}
      </div>
      {summary ? (
        <p className="text-sm leading-6 text-slate-800">
          <InlineRichText text={summary} />
        </p>
      ) : null}
      {bullets?.length ? (
        <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-5 text-slate-600">
          {bullets.map((bullet) => (
            <li key={bullet}>
              <InlineRichText text={bullet} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function CoachWidgetRenderer({ widget, context }: { widget: CoachWidget; context: ChatRenderContext }) {
  if (widget.type === "tradeoff_compare") {
    return (
      <WidgetShell title={widget.title} footer={widget.verdict ? <InlineRichText text={widget.verdict} /> : null}>
        <div className="grid gap-3 md:grid-cols-2">
          <TradeoffColumn title={widget.left.label} summary={widget.left.summary} bullets={widget.left.bullets} />
          <TradeoffColumn title={widget.right.label} summary={widget.right.summary} bullets={widget.right.bullets} />
        </div>
      </WidgetShell>
    );
  }

  return renderChartWidget(widget, context);
}
