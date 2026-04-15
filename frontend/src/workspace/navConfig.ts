/** Two-level navigation modeled on common Marketplace Workspace walkthroughs (reports + decision areas). */

export type ModuleId =
  | "performance"
  | "marketing"
  | "sales"
  | "manufacturing"
  | "humanResources"
  | "accounting"
  | "finance";

export type WorkspaceNavItem = {
  moduleId: ModuleId;
  label: string;
  /** Short label for breadcrumb */
  short: string;
  subs: { subId: string; label: string }[];
};

export const WORKSPACE_NAV: WorkspaceNavItem[] = [
  {
    moduleId: "performance",
    label: "Performance & reports",
    short: "Performance",
    subs: [
      { subId: "performance-report", label: "Performance report" },
      { subId: "market-share-demand", label: "Market share & demand" },
      { subId: "financial-reports", label: "Financial reports" },
      { subId: "balanced-scorecard", label: "Balanced scorecard" },
      { subId: "strategic-graphs", label: "Strategic graphs" },
      { subId: "competitor-profile", label: "Competitor profile" },
      { subId: "detail-brand-demand", label: "Detail brand demand" },
    ],
  },
  {
    moduleId: "marketing",
    label: "Marketing",
    short: "Marketing",
    subs: [
      { subId: "brand-management", label: "Brand management" },
      { subId: "pricing", label: "Pricing" },
      { subId: "advertising", label: "Advertising" },
      { subId: "market-research", label: "Buy market research" },
      { subId: "tactical-summary", label: "Tactical summary" },
    ],
  },
  {
    moduleId: "sales",
    label: "Sales",
    short: "Sales",
    subs: [
      { subId: "sales-results", label: "Sales results" },
      { subId: "regional-profitability", label: "Regional profitability" },
      { subId: "competitors-city", label: "Competitors in the city" },
      { subId: "sales-force", label: "Sales force" },
      { subId: "tactical-summary", label: "Tactical summary" },
    ],
  },
  {
    moduleId: "manufacturing",
    label: "Manufacturing",
    short: "Manufacturing",
    subs: [
      { subId: "inventory-results", label: "Inventory & prior results" },
      { subId: "facilities", label: "Production facilities" },
      { subId: "demand-capacity", label: "Demand projection & capacity" },
      { subId: "production-plan", label: "Production plan" },
      { subId: "quality", label: "Quality & reliability" },
      { subId: "tactical-summary", label: "Tactical summary" },
    ],
  },
  {
    moduleId: "humanResources",
    label: "Human resources",
    short: "HR",
    subs: [
      { subId: "compensation", label: "Compensation & benefits" },
      { subId: "productivity", label: "Productivity" },
    ],
  },
  {
    moduleId: "accounting",
    label: "Accounting",
    short: "Accounting",
    subs: [
      { subId: "income-statement", label: "Income statement" },
      { subId: "cash-flow", label: "Cash flow" },
      { subId: "balance-sheet", label: "Balance sheet" },
      { subId: "brand-profitability", label: "Brand profitability" },
      { subId: "industry-ratios", label: "Industry financial ratios" },
    ],
  },
  {
    moduleId: "finance",
    label: "Finance",
    short: "Finance",
    subs: [
      { subId: "capital-structure", label: "Debt & equity" },
      { subId: "shareholder", label: "Dividends & repurchase" },
      { subId: "pro-forma", label: "Pro forma note" },
    ],
  },
];

export function defaultSubForModule(moduleId: ModuleId): string {
  const m = WORKSPACE_NAV.find((x) => x.moduleId === moduleId);
  return m?.subs[0]?.subId ?? "performance-report";
}
