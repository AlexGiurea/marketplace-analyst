import type { DemoSnapshot } from "../types/demoSnapshot.js";

/** Build knowledge-index rows from a materialized quarter snapshot (used by randomize + scenario assembly). */
export function buildKnowledgeIndex(d: DemoSnapshot): DemoSnapshot["knowledgeIndex"] {
  const [b0, b1] = d.performance.brands;
  const mfg = d.balancedScorecard.find((r) => r.theme === "Manufacturing productivity");
  const lastGraph = d.performance.strategicGraph[d.performance.strategicGraph.length - 1];
  const firstGraph = d.performance.strategicGraph[0];
  return [
    {
      id: "perf-share",
      section: "Performance & reports",
      fact: `Team overall share ${d.performance.overallSharePct}% after last processed quarter; ${b0.name} stockout ${b0.stockout ? "yes" : "no"}, ${b1.name} ending inventory ${b1.endingInventory} units.`,
    },
    {
      id: "score-mfg",
      section: "Balanced scorecard",
      fact: mfg
        ? `Manufacturing productivity score ${mfg.score} (prior ${mfg.priorScore}) — ${mfg.trend === "down" ? "pressure from capacity/stockouts" : "stable vs prior"}.`
        : "Manufacturing productivity updated in scorecard.",
    },
    {
      id: "mkt-price",
      section: "Marketing → Pricing",
      fact: `${b0.name} price ${b0.price.toLocaleString()}; ${b1.name} ${b1.price.toLocaleString()}; rebates ${b0.rebate} / ${b1.rebate}.`,
    },
    {
      id: "mfg-cap",
      section: "Manufacturing",
      fact: `Operating capacity ${d.manufacturing.operatingCapacityUnits} units; utilization ${d.manufacturing.utilizationPct}%; forecast ${d.manufacturing.demandForecastNext.Core ?? 0} / ${d.manufacturing.demandForecastNext.Nomad ?? 0} next quarter.`,
    },
    {
      id: "fin-cash",
      section: "Finance",
      fact: `Ending cash ${Math.round(d.accounting.endingCash / 1000)}k; dividends ${Math.round(d.finance.dividends / 1000)}k; short-term debt ${Math.round(d.finance.shortTermDebt / 1000)}k.`,
    },
    {
      id: "hr-prod",
      section: "Human resources",
      fact: `Sales productivity index ${d.humanResources.salesProductivityIndex} vs baseline 100; training ${d.humanResources.trainingHoursPerQuarter} hrs/quarter.`,
    },
    {
      id: "graph-appeal",
      section: "Strategic graphs",
      fact: `Market appeal ${firstGraph.marketAppealIndex} → ${lastGraph.marketAppealIndex}; share ${firstGraph.sharePct}% → ${lastGraph.sharePct}%.`,
    },
  ];
}
