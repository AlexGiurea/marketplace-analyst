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

/** Strip `q2-` prefix from retrieval chunk ids so citations map to workspace anchors. */
export function stripQuarterPrefix(citationId: string): { quarter1Based: number | null; baseId: string } {
  const m = citationId.match(/^q([1-9]\d*)-(.*)$/);
  if (m) {
    return { quarter1Based: parseInt(m[1], 10), baseId: m[2] };
  }
  return { quarter1Based: null, baseId: citationId };
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
  const { baseId } = stripQuarterPrefix(citationId);

  if (DIRECT_MAP[baseId]) {
    return DIRECT_MAP[baseId];
  }

  if (baseId.startsWith("brand-")) {
    const brandName = baseId.slice("brand-".length);
    const brandLabel = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    return {
      moduleId: "performance",
      subId: "performance-report",
      sectionId: `brand-row-${slugify(brandLabel)}`,
      label: `${brandLabel} performance`,
      title: "Performance report",
    };
  }

  if (baseId.startsWith("competitor-")) {
    const competitorName = baseId.slice("competitor-".length);
    const competitorLabel = competitorName.charAt(0).toUpperCase() + competitorName.slice(1);
    return {
      moduleId: "performance",
      subId: "competitor-profile",
      sectionId: `competitor-row-${slugify(competitorLabel)}`,
      label: `${competitorLabel} profile`,
      title: "Competitor profile",
    };
  }

  if (baseId.startsWith("scorecard-")) {
    const themeSlug = baseId.slice("scorecard-".length);
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

  const { quarter1Based } = stripQuarterPrefix(citationId);

  const params = new URLSearchParams({
    module: destination.moduleId,
    sub: destination.subId,
  });
  if (quarter1Based !== null) {
    params.set("quarter", String(quarter1Based));
  }

  return `/workspace?${params.toString()}${destination.sectionId ? `#${destination.sectionId}` : ""}`;
}
