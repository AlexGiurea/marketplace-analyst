import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CoachDashboardModalBody } from "../chat/coachDashboard";
import { TopNav } from "../components/TopNav";
import { useDemoData } from "../context/DemoDataContext";
import {
  COACH_DASHBOARD_TRANSFER_PREFIX,
  type CoachDashboardTransferPayload,
} from "../lib/coachDashboardTransfer";

/** Prevents duplicate hydration when React Strict Mode re-runs effects. */
const processedDashboardTransfers = new Set<string>();

export function FullCoachDashboardPage() {
  const [searchParams] = useSearchParams();
  const { snapshot, scenario, activeQuarterIndex, setActiveQuarterIndex, hydrateScenario } = useDemoData();
  const [uiScope, setUiScope] = useState<"quarter" | "project">("quarter");

  useEffect(() => {
    const tid = searchParams.get("tid");

    if (tid) {
      if (processedDashboardTransfers.has(tid)) {
        return;
      }
      const raw = localStorage.getItem(COACH_DASHBOARD_TRANSFER_PREFIX + tid);
      if (raw) {
        try {
          const p = JSON.parse(raw) as CoachDashboardTransferPayload;
          if (p.v === 1 && p.scenario?.quarters?.length) {
            processedDashboardTransfers.add(tid);
            hydrateScenario(p.scenario, p.activeQuarterIndex);
            setUiScope(p.scope === "project" ? "project" : "quarter");
          }
        } catch {
          /* ignore malformed payload */
        } finally {
          localStorage.removeItem(COACH_DASHBOARD_TRANSFER_PREFIX + tid);
        }
        return;
      }
      return;
    }

    const s = searchParams.get("scope") === "project" ? "project" : "quarter";
    setUiScope(s);
    const qn = parseInt(searchParams.get("quarter") ?? "", 10);
    if (Number.isFinite(qn) && scenario.quarters.length > 0) {
      setActiveQuarterIndex(Math.min(Math.max(0, qn - 1), scenario.quarters.length - 1));
    }
  }, [searchParams, hydrateScenario, scenario.quarters.length, setActiveQuarterIndex]);

  const title = useMemo(
    () =>
      uiScope === "project"
        ? `${snapshot.company.name} — project dashboard`
        : `${snapshot.company.name} — ${snapshot.quarter.label}`,
    [snapshot, uiScope],
  );

  const caption = useMemo(
    () =>
      uiScope === "project"
        ? "Multi-quarter overview: share, revenue, profit, cash, scorecard, brands, and capacity trends."
        : "Quarter snapshot across performance, financials, and operations.",
    [uiScope],
  );

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#eef6f9] via-white to-[#f8fafc]">
      <div className="sticky top-0 z-50 border-b border-white/60 bg-white/85 backdrop-blur-md">
        <TopNav />
      </div>
      <main className="mx-auto max-w-[min(97vw,1400px)] px-3 py-4 sm:px-6 sm:py-5">
        <header className="mb-4 border-b border-slate-200/80 pb-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{caption}</p>
          <p className="mt-2 text-xs text-slate-500">
            This tab is only the dashboard. Use <strong className="font-medium text-slate-700">AI Coach</strong> in the header
            to return to chat — navigation always lands on main app routes, not an orphan screen.
          </p>
        </header>
        <CoachDashboardModalBody
          widgetScope={uiScope}
          snapshot={snapshot}
          scenario={scenario}
          activeQuarterIndex={activeQuarterIndex}
        />
      </main>
    </div>
  );
}
