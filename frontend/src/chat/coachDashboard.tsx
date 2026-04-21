import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useDemoData } from "../context/DemoDataContext";
import { stashCoachDashboardTransfer, type CoachDashboardTransferPayload } from "../lib/coachDashboardTransfer";
import type { DemoScenario, DemoSnapshot } from "../types/demoSnapshot";
import {
  MicroLineChart,
  MiniAreaChart,
  MiniDonutChart,
  MiniGroupedBarChart,
  MiniHorizontalBarChart,
  MiniLineChart,
  MiniStackedHorizontalBar,
  shortMoney,
  type DonutSlice,
} from "./miniCharts";

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
    <div className="rounded-xl border border-white/45 bg-white/85 px-2.5 py-1.5 text-center shadow-sm transition-transform duration-200 motion-safe:hover:scale-[1.02]">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-xs font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function DashTab({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200",
        active ? "ui-btn-primary shadow-md" : "ui-btn-light opacity-90 hover:opacity-100",
      ].join(" ")}
    >
      {children}
    </button>
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
  const pick = lines.slice(0, 5);
  if (pick.length === 0) return null;
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3">
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

/** Short x-axis labels that stay unique (avoid two themes both collapsing to "Financial"). */
function scorecardBarCategories(rows: { theme: string }[]): string[] {
  const labels = rows.map((row) => {
    const t = row.theme.trim().replace(/\s+/g, " ");
    const head = t.split(/ & | \+ /)[0] ?? t;
    const words = head.split(" ");
    if (words.length >= 2) {
      const two = `${words[0]} ${words[1]}`;
      return two.length > 30 ? `${two.slice(0, 28)}…` : two;
    }
    return head.length > 22 ? `${head.slice(0, 20)}…` : head;
  });
  const seen = new Map<string, number>();
  return labels.map((lab) => {
    const n = (seen.get(lab) ?? 0) + 1;
    seen.set(lab, n);
    if (n === 1) return lab;
    return `${lab.replace(/…$/, "").slice(0, 14)}·${n}`;
  });
}

const DONUT_PALETTE = ["#0D50AC", "#0b6381", "#7c3aed", "#b45309", "#64748b", "#94a3b8", "#cbd5e1"];

function shareDonutSlices(snapshot: DemoSnapshot): DonutSlice[] {
  const us = snapshot.performance.overallSharePct;
  const comps = snapshot.performance.competitors.slice(0, 4);
  const assigned = us + comps.reduce((s, c) => s + c.sharePct, 0);
  const rest = Math.max(0, 100 - assigned);
  const out: DonutSlice[] = [
    { label: snapshot.company.name, value: us, color: DONUT_PALETTE[0] },
    ...comps.map((c, i) => ({
      label: c.name,
      value: c.sharePct,
      color: DONUT_PALETTE[(i % (DONUT_PALETTE.length - 2)) + 1],
    })),
  ];
  if (rest > 0.4) out.push({ label: "Other", value: rest, color: DONUT_PALETTE[DONUT_PALETTE.length - 1] });
  return out;
}

function quarterInsightBullets(snapshot: DemoSnapshot): string[] {
  const brands = snapshot.performance.brands;
  const best = brands.length ? brands.reduce((a, b) => (a.brandProfit >= b.brandProfit ? a : b), brands[0]) : null;
  const stockouts = brands.filter((b) => b.stockout).length;
  const seg = snapshot.performance.segmentDemand;
  const tightest =
    seg.length > 0
      ? seg.reduce(
          (bestRow, row) => {
            const gap = row.industryUnits > 0 ? row.teamUnits / row.industryUnits : 0;
            const bestGap =
              bestRow.industryUnits > 0 ? bestRow.teamUnits / bestRow.industryUnits : 0;
            return gap < bestGap ? row : bestRow;
          },
          seg[0],
        )
      : null;
  const sc = snapshot.balancedScorecard;
  const mover =
    sc.length > 0 ? sc.reduce((a, b) => (a.score - a.priorScore >= b.score - b.priorScore ? a : b), sc[0]) : null;

  const bullets: string[] = [];
  if (best && brands.length) {
    bullets.push(
      `Lead profit engine: ${best.name} at ${shortMoney(best.brandProfit)} brand profit — watch demand (${best.demand.toLocaleString()} units) vs sold (${best.sold.toLocaleString()}).`,
    );
  }
  if (stockouts > 0) {
    bullets.push(`${stockouts} brand${stockouts === 1 ? "" : "s"} flagged stockout — revisit production and inventory before the next decision round.`);
  } else {
    bullets.push("No brand stockouts this quarter — fulfillment kept pace with demand.");
  }
  if (tightest && seg.length) {
    bullets.push(
      `Tightest segment vs industry demand: ${tightest.segment} (team ${tightest.teamUnits.toLocaleString()} vs industry ${tightest.industryUnits.toLocaleString()} units).`,
    );
  }
  if (mover && sc.length) {
    bullets.push(
      `Biggest scorecard move: ${mover.theme.replace(/ & /g, " & ")} (${mover.priorScore} → ${mover.score}, ${mover.trend}).`,
    );
  }
  const ratio0 = snapshot.accounting.industryRatios[0];
  if (ratio0) {
    bullets.push(
      `Industry check (${ratio0.name}): team ${ratio0.unit === "percent" ? `${ratio0.teamValue}%` : ratio0.teamValue} vs median ${ratio0.unit === "percent" ? `${ratio0.industryMedian}%` : ratio0.industryMedian}.`,
    );
  }
  bullets.push(
    `Sales productivity index ${snapshot.humanResources.salesProductivityIndex} — ${snapshot.humanResources.headcountNote}`,
  );
  return bullets.slice(0, 7);
}

