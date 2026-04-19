import type { ModuleId } from "./navConfig";

export type CitationDestination = {
  moduleId: ModuleId;
  subId: string;
  sectionId?: string;
  label: string;
  title: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DIRECT_MAP: Record<string, CitationDestination> = {
  "meta-team-quarter": {
    moduleId: "performance",
    subId: "performance-report",
    sectionId: "performance-report-panel",
    label: "Quarter overview",
    title: "Performance report",
  },
  "perf-share": {
    moduleId: "performance",
    subId: "performance-report",
    sectionId: "overall-share",
    label: "Overall share",
    title: "Performance report",
  },
  "perf-share-overall": {
    moduleId: "performance",
    subId: "performance-report",
    sectionId: "overall-share",
    label: "Overall share",
    title: "Performance report",
  },
  "graph-appeal": {
    moduleId: "performance",
    subId: "strategic-graphs",
    sectionId: "strategic-graphs-panel",
    label: "Strategic graphs",
    title: "Strategic graphs",
  },
  "score-mfg": {
    moduleId: "performance",
    subId: "balanced-scorecard",
    sectionId: "scorecard-theme-manufacturing-productivity",
    label: "Manufacturing score",
    title: "Balanced scorecard",
  },
  "mkt-price": {
    moduleId: "marketing",
    subId: "pricing",
    sectionId: "pricing-panel",
    label: "Pricing",
    title: "Pricing",
  },
  "mfg-cap": {
    moduleId: "manufacturing",
    subId: "demand-capacity",
    sectionId: "manufacturing-demand-capacity",
    label: "Demand & capacity",
    title: "Demand projection & operating capacity",
  },
  "fin-cash": {
    moduleId: "accounting",
    subId: "cash-flow",
    sectionId: "cash-flow-panel",
    label: "Cash flow",
    title: "Cash flow",
  },
  "hr-prod": {
    moduleId: "humanResources",
    subId: "productivity",
    sectionId: "hr-productivity-panel",
    label: "HR productivity",
    title: "Productivity & training",
  },
  "marketing-pricing-ad": {
    moduleId: "marketing",
    subId: "pricing",
    sectionId: "pricing-panel",
    label: "Marketing summary",
    title: "Pricing",
  },
  "sales-regions-outlets": {
    moduleId: "sales",
    subId: "competitors-city",
    sectionId: "sales-outlets-panel",
    label: "City coverage",
    title: "Your outlets & coverage",
  },
  "mfg-capacity-inventory": {
    moduleId: "manufacturing",
    subId: "demand-capacity",
    sectionId: "manufacturing-demand-capacity",
    label: "Demand & capacity",
    title: "Demand projection & operating capacity",
  },
  "finance-cash-debt": {
    moduleId: "finance",
    subId: "capital-structure",
    sectionId: "capital-structure-panel",
    label: "Debt & equity",
    title: "Debt & equity",
  },
  "accounting-summary": {
    moduleId: "performance",
    subId: "financial-reports",
    sectionId: "financial-reports-panel",
    label: "Financial reports",
    title: "Financial reports",
  },
  "hr-productivity": {
    moduleId: "humanResources",
    subId: "productivity",
    sectionId: "hr-productivity-panel",
    label: "HR productivity",
    title: "Productivity & training",
  },
};

export function resolveCitationDestination(citationId: string): CitationDestination | null {
  if (DIRECT_MAP[citationId]) {
    return DIRECT_MAP[citationId];
  }

  if (citationId.startsWith("brand-")) {
    const brandName = citationId.slice("brand-".length);
    const brandLabel = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    return {
      moduleId: "performance",
      subId: "performance-report",
      sectionId: `brand-row-${slugify(brandLabel)}`,
      label: `${brandLabel} performance`,
      title: "Performance report",
    };
  }

  if (citationId.startsWith("competitor-")) {
    const competitorName = citationId.slice("competitor-".length);
    const competitorLabel = competitorName.charAt(0).toUpperCase() + competitorName.slice(1);
    return {
      moduleId: "performance",
      subId: "competitor-profile",
      sectionId: `competitor-row-${slugify(competitorLabel)}`,
      label: `${competitorLabel} profile`,
      title: "Competitor profile",
    };
  }

  if (citationId.startsWith("scorecard-")) {
    const themeSlug = citationId.slice("scorecard-".length);
    return {
      moduleId: "performance",
      subId: "balanced-scorecard",
      sectionId: `scorecard-theme-${themeSlug}`,
      label: "Scorecard theme",
      title: "Balanced scorecard",
    };
  }

  return null;
}

export function buildCitationHref(citationId: string): string {
  const destination = resolveCitationDestination(citationId);
  if (!destination) {
    return "/workspace";
  }

  const params = new URLSearchParams({
    module: destination.moduleId,
    sub: destination.subId,
  });

  return `/workspace?${params.toString()}${destination.sectionId ? `#${destination.sectionId}` : ""}`;
}
