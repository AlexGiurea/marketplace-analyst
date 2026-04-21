import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DemoScenario, DemoSnapshot } from "../types/demoSnapshot";
import { MicroLineChart, MiniGroupedBarChart, MiniLineChart, shortMoney } from "./miniCharts";

export type DashboardPreviewConfig = {
  type: "dashboard_preview";
  scope: "quarter" | "project";
  title?: string;
  caption?: string;
  focus?: string;
};

type DashboardContext = {
  snapshot: DemoSnapshot;
  scenario?: DemoScenario;
  activeQuarterIndex: number;
};

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function KpiPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/45 bg-white/55 px-2.5 py-1.5 text-center shadow-sm backdrop-blur-md">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-xs font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function BridgeFlow({ snapshot }: { snapshot: DemoSnapshot }) {
  const lines = snapshot.accounting.incomeStatement.filter(
    (l) =>
      l.label.toLowerCase().includes("revenue") ||
      l.label.toLowerCase().includes("gross") ||
      l.label.toLowerCase().includes("operating") ||
      l.label.toLowerCase().includes("net income"),
  );
  const pick = lines.slice(0, 4);
  if (pick.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Revenue to profit (simplified)</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-700">
        {pick.map((line, i) => (
          <span key={line.label} className="inline-flex items-center gap-1.5">
            <span className="font-medium">{line.label}</span>
            <span className="tabular-nums text-slate-900">{shortMoney(line.amount)}</span>
            {i < pick.length - 1 ? <span className="text-slate-300">→</span> : null}
          </span>
        ))}
      </div>
    </div>
  );
}

function QuarterDashboardBody({ snapshot }: { snapshot: DemoSnapshot }) {
  const brands = snapshot.performance.brands;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <KpiPill label="Revenue" value={shortMoney(snapshot.accounting.revenue)} />
        <KpiPill label="Net income" value={shortMoney(snapshot.accounting.netIncome)} />
        <KpiPill label="Ending cash" value={shortMoney(snapshot.accounting.endingCash)} />
        <KpiPill label="Overall share" value={`${snapshot.performance.overallSharePct.toFixed(1)}%`} />
        <KpiPill label="Scorecard index" value={String(snapshot.quarter.cumulativeBalancedScorecardIndex)} />
      </div>
      <BridgeFlow snapshot={snapshot} />
      <div className="rounded-xl border border-[#0B6381]/15 bg-white/90 p-3 backdrop-blur-sm">
        <p className="text-[11px] font-semibold text-slate-800">Brand profit</p>
        <MiniGroupedBarChart
          categories={brands.map((b) => b.name)}
          series={[{ label: "Profit", color: "#0b6381", values: brands.map((b) => b.brandProfit) }]}
          formatter={shortMoney}
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white/95">
        <table className="w-full min-w-[320px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-left text-[10px] font-semibold uppercase text-slate-600">
              <th className="px-2 py-2">Brand</th>
              <th className="px-2 py-2">Demand</th>
              <th className="px-2 py-2">Sold</th>
              <th className="px-2 py-2">Stockout</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.name} className="border-b border-slate-100">
                <td className="px-2 py-1.5 font-medium text-slate-900">{b.name}</td>
                <td className="px-2 py-1.5 tabular-nums text-slate-700">{b.demand}</td>
                <td className="px-2 py-1.5 tabular-nums text-slate-700">{b.sold}</td>
                <td className="px-2 py-1.5 text-slate-600">{b.stockout ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-600">
        Operations: {snapshot.manufacturing.lostSalesUnits} units lost sales; capacity utilization{" "}
        {snapshot.manufacturing.utilizationPct}%.
      </p>
    </div>
  );
}

