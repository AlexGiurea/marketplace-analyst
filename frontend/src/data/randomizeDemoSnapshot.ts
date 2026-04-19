import type {
  DemoAdvertisingMix,
  DemoBrandPerformance,
  DemoCompetitor,
  DemoCompetitorBrand,
  DemoIndustryRatio,
  DemoOutlet,
  DemoRegionSales,
  DemoScorecardRow,
  DemoScenario,
  DemoSnapshot,
  DemoStrategicGraphPoint,
  Trend,
} from "../types/demoSnapshot";
import { buildKnowledgeIndex } from "./knowledgeIndexBuilder";
import { materializeSnapshot, scenarioFromLatestSnapshot } from "./demoScenario";
import { initialDemoSnapshot } from "./demoSnapshot";

function ri(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function rf(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function round100(n: number): number {
  return Math.round(n / 100) * 100;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function pickTrend(score: number, prior: number): Trend {
  if (score > prior + 0.5) return "up";
  if (score < prior - 0.5) return "down";
  return "flat";
}

function buildBrand(
  name: string,
  segment: string,
  demand: number,
): DemoBrandPerformance {
  const price = ri(2480, 3380);
  const rebate = ri(110, Math.min(280, Math.floor(price * 0.11)));
  const stockout = Math.random() < 0.26;
  const maxShortfall = Math.min(48, Math.floor(demand * 0.22));
  const sold = stockout ? demand : clamp(ri(demand - maxShortfall, demand), Math.floor(demand * 0.78), demand);
  const endingInventory = stockout ? 0 : ri(6, 52);
  const net = price - rebate;
  const revenue = round100(sold * net);
  const cogsRatio = rf(0.57, 0.67);
  const cogs = round100(revenue * cogsRatio);
  const grossProfit = revenue - cogs;
  const adDesignSpend = round100(rf(88_000, 132_000));
  const brandProfit = Math.max(45_000, grossProfit - adDesignSpend);

  return {
    name,
    segment,
    demand,
    sold,
    stockout,
    endingInventory,
    price,
    rebate,
    revenue,
    cogs,
    grossProfit,
    adDesignSpend,
    brandProfit,
  };
}

/**
 * Generates a new coherent-enough snapshot for pitch demos.
 * Monetary totals stay in a “single mid-size firm” band (~$1.8M–$2.8M revenue), not toy or absurd values.
 */
function generateRandomizedQuarterSnapshot(): DemoSnapshot {
  const base = initialDemoSnapshot;

  const coreDemand = ri(320, 480);
  const nomadDemand = ri(280, 450);
  const brands: DemoBrandPerformance[] = [
    buildBrand("Core", "Workhorse", coreDemand),
    buildBrand("Nomad", "Traveler", nomadDemand),
  ];

  const totalRevenue = brands.reduce((s, b) => s + b.revenue, 0);
  const totalCogs = brands.reduce((s, b) => s + b.cogs, 0);
  const grossProfit = totalRevenue - totalCogs;

  const teamShare = round1(rf(13.8, 22.4));
  let c1 = round1(rf(24, 36));
  let c2 = round1(rf(11, 18));
  let c3 = round1(rf(9, 16));
  const compSum = c1 + c2 + c3;
  if (compSum + teamShare > 99) {
    const scale = (99 - teamShare) / compSum;
    c1 = round1(c1 * scale);
    c2 = round1(c2 * scale);
    c3 = round1(c3 * scale);
  }

  const competitors: DemoCompetitor[] = [
    {
      name: "Mira",
      sharePct: c1,
      brandCount: 2,
      avgPrice: ri(2480, 3180),
      marketingBudget: round100(rf(210_000, 310_000)),
      reliability: ri(74, 88),
      capacityIndex: ri(78, 94),
    },
    {
      name: "CostCutter",
      sharePct: c2,
      brandCount: 2,
      avgPrice: ri(1880, 2580),
      marketingBudget: round100(rf(150_000, 220_000)),
      reliability: ri(68, 80),
      capacityIndex: ri(85, 96),
    },
    {
      name: "UrbanPedal",
      sharePct: c3,
      brandCount: 1,
      avgPrice: ri(2580, 3120),
      marketingBudget: round100(rf(125_000, 175_000)),
      reliability: ri(74, 84),
      capacityIndex: ri(76, 90),
    },
  ];

  const segmentDemand = [
    {
      segment: "Workhorse",
      industryUnits: ri(1850, 2350),
      teamUnits: brands[0].sold,
    },
    {
      segment: "Traveler",
      industryUnits: ri(1550, 2050),
      teamUnits: brands[1].sold,
    },
    { segment: "Innovator", industryUnits: ri(820, 1020), teamUnits: 0 },
    { segment: "Cost cutter", industryUnits: ri(980, 1220), teamUnits: 0 },
  ];

  const shareW = segmentDemand[0].industryUnits > 0 ? round1((brands[0].sold / segmentDemand[0].industryUnits) * 100) : 0;
  const shareT = segmentDemand[1].industryUnits > 0 ? round1((brands[1].sold / segmentDemand[1].industryUnits) * 100) : 0;

  const competitorBrands: DemoCompetitorBrand[] = [
    { competitor: "Mira", brandName: "Apex", segment: "Workhorse", price: competitors[0].avgPrice - ri(80, 220), shareInSegmentPct: ri(18, 26) },
    { competitor: "Mira", brandName: "Drift", segment: "Traveler", price: competitors[0].avgPrice + ri(-40, 180), shareInSegmentPct: ri(15, 22) },
    {
      competitor: "CostCutter",
      brandName: "Bolt",
      segment: "Cost cutter",
      price: competitors[1].avgPrice,
      shareInSegmentPct: ri(22, 32),
    },
    { competitor: "UrbanPedal", brandName: "Metro", segment: "Traveler", price: competitors[2].avgPrice, shareInSegmentPct: ri(10, 16) },
    { competitor: "Mai (you)", brandName: "Core", segment: "Workhorse", price: brands[0].price, shareInSegmentPct: shareW },
    { competitor: "Mai (you)", brandName: "Nomad", segment: "Traveler", price: brands[1].price, shareInSegmentPct: shareT },
  ];

  const appealStart = ri(58, 66);
  const shareStart = round1(rf(10.5, 14.2));
  const appealQ2 = appealStart + ri(3, 8);
  const shareQ2 = round1(shareStart + rf(1.2, 3.5));
  const appealQ3 = appealQ2 + ri(2, 6);
  const shareQ3 = round1(shareQ2 + rf(0.8, 2.8));
  const appealEnd = clamp(appealQ3 + ri(1, 4), appealQ3, 78);
  const strategicGraph: DemoStrategicGraphPoint[] = [
    { quarterLabel: "Q1", marketAppealIndex: appealStart, cumulativeProfit: round100(rf(95_000, 165_000)), sharePct: shareStart },
    { quarterLabel: "Q2", marketAppealIndex: appealQ2, cumulativeProfit: round100(rf(260_000, 380_000)), sharePct: shareQ2 },
    { quarterLabel: "Q3", marketAppealIndex: appealQ3, cumulativeProfit: round100(rf(420_000, 560_000)), sharePct: shareQ3 },
    {
      quarterLabel: "Q3 res.",
      marketAppealIndex: appealEnd,
      cumulativeProfit: round100(rf(620_000, 820_000)),
      sharePct: teamShare,
    },
  ];

  const balancedScorecard: DemoScorecardRow[] = base.balancedScorecard.map((row) => {
    const score = ri(58, 82);
    const prior = clamp(score + ri(-5, 5), 55, 84);
    const cumulativeScore = ri(60, 80);
    return {
      ...row,
      score,
      priorScore: prior,
      trend: pickTrend(score, prior),
      cumulativeScore,
    };
  });

  const cumIndex = Math.round(
    balancedScorecard.reduce((s, r) => s + r.cumulativeScore * (r.weightPct / 100), 0),
  );

  let mktSales = round100(totalRevenue * rf(0.17, 0.23));
  let ga = round100(totalRevenue * rf(0.042, 0.062));
  let depr = round100(totalRevenue * rf(0.026, 0.04));
  const minOp = 72_000;
  if (grossProfit - mktSales - ga - depr < minOp) {
    const cap = grossProfit - minOp;
    const sum = mktSales + ga + depr;
    const f = sum > 0 ? cap / sum : 0.85;
    mktSales = round100(mktSales * f);
    ga = round100(ga * f);
    depr = round100(depr * f);
  }
  const operatingIncome = Math.max(minOp, grossProfit - mktSales - ga - depr);
  let interest = Math.random() < 0.32 ? round100(rf(18_000, 42_000)) : 0;
  interest = Math.min(interest, Math.max(0, operatingIncome - 55_000));
  const pretax = operatingIncome - interest;
  const tax = 0;
  const netIncome = pretax - tax;

  const beginningCash = round100(rf(520_000, 680_000));

  const totalAssets = round100(totalRevenue * rf(1.45, 1.72));
  const totalLiabilities = round100(totalAssets * rf(0.52, 0.58));
  const equity = totalAssets - totalLiabilities;

  const shortTermDebt = round100(rf(160_000, 280_000));
  const longTermDebt = round100(rf(380_000, 560_000));
  const dividends = round100(rf(22_000, 72_000));

  const salespeople = ri(11, 18);
  const salaryPerRep = ri(48_000, 62_000);

  const splitCore = [rf(0.38, 0.46), rf(0.32, 0.4), 0] as number[];
  splitCore[2] = 1 - splitCore[0] - splitCore[1];
  const splitNom = [rf(0.36, 0.44), rf(0.3, 0.38), 0] as number[];
  splitNom[2] = 1 - splitNom[0] - splitNom[1];

  const regions: DemoRegionSales[] = [
    {
      region: "Americas",
      brand: "Core",
      units: Math.max(1, Math.round(brands[0].sold * splitCore[0])),
      revenue: 0,
      grossMarginPct: round1(rf(35.5, 41.5)),
    },
    {
      region: "Americas",
      brand: "Nomad",
      units: Math.max(1, Math.round(brands[1].sold * splitNom[0])),
      revenue: 0,
      grossMarginPct: round1(rf(36.5, 42.5)),
    },
    {
      region: "EMEA",
      brand: "Core",
      units: Math.max(1, Math.round(brands[0].sold * splitCore[1])),
      revenue: 0,
      grossMarginPct: round1(rf(35, 40.5)),
    },
    {
      region: "EMEA",
      brand: "Nomad",
      units: Math.max(1, Math.round(brands[1].sold * splitNom[1])),
      revenue: 0,
      grossMarginPct: round1(rf(36, 41.5)),
    },
    {
      region: "Asia Pacific",
      brand: "Core",
      units: Math.max(1, Math.round(brands[0].sold * splitCore[2])),
      revenue: 0,
      grossMarginPct: round1(rf(34, 39.5)),
    },
    {
      region: "Asia Pacific",
      brand: "Nomad",
      units: Math.max(1, Math.round(brands[1].sold * splitNom[2])),
      revenue: 0,
      grossMarginPct: round1(rf(36, 40.8)),
    },
  ];

  for (const r of regions) {
    const b = r.brand === "Core" ? brands[0] : brands[1];
    const net = b.price - b.rebate;
    r.revenue = round100(r.units * net * rf(0.96, 1.04));
  }

  const lostSales = ri(5, 36);
  const operatingCapacity = ri(720, 920);
  const utilization = ri(82, 96);
  const invTotal = brands[0].endingInventory + brands[1].endingInventory;
  const fc1 = round100(operatingCapacity * rf(0.48, 0.56));
  const fc2 = operatingCapacity - fc1;

  const adTotal = brands.reduce((s, b) => s + b.adDesignSpend, 0);
  const w1 = rf(0.28, 0.38);
  const w2 = rf(0.22, 0.32);
  const w3 = rf(0.14, 0.22);
  const w4 = clamp(1 - w1 - w2 - w3, 0.12, 0.28);
  const norm = w1 + w2 + w3 + w4;
  const advertisingSpend: DemoAdvertisingMix = {
    nationalMedia: round100((adTotal * w1) / norm),
    regionalMedia: round100((adTotal * w2) / norm),
    localMedia: round100((adTotal * w3) / norm),
    internet: round100((adTotal * w4) / norm),
  };

  const outlets: DemoOutlet[] = [
    { market: "Americas", cityLabel: "Chicago hub", outletsOpen: ri(2, 4), salespeopleAssigned: ri(4, 7) },
    { market: "Americas", cityLabel: "Austin hub", outletsOpen: ri(1, 3), salespeopleAssigned: ri(2, 4) },
    { market: "EMEA", cityLabel: "Rotterdam", outletsOpen: ri(1, 3), salespeopleAssigned: ri(2, 4) },
    { market: "EMEA", cityLabel: "Munich", outletsOpen: ri(1, 2), salespeopleAssigned: ri(1, 3) },
    { market: "Asia Pacific", cityLabel: "Singapore", outletsOpen: ri(1, 3), salespeopleAssigned: ri(1, 2) },
  ];

  const industryRatios: DemoIndustryRatio[] = [
    { name: "Current ratio", teamValue: round1(rf(1.22, 1.48)), industryMedian: round1(rf(1.18, 1.38)), unit: "ratio" },
    { name: "Debt to equity", teamValue: round1(rf(0.38, 0.58)), industryMedian: round1(rf(0.44, 0.6)), unit: "ratio" },
    {
      name: "Gross margin %",
      teamValue: round1((grossProfit / totalRevenue) * 100),
      industryMedian: round1(rf(34.5, 39.5)),
      unit: "percent",
    },
    { name: "ROA %", teamValue: round1(rf(5.2, 7.8)), industryMedian: round1(rf(5.0, 6.8)), unit: "percent" },
  ];

  const cfo = round100(netIncome + depr - rf(10_000, 45_000));
  const capex = -round100(rf(120_000, 190_000));
  const debtProceeds = 0;
  const divPaid = -dividends;
  const netChg = round100(cfo + capex + debtProceeds + divPaid);

  const snapshot: DemoSnapshot = {
    ...base,
    performance: {
      ...base.performance,
      overallSharePct: teamShare,
      brands,
      competitors,
      segmentDemand,
      competitorBrands,
      strategicGraph,
    },
    balancedScorecard,
    quarter: {
      ...base.quarter,
      cumulativeBalancedScorecardIndex: clamp(cumIndex, 62, 82),
    },
    marketing: {
      ...base.marketing,
      pricingNotes: `${brands[0].name} at ${brands[0].price.toLocaleString()} and ${brands[1].name} at ${brands[1].price.toLocaleString()}; rebates ${brands[0].rebate} / ${brands[1].rebate} (randomized demo).`,
      advertisingNotes:
        "Mix rebalanced across national, regional, local, and internet — demo randomization keeps spend in a realistic band vs revenue.",
      advertisingSpend,
    },
    sales: {
      ...base.sales,
      salespeople,
      salaryPerRep,
      regions,
      outlets,
    },
    manufacturing: {
      ...base.manufacturing,
      endingInventoryTotal: invTotal,
      demandForecastNext: {
        Core: brands[0].demand + ri(-25, 55),
        Nomad: brands[1].demand + ri(-22, 48),
      },
      operatingCapacityUnits: operatingCapacity,
      utilizationPct: utilization,
      lostSalesUnits: lostSales,
      facilities: [
        { id: "F1", location: "Americas — Ohio plant", capacityUnits: fc1, utilizationPct: clamp(utilization + ri(-4, 5), 78, 99) },
        { id: "F2", location: "EMEA — Poland plant", capacityUnits: fc2, utilizationPct: clamp(utilization + ri(-8, 3), 78, 99) },
      ],
      quality: {
        warrantyExpense: round100(rf(32_000, 58_000)),
        reliabilityScore: ri(76, 90),
        inspectionYieldPct: round1(rf(95.5, 98.8)),
      },
    },
    humanResources: {
      ...base.humanResources,
      benefitsCostAnnual: round100(rf(175_000, 265_000)),
      trainingHoursPerQuarter: round1(rf(4.5, 9.2)),
      salesProductivityIndex: ri(94, 112),
      headcountNote: `${salespeople} reps · 2 support · plant staff per facility roster (demo aggregate).`,
    },
    accounting: {
      ...base.accounting,
      revenue: totalRevenue,
      netIncome,
      beginningCash,
      endingCash: clamp(round100(beginningCash + netChg), 380_000, 920_000),
      totalAssets,
      totalLiabilities,
      equity,
      incomeStatement: [
        { label: "Revenue", amount: totalRevenue },
        { label: "Cost of goods sold", amount: totalCogs },
        { label: "Gross profit", amount: grossProfit, isSubtotal: true },
        { label: "Marketing & sales", amount: mktSales },
        { label: "G&A", amount: ga },
        { label: "Depreciation", amount: depr },
        { label: "Operating income", amount: operatingIncome, isSubtotal: true },
        { label: "Interest", amount: interest },
        { label: "Pretax income", amount: pretax },
        { label: "Tax", amount: tax },
        { label: "Net income", amount: netIncome, isSubtotal: true },
      ],
      cashFlow: [
        { label: "Cash from operations", amount: cfo },
        { label: "Capex (capacity & tooling)", amount: capex },
        { label: "Debt proceeds (net)", amount: debtProceeds },
        { label: "Dividends paid", amount: divPaid },
        { label: "Net change in cash", amount: netChg },
      ],
      industryRatios,
    },
    finance: {
      ...base.finance,
      shortTermDebt,
      longTermDebt,
      dividends,
    },
    knowledgeIndex: [],
  };

  snapshot.knowledgeIndex = buildKnowledgeIndex(snapshot);

  return snapshot;
}

/** Randomize all quarters (Q1–Q3 derived from randomized Q4). */
export function randomizeDemoScenario(): DemoScenario {
  return scenarioFromLatestSnapshot(generateRandomizedQuarterSnapshot());
}

/** Single-quarter view: latest quarter of a randomized scenario (backward compatible). */
export function randomizeDemoSnapshot(): DemoSnapshot {
  const scenario = randomizeDemoScenario();
  return materializeSnapshot(scenario, scenario.quarters.length - 1);
}