function projectTrendInsights(
  scenario: NonNullable<DemoScenario>,
  activeQuarterIndex: number,
): string[] {
  const q = scenario.quarters;
  const cur = q[activeQuarterIndex];
  const prev = q[Math.max(0, activeQuarterIndex - 1)];
  const rev = cur.accounting.revenue - prev.accounting.revenue;
  const ni = cur.accounting.netIncome - prev.accounting.netIncome;
  const bestRev = q.reduce((best, row, i) => (row.accounting.revenue > best.val ? { i, val: row.accounting.revenue } : best), {
    i: 0,
    val: q[0].accounting.revenue,
  });
  const bullets: string[] = [];
  bullets.push(
    `Active window is ${cur.quarter.label}: revenue ${shortMoney(cur.accounting.revenue)}, net income ${shortMoney(cur.accounting.netIncome)}, ending cash ${shortMoney(cur.accounting.endingCash)}.`,
  );
  bullets.push(
    `Sequential change vs prior quarter: revenue ${rev >= 0 ? "+" : ""}${shortMoney(rev)}, net income ${ni >= 0 ? "+" : ""}${shortMoney(ni)}.`,
  );
  bullets.push(
    `Peak revenue quarter in this run: ${q[bestRev.i].quarter.label} at ${shortMoney(bestRev.val)} — compare mix, share, and capacity in the quarter table.`,
  );
  return bullets;
}

function quarterCoachInsightLines(snapshot: DemoSnapshot): string[] {
  const ec = snapshot.accounting.endingCash;
  const bc = snapshot.accounting.beginningCash;
  const cashDir = ec >= bc ? "improved" : "tightened";
  return [
    "Pair share composition with segment demand: share gains matter more when industry demand in your target segments is growing, not shrinking.",
    "If “top revenue” brands are not “top profit” brands, stress-test price, rebates, and COGS before pushing more volume into the same mix.",
    "Balanced scorecard themes reward balanced execution—pick one or two themes to lift next round instead of spreading effort thin.",
    "Advertising mix is about alignment, not equality: heavier internet spend may fit digital segments; national spend supports broad awareness.",
    `Liquidity ${cashDir} this quarter (ending ${shortMoney(ec)} vs beginning ${shortMoney(bc)}). Tie the change to operations, financing, and dividends—not revenue alone.`,
  ];
}

function projectCoachInsightLines(scenario: NonNullable<DemoScenario>, activeQuarterIndex: number): string[] {
  const q = scenario.quarters;
  const n = q.length;
  const firstShare = q[0].performance.overallSharePct;
  const lastShare = q[n - 1].performance.overallSharePct;
  const cur = q[activeQuarterIndex];
  return [
    "Use bars for absolute quarter scale, area for profit momentum, and lines for share—together they tell a clearer story than four identical line charts.",
    "Ending cash can diverge from net income when inventory, receivables, debt, or dividends move—if the two disagree, walk the cash flow path before you decide.",
    `Across this project, share moved from ${firstShare.toFixed(1)}% to ${lastShare.toFixed(1)}%. Connect that arc to segment bets, capacity, and competitor reactions.`,
    `${cur.quarter.label} is highlighted on trend charts—cross-check those highlights against the quarter table before you present in class.`,
    "Before your next decision round, reconcile one revenue driver, one major cost block, and one operational risk (inventory, stockout, or capacity).",
  ];
}

function CoachInsightsBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="dashboard-coach-insights">
      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-900/90">{title}</p>
      <ul className="mt-3 list-none space-y-2.5 p-0 text-[13px] leading-relaxed text-emerald-950/95">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function projectSnapshotCoachLines(scenario: NonNullable<DemoScenario>, cur: (typeof scenario.quarters)[0]): string[] {
  const q = scenario.quarters;
  const n = q.length;
  const share0 = q[0].performance.overallSharePct;
  const shareN = q[n - 1].performance.overallSharePct;
  return [
    `Narrate the arc: ${n} quarters, share from ${share0.toFixed(1)}% to ${shareN.toFixed(1)}% — tie the story to segment choices and competitor pressure, not only ad spend.`,
    `Active row (${cur.quarter.label}): reconcile revenue ${shortMoney(cur.accounting.revenue)}, net income ${shortMoney(cur.accounting.netIncome)}, and ending cash ${shortMoney(cur.accounting.endingCash)} in one sentence each.`,
    "If net income and cash diverge, explain working capital, inventory, debt, or dividends before you claim “profitability improved.”",
    "End with one risk and one opportunity you will test next round (price, capacity, segment, or brand mix).",
  ];
}

