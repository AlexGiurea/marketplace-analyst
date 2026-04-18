import type { DemoSnapshot } from "../../frontend/src/types/demoSnapshot.js";
import type { FunctionTool } from "openai/resources/responses/responses.js";

function money(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "get_team_quarter_overview",
      description: "High-level team, quarter, share, revenue, net income from the live snapshot.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_brand_performance",
      description: "Per-brand demand, sell-through, stockout, pricing, revenue, and brand profit.",
      parameters: {
        type: "object",
        properties: {
          brandName: {
            type: "string",
            description: "Optional: Core, Nomad, or omit for all brands.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_balanced_scorecard",
      description: "All Balanced Scorecard themes with scores, priors, trends, weights, cumulative.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_finance_and_cash",
      description: "Debt, dividends, cash (begin/end from accounting), interest note.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_manufacturing_capacity",
      description: "Capacity, utilization, lost sales, inventory, next-quarter demand forecast, facilities.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_marketing_and_sales_summary",
      description: "Marketing spend mix, pricing notes, salespeople, regional coverage summary.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
];

export const RESPONSE_TOOL_DEFINITIONS: FunctionTool[] = TOOL_DEFINITIONS.map((tool) => ({
  type: "function",
  name: tool.function.name,
  description: tool.function.description,
  parameters: tool.function.parameters,
  strict: false,
}));

export function runTool(name: string, args: Record<string, unknown>, snapshot: DemoSnapshot): string {
  switch (name) {
    case "get_team_quarter_overview":
      return JSON.stringify({
        company: snapshot.company.name,
        quarter: snapshot.quarter.label,
        viewingResultsFor: snapshot.quarter.viewingResultsFor,
        preparingDecisionsFor: snapshot.quarter.preparingDecisionsFor,
        overallSharePct: snapshot.performance.overallSharePct,
        cumulativeScorecardIndex: snapshot.quarter.cumulativeBalancedScorecardIndex,
        revenue: snapshot.accounting.revenue,
        netIncome: snapshot.accounting.netIncome,
        revenueFormatted: money(snapshot.accounting.revenue),
        netIncomeFormatted: money(snapshot.accounting.netIncome),
      });
    case "get_brand_performance": {
      const filter = (args.brandName as string | undefined)?.toLowerCase();
      const brands = snapshot.performance.brands.filter(
        (b) => !filter || b.name.toLowerCase() === filter,
      );
      return JSON.stringify(
        brands.map((b) => ({
          name: b.name,
          segment: b.segment,
          demand: b.demand,
          sold: b.sold,
          stockout: b.stockout,
          endingInventory: b.endingInventory,
          price: b.price,
          rebate: b.rebate,
          revenue: b.revenue,
          brandProfit: b.brandProfit,
          revenueFormatted: money(b.revenue),
          brandProfitFormatted: money(b.brandProfit),
        })),
      );
    }
    case "get_balanced_scorecard":
      return JSON.stringify(snapshot.balancedScorecard);
    case "get_finance_and_cash":
      return JSON.stringify({
        shortTermDebt: snapshot.finance.shortTermDebt,
        longTermDebt: snapshot.finance.longTermDebt,
        dividends: snapshot.finance.dividends,
        beginningCash: snapshot.accounting.beginningCash,
        endingCash: snapshot.accounting.endingCash,
        shortTermDebtFormatted: money(snapshot.finance.shortTermDebt),
        longTermDebtFormatted: money(snapshot.finance.longTermDebt),
        dividendsFormatted: money(snapshot.finance.dividends),
        endingCashFormatted: money(snapshot.accounting.endingCash),
        interestNote: snapshot.finance.interestRateNote,
      });
    case "get_manufacturing_capacity":
      return JSON.stringify({
        operatingCapacityUnits: snapshot.manufacturing.operatingCapacityUnits,
        utilizationPct: snapshot.manufacturing.utilizationPct,
        lostSalesUnits: snapshot.manufacturing.lostSalesUnits,
        endingInventoryTotal: snapshot.manufacturing.endingInventoryTotal,
        demandForecastNext: snapshot.manufacturing.demandForecastNext,
        facilities: snapshot.manufacturing.facilities,
        quality: snapshot.manufacturing.quality,
      });
    case "get_marketing_and_sales_summary":
      return JSON.stringify({
        advertisingSpend: snapshot.marketing.advertisingSpend,
        pricingNotes: snapshot.marketing.pricingNotes,
        advertisingNotes: snapshot.marketing.advertisingNotes,
        salespeople: snapshot.sales.salespeople,
        salaryPerRep: snapshot.sales.salaryPerRep,
        salaryPerRepFormatted: money(snapshot.sales.salaryPerRep),
        outletRows: snapshot.sales.outlets.length,
      });
    default:
      return JSON.stringify({ error: `Unknown tool ${name}` });
  }
}