function ProjectDashboardBody({
  snapshot,
  scenario,
  activeQuarterIndex,
}: {
  snapshot: DemoSnapshot;
  scenario?: DemoScenario;
  activeQuarterIndex: number;
}) {
  const multi = scenario && scenario.quarters.length > 1;
  if (!multi) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
          Project view works best with multiple quarters loaded. Showing the current quarter snapshot below.
        </p>
        <QuarterDashboardBody snapshot={snapshot} />
      </div>
    );
  }

  const qPoints = scenario.quarters.map((q) => ({
    label: q.quarter.label.replace("Quarter ", "Q"),
    value: q.accounting.revenue,
  }));
  const scPoints = scenario.quarters.map((q) => ({
    label: q.quarter.label.replace("Quarter ", "Q"),
    value: q.quarter.cumulativeBalancedScorecardIndex,
  }));
  const prevIdx = Math.max(0, activeQuarterIndex - 1);
  const cur = scenario.quarters[activeQuarterIndex];
  const prev = scenario.quarters[prevIdx];
  const revDelta = cur.accounting.revenue - prev.accounting.revenue;
  const niDelta = cur.accounting.netIncome - prev.accounting.netIncome;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <KpiPill label="Active quarter" value={snapshot.quarter.label.replace("Quarter ", "Q")} />
        <KpiPill label="Revenue" value={shortMoney(cur.accounting.revenue)} />
        <KpiPill label="Δ Revenue vs prior" value={`${revDelta >= 0 ? "+" : ""}${shortMoney(revDelta)}`} />
        <KpiPill label="Δ Net income vs prior" value={`${niDelta >= 0 ? "+" : ""}${shortMoney(niDelta)}`} />
      </div>
      <div className="rounded-xl border border-[#0B6381]/15 bg-white/90 p-3 backdrop-blur-sm">
        <p className="text-[11px] font-semibold text-slate-800">Revenue by quarter</p>
        <MiniLineChart
          points={qPoints}
          formatter={shortMoney}
          highlightIndex={Math.min(activeQuarterIndex, qPoints.length - 1)}
        />
      </div>
      <div className="rounded-xl border border-[#0B6381]/15 bg-white/90 p-3 backdrop-blur-sm">
        <p className="text-[11px] font-semibold text-slate-800">Cumulative scorecard index</p>
        <MiniLineChart
          points={scPoints}
          formatter={(v) => String(Math.round(v))}
          color="#0b6381"
          highlightIndex={Math.min(activeQuarterIndex, scPoints.length - 1)}
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white/95">
        <table className="w-full min-w-[400px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-left text-[10px] font-semibold uppercase text-slate-600">
              <th className="px-2 py-2">Q</th>
              <th className="px-2 py-2">Revenue</th>
              <th className="px-2 py-2">Net income</th>
              <th className="px-2 py-2">Share %</th>
              <th className="px-2 py-2">Score idx</th>
            </tr>
          </thead>
          <tbody>
            {scenario.quarters.map((q, i) => (
              <tr
                key={q.quarter.label}
                className={`border-b border-slate-100 ${i === activeQuarterIndex ? "bg-sky-50/80" : ""}`}
              >
                <td className="px-2 py-1.5 font-medium text-slate-900">{q.quarter.label.replace("Quarter ", "Q")}</td>
                <td className="px-2 py-1.5 tabular-nums">{shortMoney(q.accounting.revenue)}</td>
                <td className="px-2 py-1.5 tabular-nums">{shortMoney(q.accounting.netIncome)}</td>
                <td className="px-2 py-1.5 tabular-nums">{q.performance.overallSharePct.toFixed(1)}%</td>
                <td className="px-2 py-1.5 tabular-nums">{q.quarter.cumulativeBalancedScorecardIndex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardPreviewWidget({
  widget,
  context,
}: {
  widget: DashboardPreviewConfig;
  context: DashboardContext;
}) {
  const { snapshot, scenario, activeQuarterIndex } = context;
  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const scope = widget.scope;
  const effectiveScope =
    scope === "project" && (!scenario || scenario.quarters.length < 2) ? "quarter" : scope;

  const title =
    widget.title ??
    (effectiveScope === "project" ? "Project dashboard" : `Quarter dashboard · ${snapshot.quarter.label}`);

  const caption =
    widget.caption ??
    (effectiveScope === "project"
      ? "Multi-quarter company view: trends and quarter-by-quarter financials."
      : "Current quarter snapshot: KPIs, profit bridge, and brand table.");

  const previewRevenue = snapshot.accounting.revenue;
  const previewShare = snapshot.performance.overallSharePct;
  const previewNi = snapshot.accounting.netIncome;

  const trendPoints =
    scenario && scenario.quarters.length > 1
      ? scenario.quarters.map((q) => ({
          label: q.quarter.label.replace("Quarter ", "Q"),
          value: q.accounting.revenue,
        }))
      : [
          { label: "Prior (est.)", value: previewRevenue * 0.92 },
          { label: snapshot.quarter.label.replace("Quarter ", "Q"), value: previewRevenue },
        ];

  const modalContent =
    effectiveScope === "project" ? (
      <ProjectDashboardBody snapshot={snapshot} scenario={scenario} activeQuarterIndex={activeQuarterIndex} />
    ) : (
      <QuarterDashboardBody snapshot={snapshot} />
    );

  return (
    <>
      <section
        className="animate-panel-rise overflow-hidden rounded-2xl border border-[#0B6381]/25 bg-gradient-to-br from-[#f0f9fc]/95 to-white/98 p-3 shadow-[0_12px_40px_-16px_rgba(11,99,129,0.15)] backdrop-blur-md"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0B6381]/80">
              {effectiveScope === "project" ? "Project" : "Quarter"}
            </p>
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
            {widget.focus ? (
              <p className="mt-1 text-[11px] text-slate-600">{widget.focus}</p>
            ) : (
              <p className="mt-1 text-[11px] leading-snug text-slate-600">{caption}</p>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <KpiPill label="Revenue" value={shortMoney(previewRevenue)} />
          <KpiPill label="Share" value={`${previewShare.toFixed(1)}%`} />
          <KpiPill label="Net" value={shortMoney(previewNi)} />
        </div>
        <div className="mt-2 rounded-xl border border-white/50 bg-white/40 p-2 backdrop-blur-sm">
          <MicroLineChart points={trendPoints} />
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ui-btn-primary mt-3 w-full rounded-xl py-2.5 text-xs"
        >
          Open dashboard
        </button>
      </section>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
            role="presentation"
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity motion-reduce:transition-none"
              aria-label="Close dashboard overlay"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              className="animate-panel-rise relative z-[101] flex max-h-[min(92dvh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/40 bg-gradient-to-b from-[#eef6f9] to-white shadow-[0_24px_80px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-2xl"
            >
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/50 bg-white/50 px-4 py-3 backdrop-blur-md">
                <div>
                  <p id={titleId} className="text-base font-bold text-slate-900">
                    {title}
                  </p>
                  <p id={descId} className="text-xs text-slate-600">
                    {caption}
                  </p>
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  className="ui-btn-light rounded-xl px-3 py-2 text-xs font-semibold"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{modalContent}</div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
