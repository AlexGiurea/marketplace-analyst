import type { DemoQuarterSlice, DemoScenario, DemoSnapshot } from "../types/demoSnapshot.js";
import { seedDemoSnapshot } from "./demoSnapshotSeed.js";
import { buildKnowledgeIndex } from "./knowledgeIndexBuilder.js";

export function materializeSnapshot(scenario: DemoScenario, quarterIndex: number): DemoSnapshot {
  const q = scenario.quarters[quarterIndex];
  if (!q) {
    throw new Error(`Invalid quarter index ${quarterIndex}`);
  }
  return {
    uiDisclaimer: scenario.uiDisclaimer,
    simulation: scenario.simulation,
    company: scenario.company,
    ...q,
  };
}

export function sliceFromSnapshot(s: DemoSnapshot): DemoQuarterSlice {
  const { uiDisclaimer: _u, simulation: _s, company: _c, ...rest } = s;
  return rest;
}

function round100(n: number): number {
  return Math.round(n / 100) * 100;
}

/** Scale numeric economics for an earlier quarter (approximate; demo only). */
function scaleQuarterSlice(base: DemoQuarterSlice, factor: number): DemoQuarterSlice {
  const s = structuredClone(base);
  const sc = (n: number) => round100(n * factor);
  const scr = (n: number) => Math.max(0, Math.round(n * factor));

  s.accounting.revenue = sc(s.accounting.revenue);
  s.accounting.netIncome = sc(s.accounting.netIncome);
  s.accounting.beginningCash = sc(s.accounting.beginningCash);
  s.accounting.endingCash = sc(s.accounting.endingCash);
  s.accounting.totalAssets = sc(s.accounting.totalAssets);
  s.accounting.totalLiabilities = sc(s.accounting.totalLiabilities);
  s.accounting.equity = sc(s.accounting.equity);
  s.accounting.incomeStatement = s.accounting.incomeStatement.map((line) => ({
    ...line,
    amount: line.amount === 0 ? 0 : sc(line.amount),
  }));
  s.accounting.cashFlow = s.accounting.cashFlow.map((line) => ({ ...line, amount: sc(line.amount) }));

  for (const b of s.performance.brands) {
    b.demand = Math.max(1, scr(b.demand));
    b.sold = Math.max(0, Math.min(b.demand, scr(b.sold)));
    b.endingInventory = scr(b.endingInventory);
    b.price = Math.round(b.price * (0.96 + 0.08 * factor));
    b.rebate = Math.max(0, scr(b.rebate));
    b.revenue = sc(b.revenue);
    b.cogs = sc(b.cogs);
    b.grossProfit = sc(b.grossProfit);
    b.adDesignSpend = sc(b.adDesignSpend);
    b.brandProfit = sc(b.brandProfit);
  }

  for (const c of s.performance.competitors) {
    c.marketingBudget = sc(c.marketingBudget);
    c.avgPrice = Math.round(c.avgPrice * (0.97 + 0.06 * factor));
  }

  for (const seg of s.performance.segmentDemand) {
    seg.industryUnits = Math.max(1, scr(seg.industryUnits));
    seg.teamUnits = Math.min(seg.teamUnits, scr(seg.teamUnits));
  }

  for (const row of s.performance.competitorBrands) {
    row.price = Math.round(row.price * (0.97 + 0.06 * factor));
  }

  s.marketing.advertisingSpend = {
    nationalMedia: sc(s.marketing.advertisingSpend.nationalMedia),
    regionalMedia: sc(s.marketing.advertisingSpend.regionalMedia),
    localMedia: sc(s.marketing.advertisingSpend.localMedia),
    internet: sc(s.marketing.advertisingSpend.internet),
  };

  for (const r of s.sales.regions) {
    r.units = Math.max(1, scr(r.units));
    r.revenue = sc(r.revenue);
    r.grossMarginPct = Math.min(99, Math.max(0, round100(r.grossMarginPct * 100) / 100));
  }

  s.manufacturing.endingInventoryTotal = scr(s.manufacturing.endingInventoryTotal);
  s.manufacturing.lostSalesUnits = scr(s.manufacturing.lostSalesUnits);
  s.manufacturing.operatingCapacityUnits = Math.max(400, scr(s.manufacturing.operatingCapacityUnits));
  s.manufacturing.demandForecastNext = {
    Core: Math.max(1, scr(s.manufacturing.demandForecastNext.Core)),
    Nomad: Math.max(1, scr(s.manufacturing.demandForecastNext.Nomad)),
  };
  s.manufacturing.quality.warrantyExpense = sc(s.manufacturing.quality.warrantyExpense);

  for (const fac of s.manufacturing.facilities) {
    fac.capacityUnits = Math.max(200, scr(fac.capacityUnits));
  }

  s.finance.shortTermDebt = sc(s.finance.shortTermDebt);
  s.finance.longTermDebt = sc(s.finance.longTermDebt);
  s.finance.dividends = sc(s.finance.dividends);

  s.humanResources.benefitsCostAnnual = sc(s.humanResources.benefitsCostAnnual);

  return s;
}

