import type { ReactNode } from "react";
import type { DemoSnapshot } from "../types/demoSnapshot";
import type { ModuleId } from "./navConfig";

export function fmtMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function PanelCard({ title, children, sectionId }: { title: string; children: ReactNode; sectionId?: string }) {
  return (
    <section id={sectionId} className="scroll-mt-24 rounded-lg border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="border-b border-slate-100 pb-2 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-sky-200/80 bg-sky-50/90 px-3 py-2 text-xs leading-relaxed text-sky-950">{children}</div>
  );
}

type PanelProps = {
  d: DemoSnapshot;
  moduleId: ModuleId;
  subId: string;
};

export function WorkspacePanels({ d, moduleId, subId }: PanelProps) {
  if (moduleId === "performance") {
    if (subId === "performance-report") {
      return (
        <>
          <InfoBanner>
            <strong>Results period:</strong> {d.quarter.viewingResultsFor}. Compare demand, sell-through, and inventory before entering{" "}
            {d.quarter.preparingDecisionsFor}.
          </InfoBanner>
          <PanelCard title="Performance report — unit sales & profitability by brand" sectionId="performance-report-panel">
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-600">
                    <th className="py-2.5 pr-3">Brand</th>
                    <th className="py-2.5 pr-3">Segment</th>
                    <th className="py-2.5 pr-3">Demand</th>
                    <th className="py-2.5 pr-3">Sold</th>
                    <th className="py-2.5 pr-3">Stockout</th>
                    <th className="py-2.5 pr-3">End inv.</th>
                    <th className="py-2.5 pr-3">Price</th>
                    <th className="py-2.5 pr-3">Revenue</th>
                    <th className="py-2.5 pr-3">Brand profit</th>
                  </tr>
                </thead>
                <tbody>
                  {d.performance.brands.map((b) => (
                    <tr key={b.name} id={`brand-row-${slugify(b.name)}`} className="scroll-mt-24 border-b border-slate-100 text-slate-800">
                      <td className="py-2.5 pr-3 font-medium">{b.name}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{b.segment}</td>
                      <td className="py-2.5 pr-3">{b.demand}</td>
                      <td className="py-2.5 pr-3">{b.sold}</td>
                      <td className="py-2.5 pr-3">{b.stockout ? "Yes" : "No"}</td>
                      <td className="py-2.5 pr-3">{b.endingInventory}</td>
                      <td className="py-2.5 pr-3">{fmtMoney(b.price)}</td>
                      <td className="py-2.5 pr-3">{fmtMoney(b.revenue)}</td>
                      <td className="py-2.5 pr-3 font-medium text-emerald-800">{fmtMoney(b.brandProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p id="overall-share" className="mt-3 scroll-mt-24 text-xs text-slate-600">
              Team share (overall): <span className="font-semibold text-slate-900">{d.performance.overallSharePct}%</span>
            </p>
          </PanelCard>
        </>
      );
    }
    if (subId === "market-share-demand") {
      return (
        <>
          <PanelCard title="Market demand by segment (industry vs your team)">
            <div className="overflow-x-auto">
              <table className="min-w-[480px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                    <th className="py-2.5 pr-3">Segment</th>
                    <th className="py-2.5 pr-3">Industry units</th>
                    <th className="py-2.5 pr-3">Your units sold</th>
                    <th className="py-2.5 pr-3">Your share (approx.)</th>
                  </tr>
                </thead>
                <tbody>
                  {d.performance.segmentDemand.map((s) => (
                    <tr key={s.segment} className="border-b border-slate-100">
                      <td className="py-2.5 pr-3 font-medium">{s.segment}</td>
                      <td className="py-2.5 pr-3">{s.industryUnits}</td>
                      <td className="py-2.5 pr-3">{s.teamUnits}</td>
                      <td className="py-2.5 pr-3">
                        {s.industryUnits > 0 ? ((s.teamUnits / s.industryUnits) * 100).toFixed(1) : "—"}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelCard>
          <PanelCard title="Customer & market feedback (summary)">
            <p className="text-sm text-slate-700">
              Traveler buyers cite portability; Workhorse buyers cite warranty and service proximity. Monitor <strong>lost sales</strong>{" "}
              ({d.manufacturing.lostSalesUnits} units) and <strong>stockouts</strong> when interpreting demand signals.
            </p>
          </PanelCard>
        </>
      );
    }
    if (subId === "financial-reports") {
      return (
        <PanelCard title="Financial reports — quick links (period)" sectionId="financial-reports-panel">
          <p className="text-sm text-slate-700">
            Vendor materials reference <strong>basic financial statements</strong>, <strong>brand profitability</strong>, and{" "}
            <strong>industry financial ratios</strong>. Use the <em>Accounting</em> module for line-by-line views in this demo.
          </p>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Revenue (Q3 results): {fmtMoney(d.accounting.revenue)}</li>
            <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Net income: {fmtMoney(d.accounting.netIncome)}</li>
            <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Ending cash: {fmtMoney(d.accounting.endingCash)}</li>
            <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">Total equity: {fmtMoney(d.accounting.equity)}</li>
          </ul>
        </PanelCard>
      );
    }
    if (subId === "balanced-scorecard") {
      return (
        <PanelCard title="Balanced scorecard — period scores & cumulative (demo)" sectionId="balanced-scorecard-panel">
          <p className="mb-3 text-xs text-slate-600">
            Nine themes per official Core SKU copy. LMS grade narrative: last quarter&apos;s <strong>cumulative</strong> scorecard (scalar) —
            demo shows both period and running cumulative per row.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                  <th className="py-2.5 pr-3">Theme</th>
                  <th className="py-2.5 pr-3">Weight %</th>
                  <th className="py-2.5 pr-3">Score</th>
                  <th className="py-2.5 pr-3">Prior</th>
                  <th className="py-2.5 pr-3">Trend</th>
                  <th className="py-2.5 pr-3">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {d.balancedScorecard.map((row) => (
                  <tr
                    key={row.theme}
                    id={`scorecard-theme-${slugify(row.theme)}`}
                    className="scroll-mt-24 border-b border-slate-100"
                  >
                    <td className="py-2.5 pr-3">{row.theme}</td>
                    <td className="py-2.5 pr-3 text-slate-600">{row.weightPct}%</td>
                    <td className="py-2.5 pr-3 font-semibold">{row.score}</td>
                    <td className="py-2.5 pr-3 text-slate-600">{row.priorScore}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={
                          row.trend === "up" ? "text-emerald-700" : row.trend === "down" ? "text-rose-700" : "text-slate-600"
                        }
                      >
                        {row.trend === "up" ? "Up" : row.trend === "down" ? "Down" : "Flat"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-slate-800">{row.cumulativeScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Composite index (demo): <strong>{d.quarter.cumulativeBalancedScorecardIndex}</strong> — fictional rollup for pitch only.
          </p>
        </PanelCard>
      );
    }
    if (subId === "strategic-graphs") {
      return (
        <>
          <PanelCard title="Strategic graphs — market appeal, profit, share (trend)" sectionId="strategic-graphs-panel">
            <div className="overflow-x-auto">
              <table className="min-w-[520px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                    <th className="py-2.5 pr-3">Point</th>
                    <th className="py-2.5 pr-3">Market appeal</th>
                    <th className="py-2.5 pr-3">Cumulative profit</th>
                    <th className="py-2.5 pr-3">Share %</th>
                  </tr>
                </thead>
                <tbody>
                  {d.performance.strategicGraph.map((g) => (
                    <tr key={g.quarterLabel} className="border-b border-slate-100">
                      <td className="py-2.5 pr-3 font-medium">{g.quarterLabel}</td>
                      <td className="py-2.5 pr-3">{g.marketAppealIndex}</td>
                      <td className="py-2.5 pr-3">{fmtMoney(g.cumulativeProfit)}</td>
                      <td className="py-2.5 pr-3">{g.sharePct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelCard>
          <PanelCard title="Market Impact Graph (narrative)">
            <p className="text-sm text-slate-700">{d.performance.marketImpactNote}</p>
          </PanelCard>
        </>
      );
    }
    if (subId === "competitor-profile") {
      return (
        <PanelCard title="Competitor profile" sectionId="competitor-profile-panel">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                  <th className="py-2.5 pr-3">Firm</th>
                  <th className="py-2.5 pr-3">Share</th>
                  <th className="py-2.5 pr-3">Brands</th>
                  <th className="py-2.5 pr-3">Avg price</th>
                  <th className="py-2.5 pr-3">Marketing</th>
                  <th className="py-2.5 pr-3">Reliability</th>
                  <th className="py-2.5 pr-3">Capacity idx</th>
                </tr>
              </thead>
              <tbody>
                {d.performance.competitors.map((c) => (
                  <tr
                    key={c.name}
                    id={`competitor-row-${slugify(c.name)}`}
                    className="scroll-mt-24 border-b border-slate-100"
                  >
                    <td className="py-2.5 pr-3 font-medium">{c.name}</td>
                    <td className="py-2.5 pr-3">{c.sharePct}%</td>
                    <td className="py-2.5 pr-3">{c.brandCount}</td>
                    <td className="py-2.5 pr-3">{fmtMoney(c.avgPrice)}</td>
                    <td className="py-2.5 pr-3">{fmtMoney(c.marketingBudget)}</td>
                    <td className="py-2.5 pr-3">{c.reliability}</td>
                    <td className="py-2.5 pr-3">{c.capacityIndex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      );
    }
    if (subId === "detail-brand-demand") {
      return (
        <PanelCard title="Detail brand demand — competitive set" sectionId="detail-brand-demand-panel">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                  <th className="py-2.5 pr-3">Competitor</th>
                  <th className="py-2.5 pr-3">Brand</th>
                  <th className="py-2.5 pr-3">Segment</th>
                  <th className="py-2.5 pr-3">Price</th>
                  <th className="py-2.5 pr-3">Share in segment</th>
                </tr>
              </thead>
              <tbody>
                {d.performance.competitorBrands.map((r, i) => (
                  <tr key={`${r.competitor}-${r.brandName}-${i}`} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3">{r.competitor}</td>
                    <td className="py-2.5 pr-3 font-medium">{r.brandName}</td>
                    <td className="py-2.5 pr-3 text-slate-600">{r.segment}</td>
                    <td className="py-2.5 pr-3">{fmtMoney(r.price)}</td>
                    <td className="py-2.5 pr-3">{r.shareInSegmentPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      );
    }
  }

  if (moduleId === "marketing") {
    if (subId === "brand-management") {
      return (
        <>
        <PanelCard title="Brand management — profitability workspace" sectionId="brand-management-panel">
            <div className="overflow-x-auto">
              <table className="min-w-[560px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                    <th className="py-2.5 pr-3">Brand</th>
                    <th className="py-2.5 pr-3">Revenue</th>
                    <th className="py-2.5 pr-3">COGS</th>
                    <th className="py-2.5 pr-3">Gross profit</th>
                    <th className="py-2.5 pr-3">Ad / design</th>
                    <th className="py-2.5 pr-3">Brand profit</th>
                  </tr>
                </thead>
                <tbody>
                  {d.performance.brands.map((b) => (
                    <tr key={b.name} className="border-b border-slate-100">
                      <td className="py-2.5 pr-3 font-medium">{b.name}</td>
                      <td className="py-2.5 pr-3">{fmtMoney(b.revenue)}</td>
                      <td className="py-2.5 pr-3">{fmtMoney(b.cogs)}</td>
                      <td className="py-2.5 pr-3">{fmtMoney(b.grossProfit)}</td>
                      <td className="py-2.5 pr-3">{fmtMoney(b.adDesignSpend)}</td>
                      <td className="py-2.5 pr-3 font-semibold text-emerald-800">{fmtMoney(b.brandProfit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelCard>
          <PanelCard title="Brand design — positioning attributes">
            <div className="grid gap-3 sm:grid-cols-2">
              {d.marketing.brandFeatures.map((bf) => (
                <div key={bf.brand} className="rounded-md border border-slate-200 bg-slate-50/80 p-3">
                  <p className="text-sm font-semibold text-slate-900">{bf.brand}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                    {bf.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </PanelCard>
        </>
      );
    }
    if (subId === "pricing") {
      return (
        <PanelCard title="Pricing — retail & rebates" sectionId="pricing-panel">
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            {d.performance.brands.map((b) => (
              <li key={b.name}>
                <span className="font-semibold">{b.name}:</span> {fmtMoney(b.price)} retail, rebate {fmtMoney(b.rebate)}.
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-slate-600">{d.marketing.pricingNotes}</p>
        </PanelCard>
      );
    }
    if (subId === "advertising") {
      return (
        <>
          <PanelCard title="Advertising — media mix (demo)">
            <div className="overflow-x-auto">
              <table className="w-full max-w-md border-collapse text-sm">
                <tbody>
                  {(
                    [
                      ["National media", d.marketing.advertisingSpend.nationalMedia],
                      ["Regional media", d.marketing.advertisingSpend.regionalMedia],
                      ["Local media", d.marketing.advertisingSpend.localMedia],
                      ["Internet", d.marketing.advertisingSpend.internet],
                    ] as const
                  ).map(([label, amt]) => (
                    <tr key={label} className="border-b border-slate-100">
                      <td className="py-2 font-medium text-slate-700">{label}</td>
                      <td className="py-2 text-right">{fmtMoney(amt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelCard>
          <PanelCard title="Copy & placement notes">
            <p className="text-sm text-slate-700">{d.marketing.advertisingNotes}</p>
          </PanelCard>
        </>
      );
    }
    if (subId === "market-research") {
      return (
        <PanelCard title="Buy market research — purchased reports">
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            {d.marketing.marketResearchPurchased.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </PanelCard>
      );
    }
    if (subId === "tactical-summary") {
      return (
        <PanelCard title="Tactical summary — marketing">
          <p className="text-sm leading-relaxed text-slate-800">{d.marketing.tacticalSummary}</p>
        </PanelCard>
      );
    }
  }

  if (moduleId === "sales") {
    if (subId === "sales-results") {
      return (
        <PanelCard title="Sales results — by region & brand" sectionId="sales-results-panel">
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                  <th className="py-2.5 pr-3">Region</th>
                  <th className="py-2.5 pr-3">Brand</th>
                  <th className="py-2.5 pr-3">Units</th>
                  <th className="py-2.5 pr-3">Revenue</th>
                  <th className="py-2.5 pr-3">GM %</th>
                </tr>
              </thead>
              <tbody>
                {d.sales.regions.map((r) => (
                  <tr key={`${r.region}-${r.brand}`} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3 font-medium">{r.region}</td>
                    <td className="py-2.5 pr-3">{r.brand}</td>
                    <td className="py-2.5 pr-3">{r.units}</td>
                    <td className="py-2.5 pr-3">{fmtMoney(r.revenue)}</td>
                    <td className="py-2.5 pr-3">{r.grossMarginPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      );
    }
    if (subId === "regional-profitability") {
      return (
        <PanelCard title="Regional profitability">
          <p className="mb-2 text-xs text-slate-600">Gross margin % shown; fully loaded regional profit would include allocation (demo simplification).</p>
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                  <th className="py-2.5 pr-3">Region</th>
                  <th className="py-2.5 pr-3">Brand</th>
                  <th className="py-2.5 pr-3">Revenue</th>
                  <th className="py-2.5 pr-3">GM %</th>
                </tr>
              </thead>
              <tbody>
                {d.sales.regions.map((r) => (
                  <tr key={`${r.region}-${r.brand}-rp`} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3 font-medium">{r.region}</td>
                    <td className="py-2.5 pr-3">{r.brand}</td>
                    <td className="py-2.5 pr-3">{fmtMoney(r.revenue)}</td>
                    <td className="py-2.5 pr-3">{r.grossMarginPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      );
    }
    if (subId === "competitors-city") {
      return (
        <>
          <PanelCard title="Competitors in the city (narrative)" sectionId="competitors-city-panel">
            <p className="text-sm text-slate-700">{d.sales.competitorsInCityNote}</p>
          </PanelCard>
          <PanelCard title="Your outlets & coverage" sectionId="sales-outlets-panel">
            <div className="overflow-x-auto">
              <table className="min-w-[520px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                    <th className="py-2.5 pr-3">Market</th>
                    <th className="py-2.5 pr-3">City / hub</th>
                    <th className="py-2.5 pr-3">Outlets</th>
                    <th className="py-2.5 pr-3">Reps assigned</th>
                  </tr>
                </thead>
                <tbody>
                  {d.sales.outlets.map((o) => (
                    <tr
                      key={`${o.market}-${o.cityLabel}`}
                      id={`sales-outlet-${slugify(`${o.market}-${o.cityLabel}`)}`}
                      className="scroll-mt-24 border-b border-slate-100"
                    >
                      <td className="py-2.5 pr-3 font-medium">{o.market}</td>
                      <td className="py-2.5 pr-3">{o.cityLabel}</td>
                      <td className="py-2.5 pr-3">{o.outletsOpen}</td>
                      <td className="py-2.5 pr-3">{o.salespeopleAssigned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelCard>
        </>
      );
    }
    if (subId === "sales-force") {
      return (
        <>
        <PanelCard title="Sales force — headcount & compensation drivers" sectionId="sales-force-panel">
            <p className="text-sm text-slate-700">
              Active salespeople: <span className="font-semibold">{d.sales.salespeople}</span>
              <span className="mx-2 text-slate-300">|</span>
              Average salary / rep: <span className="font-semibold">{fmtMoney(d.sales.salaryPerRep)}</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">{d.humanResources.headcountNote}</p>
          </PanelCard>
          <PanelCard title="Territory coverage">
            <div className="overflow-x-auto">
              <table className="min-w-[480px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                    <th className="py-2.5 pr-3">Market</th>
                    <th className="py-2.5 pr-3">Outlets</th>
                    <th className="py-2.5 pr-3">Reps</th>
                  </tr>
                </thead>
                <tbody>
                  {["Americas", "EMEA", "Asia Pacific"].map((m) => {
                    const rows = d.sales.outlets.filter((o) => o.market === m);
                    const outlets = rows.reduce((s, o) => s + o.outletsOpen, 0);
                    const reps = rows.reduce((s, o) => s + o.salespeopleAssigned, 0);
                    return (
                      <tr key={m} className="border-b border-slate-100">
                        <td className="py-2.5 pr-3 font-medium">{m}</td>
                        <td className="py-2.5 pr-3">{outlets}</td>
                        <td className="py-2.5 pr-3">{reps}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </PanelCard>
        </>
      );
    }
    if (subId === "tactical-summary") {
      return (
        <PanelCard title="Tactical summary — sales">
          <p className="text-sm leading-relaxed text-slate-800">{d.sales.tacticalSummary}</p>
        </PanelCard>
      );
    }
  }

  if (moduleId === "manufacturing") {
    if (subId === "inventory-results") {
      return (
        <PanelCard title="Inventory & prior-period results" sectionId="manufacturing-inventory-results">
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              Ending inventory (units): <span className="font-semibold">{d.manufacturing.endingInventoryTotal}</span>
            </li>
            <li>
              <strong>Lost sales</strong> (units):{" "}
              <span className="font-semibold text-rose-700">{d.manufacturing.lostSalesUnits}</span>
            </li>
            <li>
              <strong>Stockouts:</strong> Core (yes), Nomad (no) — see Performance report.
            </li>
          </ul>
          <p className="mt-3 text-sm text-slate-600">{d.manufacturing.productionNotes}</p>
        </PanelCard>
      );
    }
    if (subId === "facilities") {
      return (
        <PanelCard title="Production facilities" sectionId="manufacturing-facilities">
          <div className="overflow-x-auto">
            <table className="min-w-[480px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                  <th className="py-2.5 pr-3">ID</th>
                  <th className="py-2.5 pr-3">Location</th>
                  <th className="py-2.5 pr-3">Capacity</th>
                  <th className="py-2.5 pr-3">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {d.manufacturing.facilities.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3 font-mono text-xs">{f.id}</td>
                    <td className="py-2.5 pr-3">{f.location}</td>
                    <td className="py-2.5 pr-3">{f.capacityUnits}</td>
                    <td className="py-2.5 pr-3">{f.utilizationPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      );
    }
    if (subId === "demand-capacity") {
      return (
        <PanelCard title="Demand projection & operating capacity" sectionId="manufacturing-demand-capacity">
          <p className="text-sm text-slate-700">
            Operating capacity (total): <span className="font-semibold">{d.manufacturing.operatingCapacityUnits}</span> units · portfolio
            utilization <span className="font-semibold">{d.manufacturing.utilizationPct}%</span>
          </p>
          <p className="mt-3 text-sm font-medium text-slate-900">Next-quarter demand forecast</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {Object.entries(d.manufacturing.demandForecastNext).map(([k, v]) => (
              <li key={k}>
                <span className="font-semibold">{k}:</span> {v} units
              </li>
            ))}
          </ul>
        </PanelCard>
      );
    }
    if (subId === "production-plan") {
      return (
        <PanelCard title="Production plan (checklist — demo)">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>Clear Core backlog first; prioritize F1 overtime slot.</li>
            <li>Build Nomad to target ending inventory 35–45 units.</li>
            <li>Review changeover losses if dual-brand runs same week.</li>
          </ol>
        </PanelCard>
      );
    }
    if (subId === "quality") {
      return (
        <PanelCard title="Quality & reliability" sectionId="manufacturing-quality-panel">
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              Warranty expense: <span className="font-semibold">{fmtMoney(d.manufacturing.quality.warrantyExpense)}</span>
            </li>
            <li>
              Reliability score: <span className="font-semibold">{d.manufacturing.quality.reliabilityScore}</span>
            </li>
            <li>
              Inspection yield: <span className="font-semibold">{d.manufacturing.quality.inspectionYieldPct}%</span>
            </li>
          </ul>
        </PanelCard>
      );
    }
    if (subId === "tactical-summary") {
      return (
        <PanelCard title="Tactical summary — manufacturing">
          <p className="text-sm leading-relaxed text-slate-800">{d.manufacturing.tacticalSummary}</p>
        </PanelCard>
      );
    }
  }

  if (moduleId === "humanResources") {
    if (subId === "compensation") {
      return (
        <PanelCard title="Compensation & benefits">
          <p className="text-sm text-slate-700">
            Model: <span className="font-semibold">{d.humanResources.compensationModel}</span>
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Annual benefits cost (demo): <span className="font-semibold">{fmtMoney(d.humanResources.benefitsCostAnnual)}</span>
          </p>
          <p className="mt-2 text-sm text-slate-600">{d.humanResources.headcountNote}</p>
        </PanelCard>
      );
    }
    if (subId === "productivity") {
      return (
        <PanelCard title="Productivity & training" sectionId="hr-productivity-panel">
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              Sales productivity index: <span className="font-semibold">{d.humanResources.salesProductivityIndex}</span> (baseline 100)
            </li>
            <li>
              Training hours / quarter: <span className="font-semibold">{d.humanResources.trainingHoursPerQuarter}</span>
            </li>
          </ul>
        </PanelCard>
      );
    }
  }

  if (moduleId === "accounting") {
    if (subId === "income-statement") {
      return (
        <PanelCard title="Income statement (simplified)" sectionId="income-statement-panel">
          <div className="overflow-x-auto">
            <table className="min-w-[400px] w-full border-collapse text-sm">
              <tbody>
                {d.accounting.incomeStatement.map((line) => (
                  <tr
                    key={line.label}
                    className={`border-b border-slate-100 ${line.isSubtotal ? "bg-slate-50 font-semibold" : ""}`}
                  >
                    <td className="py-2 pr-3 text-slate-800">{line.label}</td>
                    <td className="py-2 text-right tabular-nums">{fmtMoney(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      );
    }
    if (subId === "cash-flow") {
      return (
        <PanelCard title="Cash flow (summary)" sectionId="cash-flow-panel">
          <div className="overflow-x-auto">
            <table className="min-w-[360px] w-full border-collapse text-sm">
              <tbody>
                {d.accounting.cashFlow.map((line) => (
                  <tr key={line.label} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{line.label}</td>
                    <td className={`py-2 text-right tabular-nums ${line.amount < 0 ? "text-rose-700" : "text-slate-800"}`}>
                      {fmtMoney(line.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Beginning cash {fmtMoney(d.accounting.beginningCash)} → Ending {fmtMoney(d.accounting.endingCash)}
          </p>
        </PanelCard>
      );
    }
    if (subId === "balance-sheet") {
      return (
        <PanelCard title="Balance sheet (summary)" sectionId="balance-sheet-panel">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Assets</p>
              <p className="mt-2 font-semibold text-slate-900">{fmtMoney(d.accounting.totalAssets)}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Liabilities</p>
              <p className="mt-2 font-semibold text-slate-900">{fmtMoney(d.accounting.totalLiabilities)}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm sm:col-span-2">
              <p className="text-xs font-semibold uppercase text-slate-500">Equity</p>
              <p className="mt-2 font-semibold text-slate-900">{fmtMoney(d.accounting.equity)}</p>
            </div>
          </div>
        </PanelCard>
      );
    }
    if (subId === "brand-profitability") {
      return (
        <PanelCard title="Brand profitability report" sectionId="brand-profitability-panel">
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                  <th className="py-2.5 pr-3">Brand</th>
                  <th className="py-2.5 pr-3">Revenue</th>
                  <th className="py-2.5 pr-3">Gross profit</th>
                  <th className="py-2.5 pr-3">Brand profit</th>
                </tr>
              </thead>
              <tbody>
                {d.performance.brands.map((b) => (
                  <tr key={b.name} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3 font-medium">{b.name}</td>
                    <td className="py-2.5 pr-3">{fmtMoney(b.revenue)}</td>
                    <td className="py-2.5 pr-3">{fmtMoney(b.grossProfit)}</td>
                    <td className="py-2.5 pr-3 font-semibold text-emerald-800">{fmtMoney(b.brandProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      );
    }
    if (subId === "industry-ratios") {
      return (
        <PanelCard title="Industry financial ratios" sectionId="industry-ratios-panel">
          <div className="overflow-x-auto">
            <table className="min-w-[480px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase text-slate-600">
                  <th className="py-2.5 pr-3">Ratio</th>
                  <th className="py-2.5 pr-3">Your co.</th>
                  <th className="py-2.5 pr-3">Industry median</th>
                </tr>
              </thead>
              <tbody>
                {d.accounting.industryRatios.map((r) => (
                  <tr key={r.name} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3 font-medium">{r.name}</td>
                    <td className="py-2.5 pr-3 tabular-nums">
                      {r.unit === "percent" ? `${r.teamValue.toFixed(1)}%` : r.teamValue.toFixed(2)}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums text-slate-600">
                      {r.unit === "percent" ? `${r.industryMedian.toFixed(1)}%` : r.industryMedian.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      );
    }
  }

  if (moduleId === "finance") {
    if (subId === "capital-structure") {
      return (
        <PanelCard title="Debt & equity" sectionId="capital-structure-panel">
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              Short-term debt: <span className="font-semibold">{fmtMoney(d.finance.shortTermDebt)}</span>
            </li>
            <li>
              Long-term debt: <span className="font-semibold">{fmtMoney(d.finance.longTermDebt)}</span>
            </li>
            <li>
              Stock issuance (period): <span className="font-semibold">{fmtMoney(d.finance.stockIssuance)}</span>
            </li>
          </ul>
          <p className="mt-3 text-sm text-slate-600">{d.finance.interestRateNote}</p>
          <p className="mt-2 text-sm text-slate-600">{d.finance.equityRaiseCapacityNote}</p>
        </PanelCard>
      );
    }
    if (subId === "shareholder") {
      return (
        <PanelCard title="Dividends & repurchase" sectionId="shareholder-panel">
          <p className="text-sm text-slate-700">
            Dividends declared: <span className="font-semibold">{fmtMoney(d.finance.dividends)}</span>
          </p>
        </PanelCard>
      );
    }
    if (subId === "pro-forma") {
      return (
        <>
          <PanelCard title="Pro forma / accounting workflow">
            <p className="text-sm text-slate-700">{d.accounting.proFormaNote}</p>
          </PanelCard>
          <PanelCard title="Tactical summary — finance">
            <p className="text-sm text-slate-800">{d.finance.tacticalSummary}</p>
          </PanelCard>
        </>
      );
    }
  }

  return (
    <PanelCard title="Screen">
      <p className="text-sm text-slate-600">No panel mapped for this selection.</p>
    </PanelCard>
  );
}
