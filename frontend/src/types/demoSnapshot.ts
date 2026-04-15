export type Trend = "up" | "down" | "flat";

export type DemoBrandPerformance = {
  name: string;
  segment: string;
  demand: number;
  sold: number;
  stockout: boolean;
  endingInventory: number;
  price: number;
  rebate: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  adDesignSpend: number;
  brandProfit: number;
};

export type DemoCompetitor = {
  name: string;
  sharePct: number;
  brandCount: number;
  avgPrice: number;
  marketingBudget: number;
  reliability: number;
  capacityIndex: number;
};

export type DemoCompetitorBrand = {
  competitor: string;
  brandName: string;
  segment: string;
  price: number;
  shareInSegmentPct: number;
};

export type DemoScorecardRow = {
  theme: string;
  weightPct: number;
  score: number;
  priorScore: number;
  trend: Trend;
  cumulativeScore: number;
};

export type DemoRegionSales = {
  region: string;
  brand: string;
  units: number;
  revenue: number;
  grossMarginPct: number;
};

export type DemoOutlet = {
  market: string;
  cityLabel: string;
  outletsOpen: number;
  salespeopleAssigned: number;
};

export type DemoStrategicGraphPoint = {
  quarterLabel: string;
  marketAppealIndex: number;
  cumulativeProfit: number;
  sharePct: number;
};

export type DemoIndustryRatio = {
  name: string;
  teamValue: number;
  industryMedian: number;
  unit: "ratio" | "percent" | "days";
};

export type DemoIncomeLine = {
  label: string;
  amount: number;
  isSubtotal?: boolean;
};

export type DemoCashFlowLine = {
  label: string;
  amount: number;
};

export type DemoAdvertisingMix = {
  nationalMedia: number;
  regionalMedia: number;
  localMedia: number;
  internet: number;
};

export type DemoSnapshot = {
  uiDisclaimer: string;
  simulation: {
    title: string;
    productId: string;
    decisionRoundsTotal: number;
    mode: "classmates" | "computer";
  };
  company: {
    teamId: string;
    name: string;
    strategyOneLiner: string;
    targetSegments: string[];
  };
  quarter: {
    index: number;
    label: string;
    status: "results_ready" | "draft" | "submitted" | "processing";
    viewingResultsFor: string;
    preparingDecisionsFor: string;
    /** Mirrors LMS language: running cumulative Balanced Scorecard index (demo). */
    cumulativeBalancedScorecardIndex: number;
    lastProcessedAtLabel: string;
  };
  performance: {
    overallSharePct: number;
    brands: DemoBrandPerformance[];
    competitors: DemoCompetitor[];
    /** Demand units by segment (market view). */
    segmentDemand: { segment: string; industryUnits: number; teamUnits: number }[];
    competitorBrands: DemoCompetitorBrand[];
    strategicGraph: DemoStrategicGraphPoint[];
    marketImpactNote: string;
  };
  balancedScorecard: DemoScorecardRow[];
  marketing: {
    pricingNotes: string;
    advertisingNotes: string;
    marketResearchPurchased: string[];
    advertisingSpend: DemoAdvertisingMix;
    brandFeatures: { brand: string; features: string[] }[];
    tacticalSummary: string;
  };
  sales: {
    salespeople: number;
    salaryPerRep: number;
    regions: DemoRegionSales[];
    outlets: DemoOutlet[];
    competitorsInCityNote: string;
    tacticalSummary: string;
  };
  manufacturing: {
    endingInventoryTotal: number;
    demandForecastNext: Record<string, number>;
    operatingCapacityUnits: number;
    utilizationPct: number;
    lostSalesUnits: number;
    productionNotes: string;
    facilities: { id: string; location: string; capacityUnits: number; utilizationPct: number }[];
    quality: {
      warrantyExpense: number;
      reliabilityScore: number;
      inspectionYieldPct: number;
    };
    tacticalSummary: string;
  };
  humanResources: {
    compensationModel: string;
    benefitsCostAnnual: number;
    trainingHoursPerQuarter: number;
    salesProductivityIndex: number;
    headcountNote: string;
  };
  accounting: {
    revenue: number;
    netIncome: number;
    beginningCash: number;
    endingCash: number;
    totalAssets: number;
    totalLiabilities: number;
    equity: number;
    incomeStatement: DemoIncomeLine[];
    cashFlow: DemoCashFlowLine[];
    industryRatios: DemoIndustryRatio[];
    proFormaNote: string;
  };
  finance: {
    shortTermDebt: number;
    longTermDebt: number;
    stockIssuance: number;
    dividends: number;
    interestRateNote: string;
    equityRaiseCapacityNote: string;
    tacticalSummary: string;
  };
  knowledgeIndex: { id: string; section: string; fact: string }[];
};
