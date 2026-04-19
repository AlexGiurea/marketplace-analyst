import type { DemoScenario, DemoSnapshot } from "../../frontend/src/types/demoSnapshot.js";
import { materializeSnapshot } from "../../frontend/src/data/demoScenario.js";

export type KnowledgeChunk = {
  id: string;
  section: string;
  text: string;
  metadata: Record<string, string>;
};

export type KnowledgeBundle = {
  chunks: KnowledgeChunk[];
  overview: string;
};

function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Deterministic text views of the live snapshot for hybrid retrieval (keyword overlap).
 * Numeric truth remains in JSON + tools; chunks help routing and narrative grounding.
 */
export function compileKnowledge(snapshot: DemoSnapshot): KnowledgeBundle {
  const chunks: KnowledgeChunk[] = [];
  const { company, quarter, performance, balancedScorecard, marketing, sales, manufacturing, accounting, finance, humanResources } =
    snapshot;

  chunks.push({
    id: "meta-team-quarter",
    section: "meta",
    text: `${company.name} (${company.teamId}) — ${quarter.label}. ${quarter.viewingResultsFor}. ${quarter.preparingDecisionsFor}. Cumulative scorecard index (demo): ${quarter.cumulativeBalancedScorecardIndex}. Strategy: ${company.strategyOneLiner} Targets: ${company.targetSegments.join(", ")}.`,
    metadata: { team: company.name, quarter: quarter.label },
  });

  for (const row of snapshot.knowledgeIndex) {
    chunks.push({
      id: row.id,
      section: row.section,
      text: `${row.section}: ${row.fact}`,
      metadata: { source: "knowledgeIndex", id: row.id },
    });
  }

  for (const b of performance.brands) {
    chunks.push({
      id: `brand-${b.name.toLowerCase()}`,
      section: "performance",
      text: `Brand ${b.name} (${b.segment}): demand ${b.demand}, sold ${b.sold}, stockout ${b.stockout}, ending inventory ${b.endingInventory}, price ${money(b.price)}, rebate ${money(b.rebate)}, revenue ${money(b.revenue)}, brand profit ${money(b.brandProfit)}.`,
      metadata: { brand: b.name, segment: b.segment },
    });
  }

  chunks.push({
    id: "perf-share-overall",
    section: "performance",
    text: `Team overall market share ${performance.overallSharePct}%.`,
    metadata: {},
  });

  for (const c of performance.competitors) {
    chunks.push({
      id: `competitor-${c.name.toLowerCase()}`,
      section: "competitors",
      text: `Competitor ${c.name}: share ${c.sharePct}%, brands ${c.brandCount}, avg price ${money(c.avgPrice)}, marketing ${money(c.marketingBudget)}, reliability ${c.reliability}, capacity index ${c.capacityIndex}.`,
      metadata: { competitor: c.name },
    });
  }

  for (const row of balancedScorecard) {
    chunks.push({
      id: `scorecard-${slugify(row.theme)}`,
      section: "balanced-scorecard",
      text: `Balanced Scorecard — ${row.theme}: score ${row.score} (prior ${row.priorScore}), trend ${row.trend}, weight ${row.weightPct}%, cumulative ${row.cumulativeScore}.`,
      metadata: { theme: row.theme },
    });
  }

  chunks.push({
    id: "marketing-pricing-ad",
    section: "marketing",
    text: `Marketing notes — pricing: ${marketing.pricingNotes} Advertising: ${marketing.advertisingNotes} Research purchased: ${marketing.marketResearchPurchased.join("; ")}. Tactical summary: ${marketing.tacticalSummary}`,
    metadata: {},
  });

  chunks.push({
    id: "sales-regions-outlets",
    section: "sales",
    text: `Sales: ${sales.salespeople} reps, salary ${money(sales.salaryPerRep)}. ${sales.competitorsInCityNote} Tactical: ${sales.tacticalSummary}`,
    metadata: {},
  });

  chunks.push({
    id: "mfg-capacity-inventory",
    section: "manufacturing",
    text: `Manufacturing: ending inventory ${manufacturing.endingInventoryTotal} units, lost sales ${manufacturing.lostSalesUnits}, capacity ${manufacturing.operatingCapacityUnits}, utilization ${manufacturing.utilizationPct}%. Forecast next: ${JSON.stringify(manufacturing.demandForecastNext)}. ${manufacturing.productionNotes} Tactical: ${manufacturing.tacticalSummary}`,
    metadata: {},
  });

  chunks.push({
    id: "finance-cash-debt",
    section: "finance",
    text: `Finance: short-term debt ${money(finance.shortTermDebt)}, long-term ${money(finance.longTermDebt)}, dividends ${money(finance.dividends)}. ${finance.interestRateNote} Tactical: ${finance.tacticalSummary}`,
    metadata: {},
  });

  chunks.push({
    id: "accounting-summary",
    section: "accounting",
    text: `Accounting: revenue ${money(accounting.revenue)}, net income ${money(accounting.netIncome)}, ending cash ${money(accounting.endingCash)}, equity ${money(accounting.equity)}.`,
    metadata: {},
  });

  chunks.push({
    id: "hr-productivity",
    section: "human-resources",
    text: `HR: ${humanResources.compensationModel}. Benefits ${money(humanResources.benefitsCostAnnual)} annual. Training ${humanResources.trainingHoursPerQuarter} hrs/qtr. Productivity index ${humanResources.salesProductivityIndex}. ${humanResources.headcountNote}`,
    metadata: {},
  });

  const overview = `${company.name} — ${quarter.label}. Share ${performance.overallSharePct}%. Revenue ${money(accounting.revenue)}, net income ${money(accounting.netIncome)}. Weakest manufacturing score theme check Balanced Scorecard rows.`;

  return { chunks, overview };
}

/**
 * Compile all quarters into one chunk corpus with `q{n}-` id prefixes (retrieval + citations can target a quarter).
 */
export function compileScenarioKnowledge(scenario: DemoScenario, activeQuarterIndex: number): KnowledgeBundle {
  const allChunks: KnowledgeChunk[] = [];
  for (let i = 0; i < scenario.quarters.length; i++) {
    const snap = materializeSnapshot(scenario, i);
    const bundle = compileKnowledge(snap);
    const qPrefix = `q${i + 1}`;
    for (const c of bundle.chunks) {
      allChunks.push({
        ...c,
        id: `${qPrefix}-${c.id}`,
        metadata: {
          ...c.metadata,
          quarterIndex: String(i + 1),
          quarterLabel: snap.quarter.label,
        },
      });
    }
  }
  const activeSnap = materializeSnapshot(scenario, activeQuarterIndex);
  const activeBundle = compileKnowledge(activeSnap);
  const overview = `Multi-quarter demo (${scenario.quarters.length} quarters). Active quarter: ${activeSnap.quarter.label}. ${activeBundle.overview}`;
  return { chunks: allChunks, overview };
}