type QuarterTab = "overview" | "performance" | "financials" | "operations";

function QuarterDashboardBody({ snapshot }: { snapshot: DemoSnapshot }) {
  const [tab, setTab] = useState<QuarterTab>("overview");
  const brands = snapshot.performance.brands;
  const insightBullets = quarterInsightBullets(snapshot);
  const ad = snapshot.marketing.advertisingSpend;
  const adTotal = ad.nationalMedia + ad.regionalMedia + ad.localMedia + ad.internet;
  const topRevenueBrands = [...brands]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)
    .map((b) => ({ label: b.name, value: b.revenue }));
  const strategicPts = snapshot.performance.strategicGraph.map((p) => ({
    label: p.quarterLabel.replace("Quarter ", "Q"),
    value: p.marketAppealIndex,
  }));

  const kpiRow = (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      <KpiPill label="Revenue" value={shortMoney(snapshot.accounting.revenue)} />
      <KpiPill label="Net income" value={shortMoney(snapshot.accounting.netIncome)} />
      <KpiPill label="Ending cash" value={shortMoney(snapshot.accounting.endingCash)} />
      <KpiPill label="Overall share" value={`${snapshot.performance.overallSharePct.toFixed(1)}%`} />
      <KpiPill label="Scorecard index" value={String(snapshot.quarter.cumulativeBalancedScorecardIndex)} />
    </div>
  );

  const tabBar = (
    <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
      <DashTab active={tab === "overview"} onClick={() => setTab("overview")}>
        Overview
      </DashTab>
      <DashTab active={tab === "performance"} onClick={() => setTab("performance")}>
        Market & brands
      </DashTab>
      <DashTab active={tab === "financials"} onClick={() => setTab("financials")}>
        Financials
      </DashTab>
      <DashTab active={tab === "operations"} onClick={() => setTab("operations")}>
        Operations
      </DashTab>
    </div>
  );

  return (
    <div className="space-y-4">
      {tabBar}
      {tab === "overview" && (
        <div className="dashboard-animate-children space-y-4">
          <div className="dashboard-unified-panel space-y-5">
            {kpiRow}
            <div className="dashboard-executive space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#0B6381]/90">Executive overview</p>
              <p className="text-sm leading-relaxed text-slate-800">
                <span className="font-semibold text-slate-900">{snapshot.company.name}</span> — {snapshot.quarter.label}. Strategy:{" "}
                {snapshot.company.strategyOneLiner} Target segments: {snapshot.company.targetSegments.join(", ")}. This quarter closed at{" "}
                <span className="font-semibold tabular-nums">{shortMoney(snapshot.accounting.revenue)}</span> revenue,{" "}
                <span className="font-semibold tabular-nums">{shortMoney(snapshot.accounting.netIncome)}</span> net income, and{" "}
                <span className="font-semibold">{snapshot.performance.overallSharePct.toFixed(1)}%</span> overall share with a cumulative scorecard index of{" "}
                {snapshot.quarter.cumulativeBalancedScorecardIndex}.
              </p>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {insightBullets.map((line, bi) => (
                  <li
                    key={bi}
                    className="flex gap-2 rounded-lg border border-slate-100/90 bg-slate-50/80 px-3 py-2 text-[12px] leading-snug text-slate-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0D50AC]" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              {snapshot.performance.marketImpactNote ? (
                <p className="rounded-lg border border-sky-100/90 bg-sky-50/80 px-3 py-2 text-[12px] leading-relaxed text-slate-700">
                  <span className="font-semibold text-slate-900">Market impact: </span>
                  {snapshot.performance.marketImpactNote}
                </p>
              ) : null}
              <p className="text-[11px] leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-800">Go-to-market: </span>
                {snapshot.marketing.tacticalSummary.slice(0, 280)}
                {snapshot.marketing.tacticalSummary.length > 280 ? "…" : ""}
              </p>
            </div>

            <CoachInsightsBlock title="Coach insights — how to read this dashboard" lines={quarterCoachInsightLines(snapshot)} />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="dashboard-chart-card">
                <p className="mb-1 text-[11px] font-semibold text-slate-800">Share composition (team + top competitors)</p>
                <p className="mb-2 text-[10px] text-slate-500">Hover segments to spotlight — tooltips show exact share points.</p>
                <MiniDonutChart wide slices={shareDonutSlices(snapshot)} formatter={(v) => `${v.toFixed(1)}%`} />
              </div>
              <div className="dashboard-chart-card">
                <p className="mb-1 text-[11px] font-semibold text-slate-800">Advertising mix</p>
                <p className="mb-2 text-[10px] text-slate-500">
                  Stacked by spend ({adTotal > 0 ? shortMoney(adTotal) : "—"} total). Hover to compare channel weight.
                </p>
                <MiniStackedHorizontalBar
                  wide
                  segments={[
                    { label: "National", value: ad.nationalMedia, color: "#0D50AC" },
                    { label: "Regional", value: ad.regionalMedia, color: "#38bdf8" },
                    { label: "Local", value: ad.localMedia, color: "#0b6381" },
                    { label: "Internet", value: ad.internet, color: "#a78bfa" },
                  ]}
                  formatter={shortMoney}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="dashboard-chart-card">
                <p className="mb-1 text-[11px] font-semibold text-slate-800">Brand profit (interactive)</p>
                <p className="mb-2 text-[10px] text-slate-500">Hover a brand cluster to dim the rest — values in tooltips.</p>
                <MiniGroupedBarChart
                  wide
                  interactive
                  categories={brands.map((b) => b.name)}
                  series={[{ label: "Profit", color: "#0b6381", values: brands.map((b) => b.brandProfit) }]}
                  formatter={shortMoney}
                />
              </div>
              <div className="dashboard-chart-card">
                <p className="mb-1 text-[11px] font-semibold text-slate-800">Top brands by revenue</p>
                <p className="mb-2 text-[10px] text-slate-500">Horizontal ranking — hover bars to highlight.</p>
                <MiniHorizontalBarChart wide rows={topRevenueBrands} color="#0D50AC" formatter={shortMoney} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="dashboard-chart-card">
                <p className="mb-2 text-[11px] font-semibold text-slate-800">Segment demand (team vs industry)</p>
                <MiniGroupedBarChart
                  wide
                  interactive
                  categories={snapshot.performance.segmentDemand.map((s) => s.segment)}
                  series={[
                    {
                      label: "Industry",
                      color: "#cbd5e1",
                      values: snapshot.performance.segmentDemand.map((s) => s.industryUnits),
                    },
                    {
                      label: "Team",
                      color: "#0D50AC",
                      values: snapshot.performance.segmentDemand.map((s) => s.teamUnits),
                    },
                  ]}
                />
              </div>
              <div className="dashboard-chart-card">
                {strategicPts.length >= 2 ? (
                  <>
                    <p className="mb-1 text-[11px] font-semibold text-slate-800">Strategic momentum — market appeal</p>
                    <p className="mb-2 text-[10px] text-slate-500">Area view of the appeal index across recent quarters (hover points).</p>
                    <MiniAreaChart
                      wide
                      points={strategicPts}
                      color="#0b6381"
                      formatter={(v) => String(Math.round(v))}
                      highlightIndex={strategicPts.length - 1}
                    />
                  </>
                ) : (
                  <>
                    <p className="mb-1 text-[11px] font-semibold text-slate-800">Balanced scorecard — current quarter</p>
                    <p className="mb-2 text-[10px] text-slate-500">Theme scores (horizontal bars) when the multi-quarter strategy series is short.</p>
                    <MiniHorizontalBarChart
                      wide
                      rows={snapshot.balancedScorecard.slice(0, 8).map((r) => ({
                        label: r.theme.length > 28 ? `${r.theme.slice(0, 26)}…` : r.theme,
                        value: r.score,
                      }))}
                      color="#0f766e"
                      formatter={(v) => `${Math.round(v)} pts`}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <BridgeFlow snapshot={snapshot} />
          <div className="dashboard-chart-card pb-6 sm:pb-8">
            <p className="mb-1 text-[11px] font-semibold text-slate-800">Balanced scorecard themes (current vs prior)</p>
            <p className="mb-2 text-[10px] text-slate-500">
              Grouped view to compare quarter-over-quarter theme movement. Axis labels truncate when crowded — hover a label for the full theme name.
            </p>
            <MiniGroupedBarChart
              wide
              interactive
              categories={scorecardBarCategories(snapshot.balancedScorecard)}
              categoryDetail={snapshot.balancedScorecard.map((r) => r.theme)}
              series={[
                { label: "Current", color: "#0D50AC", values: snapshot.balancedScorecard.map((r) => r.score) },
                { label: "Prior", color: "#94a3b8", values: snapshot.balancedScorecard.map((r) => r.priorScore) },
              ]}
              formatter={(v) => `${Math.round(v)}`}
            />
          </div>
        </div>
      )}

      {tab === "performance" && (
        <div className="dashboard-animate-children space-y-4">
          {kpiRow}
          <div className="dashboard-chart-card">
            <p className="mb-2 text-[11px] font-semibold text-slate-800">Competitor share snapshot</p>
            <MiniGroupedBarChart
              wide
              categories={[snapshot.company.name, ...snapshot.performance.competitors.map((c) => c.name)]}
              series={[
                {
                  label: "Share %",
                  color: "#0D50AC",
                  values: [snapshot.performance.overallSharePct, ...snapshot.performance.competitors.map((c) => c.sharePct)],
                },
              ]}
              formatter={(v) => `${v.toFixed(0)}%`}
            />
          </div>
          <div className="dashboard-chart-card">
            <p className="mb-2 text-[11px] font-semibold text-slate-800">Brand demand vs sold</p>
            <MiniGroupedBarChart
              wide
              categories={brands.map((b) => b.name)}
              series={[
                { label: "Demand", color: "#7dd3fc", values: brands.map((b) => b.demand) },
                { label: "Sold", color: "#0b6381", values: brands.map((b) => b.sold) },
              ]}
            />
          </div>
          {snapshot.performance.strategicGraph.length >= 2 ? (
            <div className="dashboard-chart-card">
              <p className="mb-2 text-[11px] font-semibold text-slate-800">Strategic trend — market appeal</p>
              <MiniLineChart
                wide
                points={snapshot.performance.strategicGraph.map((p) => ({
                  label: p.quarterLabel.replace("Quarter ", "Q"),
                  value: p.marketAppealIndex,
                }))}
                color="#0b6381"
                formatter={(v) => String(Math.round(v))}
                highlightIndex={snapshot.performance.strategicGraph.length - 1}
              />
            </div>
          ) : null}
        </div>
      )}

      {tab === "financials" && (
        <div className="dashboard-animate-children space-y-4">
          {kpiRow}
          <BridgeFlow snapshot={snapshot} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="dashboard-chart-card">
              <p className="text-[11px] font-semibold text-slate-800">Cash position</p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{shortMoney(snapshot.accounting.endingCash)}</p>
              <p className="mt-1 text-[10px] text-slate-500">Beginning {shortMoney(snapshot.accounting.beginningCash)}</p>
            </div>
            <div className="dashboard-chart-card">
              <p className="text-[11px] font-semibold text-slate-800">Equity & leverage (demo)</p>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-700">
                <li className="flex justify-between">
                  <span>Equity</span>
                  <span className="font-medium tabular-nums">{shortMoney(snapshot.accounting.equity)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Total liabilities</span>
                  <span className="font-medium tabular-nums">{shortMoney(snapshot.accounting.totalLiabilities)}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white/95">
            <table className="w-full min-w-[360px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-left text-[10px] font-semibold uppercase text-slate-600">
                  <th className="px-2 py-2">Ratio</th>
                  <th className="px-2 py-2">Team</th>
                  <th className="px-2 py-2">Industry</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.accounting.industryRatios.slice(0, 5).map((r) => (
                  <tr key={r.name} className="border-b border-slate-100">
                    <td className="px-2 py-1.5 text-slate-800">{r.name}</td>
                    <td className="px-2 py-1.5 tabular-nums font-medium">{r.unit === "percent" ? `${r.teamValue}%` : r.teamValue}</td>
                    <td className="px-2 py-1.5 tabular-nums text-slate-600">{r.unit === "percent" ? `${r.industryMedian}%` : r.industryMedian}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "operations" && (
        <div className="dashboard-animate-children space-y-4">
          {kpiRow}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="dashboard-chart-card text-center">
              <p className="text-[10px] font-semibold uppercase text-slate-500">Capacity</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{snapshot.manufacturing.operatingCapacityUnits.toLocaleString()} u</p>
              <p className="text-[11px] text-slate-600">{snapshot.manufacturing.utilizationPct}% utilization</p>
            </div>
            <div className="dashboard-chart-card text-center">
              <p className="text-[10px] font-semibold uppercase text-slate-500">Lost sales</p>
              <p className="mt-1 text-lg font-bold text-rose-800">{snapshot.manufacturing.lostSalesUnits} units</p>
            </div>
            <div className="dashboard-chart-card text-center">
              <p className="text-[10px] font-semibold uppercase text-slate-500">Inventory (total)</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{snapshot.manufacturing.endingInventoryTotal.toLocaleString()}</p>
            </div>
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
                  <tr key={b.name} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                    <td className="px-2 py-1.5 font-medium text-slate-900">{b.name}</td>
                    <td className="px-2 py-1.5 tabular-nums text-slate-700">{b.demand}</td>
                    <td className="px-2 py-1.5 tabular-nums text-slate-700">{b.sold}</td>
                    <td className="px-2 py-1.5 text-slate-600">{b.stockout ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600">{snapshot.manufacturing.productionNotes}</p>
        </div>
      )}
    </div>
  );
}

type ProjectTab = "trends" | "snapshot" | "quarters";

function ProjectDashboardBody({
  snapshot,
  scenario,
  activeQuarterIndex,
}: {
  snapshot: DemoSnapshot;
  scenario?: DemoScenario;
  activeQuarterIndex: number;
}) {
  const [tab, setTab] = useState<ProjectTab>("trends");
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

  const qLabel = (q: (typeof scenario.quarters)[0]) => q.quarter.label.replace("Quarter ", "Q");
  const niPts = scenario.quarters.map((q) => ({ label: qLabel(q), value: q.accounting.netIncome }));
  const sharePts = scenario.quarters.map((q) => ({ label: qLabel(q), value: q.performance.overallSharePct }));
  const scPts = scenario.quarters.map((q) => ({ label: qLabel(q), value: q.quarter.cumulativeBalancedScorecardIndex }));
  const projectBullets = projectTrendInsights(scenario, activeQuarterIndex);
  const revBarCategories = scenario.quarters.map((q) => qLabel(q));
  const revBarValues = scenario.quarters.map((q) => q.accounting.revenue);
  const cashRows = scenario.quarters.map((q) => ({
    label: qLabel(q),
    value: q.accounting.endingCash,
  }));

  const prevIdx = Math.max(0, activeQuarterIndex - 1);
  const cur = scenario.quarters[activeQuarterIndex];
  const prev = scenario.quarters[prevIdx];
  const revDelta = cur.accounting.revenue - prev.accounting.revenue;
  const niDelta = cur.accounting.netIncome - prev.accounting.netIncome;
  const hi = Math.min(activeQuarterIndex, scenario.quarters.length - 1);

  const kpiProject = (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      <KpiPill label="Active quarter" value={qLabel(cur)} />
      <KpiPill label="Revenue" value={shortMoney(cur.accounting.revenue)} />
      <KpiPill label="Δ Revenue vs prior" value={`${revDelta >= 0 ? "+" : ""}${shortMoney(revDelta)}`} />
      <KpiPill label="Δ Net income vs prior" value={`${niDelta >= 0 ? "+" : ""}${shortMoney(niDelta)}`} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
        <DashTab active={tab === "trends"} onClick={() => setTab("trends")}>
          Trends & charts
        </DashTab>
        <DashTab active={tab === "snapshot"} onClick={() => setTab("snapshot")}>
          Snapshot
        </DashTab>
        <DashTab active={tab === "quarters"} onClick={() => setTab("quarters")}>
          Quarter table
        </DashTab>
      </div>

      {tab === "trends" && (
        <div className="dashboard-animate-children space-y-4">
          <div className="dashboard-unified-panel space-y-5">
            {kpiProject}
            <div className="dashboard-executive space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#0B6381]/90">Project narrative</p>
              <p className="text-sm leading-relaxed text-slate-800">
                <span className="font-semibold text-slate-900">{snapshot.company.name}</span> — multi-quarter trajectory. The charts below mix{" "}
                <span className="font-medium">bars, areas, and lines</span> so you can read momentum (shape) and absolute scale (bars) without scanning four identical
                line panels.
              </p>
              <ul className="space-y-2">
                {projectBullets.map((line, pi) => (
                  <li key={pi} className="flex gap-2 text-[12px] leading-snug text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0b6381]" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <CoachInsightsBlock title="Coach insights — study pointers" lines={projectCoachInsightLines(scenario, activeQuarterIndex)} />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="dashboard-chart-card">
                <p className="mb-1 text-[11px] font-semibold text-slate-800">Revenue by quarter (bars)</p>
                <p className="mb-2 text-[10px] text-slate-500">Compare absolute quarter size — hover to dim other periods.</p>
                <MiniGroupedBarChart
                  wide
                  interactive
                  categories={revBarCategories}
                  series={[{ label: "Revenue", color: "#0D50AC", values: revBarValues }]}
                  formatter={shortMoney}
                />
              </div>
              <div className="dashboard-chart-card">
                <p className="mb-1 text-[11px] font-semibold text-slate-800">Net income trajectory (area)</p>
                <p className="mb-2 text-[10px] text-slate-500">Filled trend highlights operating leverage between quarters.</p>
                <MiniAreaChart wide points={niPts} formatter={shortMoney} color="#0f766e" highlightIndex={hi} />
              </div>
              <div className="dashboard-chart-card">
                <p className="mb-1 text-[11px] font-semibold text-slate-800">Overall share % (line)</p>
                <p className="mb-2 text-[10px] text-slate-500">Point-to-point market position — highlighted quarter matches the KPI strip.</p>
                <MiniLineChart
                  wide
                  points={sharePts}
                  formatter={(v) => `${v.toFixed(1)}%`}
                  color="#7c3aed"
                  highlightIndex={hi}
                />
              </div>
              <div className="dashboard-chart-card">
                <p className="mb-1 text-[11px] font-semibold text-slate-800">Ending cash by quarter</p>
                <p className="mb-2 text-[10px] text-slate-500">Horizontal bars make liquidity easy to compare at a glance.</p>
                <MiniHorizontalBarChart wide rows={cashRows} color="#b45309" formatter={shortMoney} />
              </div>
            </div>
          </div>

          <div className="dashboard-chart-card">
            <p className="mb-1 text-[11px] font-semibold text-slate-800">Cumulative balanced scorecard index</p>
            <p className="mb-2 text-[10px] text-slate-500">Line view for the long-running cumulative index (distinct from quarterly bars in the quarter dashboard).</p>
            <MiniLineChart
              wide
              points={scPts}
              formatter={(v) => String(Math.round(v))}
              color="#0b6381"
              highlightIndex={hi}
            />
          </div>
        </div>
      )}

      {tab === "snapshot" && (
        <div className="dashboard-animate-children space-y-4">
          {kpiProject}
          <div className="dashboard-unified-panel space-y-6">
            <div className="dashboard-executive space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#0B6381]/90">Integrated snapshot</p>
              <p className="text-sm leading-relaxed text-slate-800">
                Use this tab as a <span className="font-semibold">narrative outline</span> for class discussion or your written debrief. Figures below pull from the
                highlighted quarter ({cur.quarter.label}) while the project context spans all {scenario.quarters.length} loaded quarters.
              </p>
              <p className="text-sm leading-relaxed text-slate-700">
                <span className="font-semibold text-slate-900">{snapshot.company.name}</span> — strategy: {snapshot.company.strategyOneLiner} Segments:{" "}
                {snapshot.company.targetSegments.join(", ")}.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200/85 bg-white/95 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Performance & market</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-slate-800">
                  <li>
                    Overall share <span className="font-semibold tabular-nums">{cur.performance.overallSharePct.toFixed(1)}%</span>; cumulative balanced scorecard index{" "}
                    <span className="font-semibold">{cur.quarter.cumulativeBalancedScorecardIndex}</span>.
                  </li>
                  <li>
                    {cur.performance.brands.length} brand{cur.performance.brands.length === 1 ? "" : "s"} tracked — combined brand revenue ties to segment and pricing choices.
                  </li>
                  <li>{cur.performance.marketImpactNote || "No separate market-impact note for this slice — use segment demand and competitor rows in the quarter dashboard."}</li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200/85 bg-white/95 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Financial position</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-slate-800">
                  <li>
                    Revenue <span className="font-semibold tabular-nums">{shortMoney(cur.accounting.revenue)}</span>, net income{" "}
                    <span className="font-semibold tabular-nums">{shortMoney(cur.accounting.netIncome)}</span>.
                  </li>
                  <li>
                    Cash: beginning <span className="tabular-nums">{shortMoney(cur.accounting.beginningCash)}</span> → ending{" "}
                    <span className="font-semibold tabular-nums">{shortMoney(cur.accounting.endingCash)}</span>.
                  </li>
                  <li>
                    Equity {shortMoney(cur.accounting.equity)}; liabilities {shortMoney(cur.accounting.totalLiabilities)} — use with ratios in the Financials view for industry
                    comparison.
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200/85 bg-white/95 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Operations & fulfillment</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-slate-800">
                  <li>
                    Capacity {cur.manufacturing.operatingCapacityUnits.toLocaleString()} units at {cur.manufacturing.utilizationPct}% utilization; lost sales{" "}
                    {cur.manufacturing.lostSalesUnits} units.
                  </li>
                  <li>Ending inventory (total) {cur.manufacturing.endingInventoryTotal.toLocaleString()} — connect to demand forecast and stockout flags by brand in Operations.</li>
                  <li className="text-slate-700">{cur.manufacturing.tacticalSummary}</li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200/85 bg-white/95 p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Marketing & sales motion</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-slate-800">
                  <li>{cur.marketing.tacticalSummary}</li>
                  <li>{cur.sales.tacticalSummary}</li>
                  <li>
                    HR snapshot: {cur.humanResources.headcountNote} (productivity index {cur.humanResources.salesProductivityIndex}).
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/90 p-4 text-[13px] leading-relaxed text-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Across the full project</p>
              <p className="mt-2">
                Revenue ranged from {shortMoney(Math.min(...scenario.quarters.map((x) => x.accounting.revenue)))} to{" "}
                {shortMoney(Math.max(...scenario.quarters.map((x) => x.accounting.revenue)))} across quarters. Share ranged from{" "}
                {Math.min(...scenario.quarters.map((x) => x.performance.overallSharePct)).toFixed(1)}% to{" "}
                {Math.max(...scenario.quarters.map((x) => x.performance.overallSharePct)).toFixed(1)}%. You are focused on row{" "}
                <span className="font-semibold">{activeQuarterIndex + 1}</span> of {scenario.quarters.length} in the quarter table.
              </p>
            </div>

            <CoachInsightsBlock title="Coach insights — written & oral debrief" lines={projectSnapshotCoachLines(scenario, cur)} />
          </div>
        </div>
      )}

      {tab === "quarters" && (
        <div className="dashboard-animate-children space-y-4">
          {kpiProject}
          <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white/95">
            <table className="w-full min-w-[520px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-left text-[10px] font-semibold uppercase text-slate-600">
                  <th className="px-3 py-2">Q</th>
                  <th className="px-3 py-2">Revenue</th>
                  <th className="px-3 py-2">Net income</th>
                  <th className="px-3 py-2">Share %</th>
                  <th className="px-3 py-2">Ending cash</th>
                  <th className="px-3 py-2">Score idx</th>
                </tr>
              </thead>
              <tbody>
                {scenario.quarters.map((q, i) => (
                  <tr
                    key={q.quarter.label}
                    className={`border-b border-slate-100 transition-colors ${i === activeQuarterIndex ? "bg-sky-50/90" : "hover:bg-slate-50/60"}`}
                  >
                    <td className="px-3 py-2 font-medium text-slate-900">{qLabel(q)}</td>
                    <td className="px-3 py-2 tabular-nums">{shortMoney(q.accounting.revenue)}</td>
                    <td className="px-3 py-2 tabular-nums">{shortMoney(q.accounting.netIncome)}</td>
                    <td className="px-3 py-2 tabular-nums">{q.performance.overallSharePct.toFixed(1)}%</td>
                    <td className="px-3 py-2 tabular-nums">{shortMoney(q.accounting.endingCash)}</td>
                    <td className="px-3 py-2 tabular-nums">{q.quarter.cumulativeBalancedScorecardIndex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function CoachDashboardModalBody({
  widgetScope,
  snapshot,
  scenario,
  activeQuarterIndex,
}: {
  widgetScope: "quarter" | "project";
  snapshot: DemoSnapshot;
  scenario?: DemoScenario;
  activeQuarterIndex: number;
}) {
  const effectiveScope =
    widgetScope === "project" && (!scenario || scenario.quarters.length < 2) ? "quarter" : widgetScope;
  if (effectiveScope === "project") {
    return <ProjectDashboardBody snapshot={snapshot} scenario={scenario} activeQuarterIndex={activeQuarterIndex} />;
  }
  return <QuarterDashboardBody snapshot={snapshot} />;
}

export function DashboardPreviewWidget({
  widget,
  context,
  initialOpen = false,
}: {
  widget: DashboardPreviewConfig;
  context: DashboardContext;
  /** Opens the modal on mount (e.g. dev / QA). */
  initialOpen?: boolean;
}) {
  const navigate = useNavigate();
  const { scenario: liveScenario } = useDemoData();
  const { snapshot, scenario: contextScenario, activeQuarterIndex } = context;
  const scenarioForTransfer = contextScenario ?? liveScenario;
  const [open, setOpen] = useState(initialOpen);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();

  useLayoutEffect(() => {
    if (initialOpen) setOpen(true);
  }, [initialOpen]);

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
    scope === "project" && (!scenarioForTransfer || scenarioForTransfer.quarters.length < 2) ? "quarter" : scope;

  const title =
    widget.title ??
    (effectiveScope === "project"
      ? `${snapshot.company.name} — project dashboard`
      : `${snapshot.company.name} — ${snapshot.quarter.label}`);

  const caption =
    widget.caption ??
    (effectiveScope === "project"
      ? "Multi-quarter overview: share, revenue, profit, cash, scorecard, brands, and capacity trends."
      : "Quarter snapshot across performance, financials, and operations.");

  const previewRevenue = snapshot.accounting.revenue;
  const previewShare = snapshot.performance.overallSharePct;
  const previewNi = snapshot.accounting.netIncome;

  const trendPoints =
    scenarioForTransfer && scenarioForTransfer.quarters.length > 1
      ? scenarioForTransfer.quarters.map((q) => ({
          label: q.quarter.label.replace("Quarter ", "Q"),
          value: q.accounting.revenue,
        }))
      : [
          { label: "Prior (est.)", value: previewRevenue * 0.92 },
          { label: snapshot.quarter.label.replace("Quarter ", "Q"), value: previewRevenue },
        ];

  const modalContent = (
    <CoachDashboardModalBody
      widgetScope={scope}
      snapshot={snapshot}
      scenario={contextScenario}
      activeQuarterIndex={activeQuarterIndex}
    />
  );

  const openFullDashboardInNewTab = () => {
    const tid = crypto.randomUUID();
    const payload: CoachDashboardTransferPayload = {
      v: 1,
      scenario: scenarioForTransfer,
      activeQuarterIndex,
      scope: effectiveScope,
    };
    try {
      stashCoachDashboardTransfer(tid, payload);
    } catch {
      /* private mode / quota */
    }
    const url = new URL("/dashboard", window.location.origin);
    url.searchParams.set("tid", tid);
    url.searchParams.set("scope", effectiveScope);
    url.searchParams.set("quarter", String(activeQuarterIndex + 1));
    window.open(url.toString(), "_blank", "noopener,noreferrer");
    setOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      <section
        className="animate-panel-rise overflow-hidden rounded-2xl border border-[#0B6381]/25 bg-gradient-to-br from-[#f0f9fc] to-white p-3 shadow-[0_12px_40px_-16px_rgba(11,99,129,0.15)]"
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
        <div className="mt-2 rounded-xl border border-white/50 bg-white/80 p-2">
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
            className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-3 md:p-6"
            role="presentation"
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/55 backdrop-blur-md transition-opacity motion-reduce:transition-none"
              aria-label="Close dashboard overlay"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              className="dashboard-modal-shell relative z-[101] flex h-[82dvh] max-h-[82dvh] w-[82vw] max-w-[min(82vw,1280px)] min-w-0 flex-col overflow-hidden rounded-t-2xl border border-white/50 bg-gradient-to-b from-[#eef6f9] via-white to-[#f8fafc] shadow-[0_32px_100px_-24px_rgba(0,0,0,0.5)] sm:rounded-2xl"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/50 bg-white/90 px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <p id={titleId} className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                    {title}
                  </p>
                  <p id={descId} className="mt-0.5 text-xs text-slate-600 sm:text-sm">
                    {caption}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0B6381]/22 bg-white text-[#0B6381] shadow-sm transition hover:border-[#0B6381]/38 hover:bg-[#0B6381]/[0.06]"
                    title="Open full dashboard in a new tab (this tab returns to AI Coach)"
                    aria-label="Open full dashboard in a new tab; this tab returns to AI Coach"
                    onClick={openFullDashboardInNewTab}
                  >
                    <svg
                      className="h-[15px] w-[15px] shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M14 3h7v7" />
                      <path d="M10 14 21 3" />
                      <path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                    </svg>
                  </button>
                  <button
                    ref={closeBtnRef}
                    type="button"
                    className="ui-btn-light rounded-xl px-4 py-2 text-xs font-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">{modalContent}</div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