function tweakScorecardForQuarter(slice: DemoQuarterSlice, scoreMul: number): void {
  for (const row of slice.balancedScorecard) {
    row.score = Math.max(52, Math.min(92, Math.round(row.score * scoreMul)));
    row.priorScore = Math.max(50, Math.min(90, Math.round(row.priorScore * scoreMul)));
    row.cumulativeScore = Math.max(52, Math.min(90, Math.round(row.cumulativeScore * scoreMul)));
    if (row.score > row.priorScore) row.trend = "up";
    else if (row.score < row.priorScore) row.trend = "down";
    else row.trend = "flat";
  }
}

function buildQ3Slice(q4: DemoQuarterSlice): DemoQuarterSlice {
  const s = scaleQuarterSlice(q4, 0.93);
  s.quarter = {
    index: 3,
    label: "Quarter 3",
    status: "results_ready",
    viewingResultsFor: "Quarter 2 (processed results)",
    preparingDecisionsFor: "Quarter 3 (decisions in progress)",
    cumulativeBalancedScorecardIndex: 69,
    lastProcessedAtLabel: "Mar 12, 2026 · 5:10 PM (course time)",
  };
  s.performance.overallSharePct = 17.2;
  s.performance.strategicGraph = q4.performance.strategicGraph.slice(0, 3);
  s.performance.marketImpactNote =
    "Regional training pilot in Americas; appeal and share improving vs Q1 baseline (see Strategic graphs).";
  tweakScorecardForQuarter(s, 0.97);
  const mat = materializeSnapshot(
    {
      uiDisclaimer: seedDemoSnapshot.uiDisclaimer,
      simulation: seedDemoSnapshot.simulation,
      company: seedDemoSnapshot.company,
      quarters: [s],
    },
    0,
  );
  s.knowledgeIndex = buildKnowledgeIndex(mat);
  return s;
}

function buildQ2Slice(q4: DemoQuarterSlice): DemoQuarterSlice {
  const s = scaleQuarterSlice(q4, 0.84);
  s.quarter = {
    index: 2,
    label: "Quarter 2",
    status: "results_ready",
    viewingResultsFor: "Quarter 1 (processed results)",
    preparingDecisionsFor: "Quarter 2 (decisions in progress)",
    cumulativeBalancedScorecardIndex: 66,
    lastProcessedAtLabel: "Feb 4, 2026 · 4:28 PM (course time)",
  };
  s.performance.overallSharePct = 14.8;
  s.performance.strategicGraph = q4.performance.strategicGraph.slice(0, 2);
  s.performance.marketImpactNote =
    "Early traction in Traveler segment; monitor stockouts as share climbs (see Performance report).";
  tweakScorecardForQuarter(s, 0.93);
  const mat = materializeSnapshot(
    {
      uiDisclaimer: seedDemoSnapshot.uiDisclaimer,
      simulation: seedDemoSnapshot.simulation,
      company: seedDemoSnapshot.company,
      quarters: [s],
    },
    0,
  );
  s.knowledgeIndex = buildKnowledgeIndex(mat);
  return s;
}

function buildQ1Slice(q4: DemoQuarterSlice): DemoQuarterSlice {
  const s = scaleQuarterSlice(q4, 0.72);
  s.quarter = {
    index: 1,
    label: "Quarter 1",
    status: "results_ready",
    viewingResultsFor: "Opening position (initial results)",
    preparingDecisionsFor: "Quarter 1 wrap-up & Quarter 2 planning",
    cumulativeBalancedScorecardIndex: 62,
    lastProcessedAtLabel: "Jan 9, 2026 · 3:55 PM (course time)",
  };
  s.performance.overallSharePct = 12.1;
  s.performance.strategicGraph = q4.performance.strategicGraph.slice(0, 1);
  s.performance.marketImpactNote =
    "Baseline quarter: establish demand signals and capacity headroom before scaling (see Manufacturing).";
  tweakScorecardForQuarter(s, 0.88);
  const mat = materializeSnapshot(
    {
      uiDisclaimer: seedDemoSnapshot.uiDisclaimer,
      simulation: seedDemoSnapshot.simulation,
      company: seedDemoSnapshot.company,
      quarters: [s],
    },
    0,
  );
  s.knowledgeIndex = buildKnowledgeIndex(mat);
  return s;
}

const q4Slice = sliceFromSnapshot(seedDemoSnapshot);

export const initialDemoScenario: DemoScenario = {
  uiDisclaimer: seedDemoSnapshot.uiDisclaimer,
  simulation: seedDemoSnapshot.simulation,
  company: seedDemoSnapshot.company,
  quarters: [buildQ1Slice(q4Slice), buildQ2Slice(q4Slice), buildQ3Slice(q4Slice), q4Slice],
};

/** Wrap a randomized Q4 `DemoSnapshot` into a 4-quarter scenario (Q1–Q3 derived from Q4). */
export function scenarioFromLatestSnapshot(latest: DemoSnapshot): DemoScenario {
  const q4 = sliceFromSnapshot(latest);
  q4.knowledgeIndex = buildKnowledgeIndex(latest);
  return {
    uiDisclaimer: latest.uiDisclaimer,
    simulation: latest.simulation,
    company: latest.company,
    quarters: [buildQ1Slice(q4), buildQ2Slice(q4), buildQ3Slice(q4), q4],
  };
}
