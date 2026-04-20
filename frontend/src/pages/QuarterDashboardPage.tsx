import { useEffect, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import { useChatCoach } from "../context/ChatCoachContext";
import { useDemoData } from "../context/DemoDataContext";
import { defaultSubForModule, WORKSPACE_NAV, type ModuleId } from "../workspace/navConfig";
import { WorkspacePanels } from "../workspace/WorkspacePanels";

export function QuarterDashboardPage() {
  const { snapshot: d, scenario, activeQuarterIndex, setActiveQuarterIndex, randomize } = useDemoData();
  const { resetChat } = useChatCoach();

  function startNewScenario() {
    randomize();
    resetChat();
  }
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const requestedModule = searchParams.get("module");
  const moduleId: ModuleId = WORKSPACE_NAV.some((m) => m.moduleId === requestedModule)
    ? (requestedModule as ModuleId)
    : "performance";
  const requestedSub = searchParams.get("sub");
  const moduleConfig = WORKSPACE_NAV.find((m) => m.moduleId === moduleId);
  const subId =
    requestedSub && moduleConfig?.subs.some((s) => s.subId === requestedSub)
      ? requestedSub
      : defaultSubForModule(moduleId);

  const activeModule = useMemo(() => WORKSPACE_NAV.find((m) => m.moduleId === moduleId), [moduleId]);
  const activeSubLabel = useMemo(
    () => activeModule?.subs.find((s) => s.subId === subId)?.label ?? "",
    [activeModule, subId],
  );

  const quarterOptions = useMemo(
    () => Array.from({ length: scenario.quarters.length }, (_, i) => i + 1),
    [scenario.quarters.length],
  );

  useEffect(() => {
    if (searchParams.get("quarter") !== null) return;
    const next = new URLSearchParams(searchParams);
    next.set("quarter", String(activeQuarterIndex + 1));
    setSearchParams(next, { replace: true });
  }, [activeQuarterIndex, searchParams, setSearchParams]);

  useEffect(() => {
    const raw = searchParams.get("quarter");
    if (raw === null) return;
    const n = parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1 || n > scenario.quarters.length) return;
    setActiveQuarterIndex(n - 1);
  }, [searchParams, scenario.quarters.length, setActiveQuarterIndex]);

  useEffect(() => {
    const raw = searchParams.get("quarter");
    if (raw === String(activeQuarterIndex + 1)) return;
    const next = new URLSearchParams(searchParams);
    next.set("quarter", String(activeQuarterIndex + 1));
    setSearchParams(next, { replace: true });
  }, [activeQuarterIndex, searchParams, setSearchParams]);

  useEffect(() => {
    const currentModule = searchParams.get("module");
    const currentSub = searchParams.get("sub");
    if (currentModule === moduleId && currentSub === subId) return;

    const next = new URLSearchParams(searchParams);
    next.set("module", moduleId);
    next.set("sub", subId);
    setSearchParams(next, { replace: true });
  }, [moduleId, searchParams, setSearchParams, subId]);

  useEffect(() => {
    const hashId = location.hash.replace(/^#/, "");
    if (!hashId) return;

    const handle = window.requestAnimationFrame(() => {
      document.getElementById(hashId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(handle);
  }, [location.hash, moduleId, subId]);

  const selectWorkspaceView = (nextModuleId: ModuleId, nextSubId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("module", nextModuleId);
    next.set("sub", nextSubId);
    setSearchParams(next);
  };

  return (
    <div className="min-h-dvh bg-[#d8e4e8] px-0 py-0 sm:px-4 sm:py-5">
      <div className="animate-page-shell mx-auto flex min-h-dvh max-w-[1400px] flex-col overflow-hidden border-x border-slate-300/60 bg-[#eef3f5] shadow-xl sm:min-h-[calc(100dvh-2.5rem)] sm:rounded-lg">
        {/* App chrome — matches student-facing sim + our AI demo nav */}
        <div className="shrink-0 border-b border-slate-300/80 bg-white">
          <TopNav />
        </div>

        {/* Sim title bar (enterprise LMS style) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-[#dfe8ec] px-3 py-2 text-xs sm:px-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-slate-800">
            <span className="font-semibold tracking-tight">{d.simulation.title}</span>
            <span className="hidden text-slate-400 sm:inline">|</span>
            <span className="text-slate-600">
              Team: <span className="font-medium text-slate-900">{d.company.name}</span>
            </span>
            <span className="hidden text-slate-400 md:inline">|</span>
            <span className="hidden text-slate-600 md:inline">
              Mode: {d.simulation.mode === "classmates" ? "vs classmates (sync)" : "vs computer"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={startNewScenario}
              className="ui-btn-primary rounded-lg px-3 py-2 text-xs"
              title="New demo numbers and a fresh coach conversation"
            >
              New scenario
            </button>
            <label className="flex items-center gap-1.5 text-slate-700">
              <span className="hidden sm:inline">Quarter</span>
              <select
                className="rounded-lg border border-slate-300/90 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-900 shadow-sm backdrop-blur-sm transition hover:border-slate-400/90 hover:shadow-md"
                value={activeQuarterIndex + 1}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setActiveQuarterIndex(n - 1);
                  const next = new URLSearchParams(searchParams);
                  next.set("quarter", String(n));
                  setSearchParams(next, { replace: true });
                }}
                aria-label="View results for quarter"
              >
                {quarterOptions.map((q) => (
                  <option key={q} value={q}>
                    Quarter {q}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled
              className="ui-btn-disabled rounded-lg px-2.5 py-1.5 text-xs"
              title="Demo only — submit flow not wired"
            >
              Wrap up / Submit
            </button>
          </div>
        </div>

        {/* Workspace header */}
        <header className="border-b border-slate-200 bg-white px-3 py-3 sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0B6381]">Workspace</p>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                {d.quarter.label}
                <span className="font-normal text-slate-500"> · results & decisions</span>
              </h1>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                <span className="font-medium text-slate-800">{d.quarter.viewingResultsFor}</span>
                <span className="mx-1.5 text-slate-300">→</span>
                <span className="font-medium text-slate-800">{d.quarter.preparingDecisionsFor}</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Processed: {d.quarter.lastProcessedAtLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-900">
                {d.quarter.status.replaceAll("_", " ")}
              </span>
              <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                Cumulative scorecard (demo index): {d.quarter.cumulativeBalancedScorecardIndex}
              </span>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="mt-3 flex flex-wrap items-center gap-1 text-[11px] text-slate-600" aria-label="Breadcrumb">
            <span className="font-medium text-slate-500">Home</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-700">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-[#0B6381]">{activeModule?.short}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">{activeSubLabel}</span>
          </nav>
        </header>

        <p className="border-b border-amber-200/80 bg-amber-50 px-3 py-1.5 text-center text-[10px] leading-snug text-amber-950 sm:text-xs">
          {d.uiDisclaimer}
        </p>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Compact module rail + contextual sub-panel (saves vertical space vs full accordion tree) */}
          <aside className="flex w-full shrink-0 flex-col border-b border-slate-200/80 bg-gradient-to-b from-[#0b4558] via-[#083949] to-[#062f3f] md:min-h-0 md:w-[400px] md:shrink-0 md:border-b-0 md:border-r md:border-slate-200/80 lg:w-[420px]">
            <div className="border-b border-white/[0.07] px-4 py-4 md:px-5 md:py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Contents</p>
              <p className="mt-1 text-sm font-semibold leading-snug text-white/90 md:text-[0.95rem]">Modules · then pages</p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col md:min-h-[min(520px,calc(100dvh-14rem))] md:flex-row">
              <nav
                className="flex shrink-0 gap-2 overflow-x-auto border-b border-white/[0.08] px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] md:w-[158px] md:flex-col md:gap-2 md:overflow-y-auto md:border-b-0 md:border-r md:border-white/[0.08] md:px-3 md:py-4 [&::-webkit-scrollbar]:hidden"
                aria-label="Workspace modules"
              >
                {WORKSPACE_NAV.map((mod) => {
                  const isActiveModule = mod.moduleId === moduleId;
                  return (
                    <button
                      key={mod.moduleId}
                      type="button"
                      title={mod.label}
                      onClick={() => selectWorkspaceView(mod.moduleId, defaultSubForModule(mod.moduleId))}
                      className={[
                        "shrink-0 rounded-xl px-3.5 py-3 text-left text-[13px] leading-snug md:w-full md:px-3 md:py-3.5 md:text-[13px]",
                        isActiveModule ? "ui-btn-dark-active font-semibold text-white" : "ui-btn-dark text-white/88",
                      ].join(" ")}
                    >
                      <span className="md:hidden">{mod.short}</span>
                      <span className="hidden md:block md:line-clamp-5 md:leading-snug">{mod.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:min-w-0 md:px-4 md:py-5">
                {activeModule && (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">In this module</p>
                    <p className="mt-1.5 text-base font-semibold leading-snug text-white md:text-[1.05rem]">{activeModule.label}</p>
                    <ul className="mt-4 space-y-1.5" role="list">
                      {activeModule.subs.map((s) => {
                        const subOn = s.subId === subId;
                        return (
                          <li key={s.subId}>
                            <button
                              type="button"
                              onClick={() => selectWorkspaceView(activeModule.moduleId, s.subId)}
                              className={[
                                "w-full rounded-xl px-3 py-3 text-left text-[13px] font-medium leading-snug md:text-[0.9375rem]",
                                subOn ? "ui-btn-sub-active" : "ui-btn-dark text-white/85",
                              ].join(" ")}
                            >
                              {s.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="hidden border-t border-white/[0.07] p-4 text-[11px] leading-relaxed text-white/60 md:block md:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">RAG-ready snapshot</p>
              <p className="mt-2 text-white/60">
                Rail picks the module; the panel lists only that module’s pages—less scrolling than a full expanded tree.
              </p>
            </div>
          </aside>

          <main className="min-h-0 flex-1 overflow-y-auto bg-[#e8eef1] p-3 sm:p-5">
            <div
              key={`${moduleId}-${subId}`}
              className="animate-workspace-main mx-auto max-w-4xl space-y-4 pb-16"
            >
              <div className="rounded-xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-[0_8px_30px_-16px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                <h2 className="text-sm font-bold text-slate-900">{activeSubLabel}</h2>
                <p className="text-xs text-slate-500">
                  {activeModule?.label} · {d.company.targetSegments.join(", ")} segments targeted
                </p>
              </div>
              <WorkspacePanels d={d} moduleId={moduleId} subId={subId} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
