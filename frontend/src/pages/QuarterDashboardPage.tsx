import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import { useChatCoach } from "../context/ChatCoachContext";
import { useDemoData } from "../context/DemoDataContext";
import { defaultSubForModule, WORKSPACE_NAV, type ModuleId } from "../workspace/navConfig";
import { WorkspacePanels } from "../workspace/WorkspacePanels";

function NavChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-white/55 transition-transform duration-200 ease-out ${expanded ? "rotate-0" : "-rotate-90"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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

  const [expandedModules, setExpandedModules] = useState<Record<ModuleId, boolean>>(
    () => Object.fromEntries(WORKSPACE_NAV.map((m) => [m.moduleId, true])) as Record<ModuleId, boolean>,
  );

  const toggleModuleExpanded = (id: ModuleId) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-dvh bg-[#d8e4e8] px-0 py-0 sm:px-4 sm:py-5">
      <div className="mx-auto flex min-h-dvh max-w-[1400px] flex-col overflow-hidden border-x border-slate-300/60 bg-[#eef3f5] shadow-xl sm:min-h-[calc(100dvh-2.5rem)] sm:rounded-lg">
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
              className="rounded-lg bg-[#0D50AC] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0c4590] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D50AC]"
              title="New demo numbers and a fresh coach conversation"
            >
              New scenario
            </button>
            <label className="flex items-center gap-1.5 text-slate-700">
              <span className="hidden sm:inline">Quarter</span>
              <select
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-900 shadow-sm"
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
              className="cursor-not-allowed rounded border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
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
          {/* Primary + secondary nav — resembles left-hand module tree in student walkthroughs */}
          <aside className="flex w-full shrink-0 flex-col border-b border-slate-200/80 bg-gradient-to-b from-[#0b4558] via-[#083949] to-[#062f3f] md:w-[288px] md:border-b-0 md:border-r md:border-slate-200/80">
            <div className="border-b border-white/[0.07] px-3 py-3 md:px-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Contents</p>
              <p className="mt-0.5 text-xs font-medium leading-snug text-white/70">Workspace modules</p>
            </div>
            <div className="max-h-[40vh] space-y-2 overflow-y-auto px-3 pb-3 pt-2 md:max-h-none md:flex-1 md:px-3.5 md:pb-4">
              {WORKSPACE_NAV.map((mod) => {
                const isActiveModule = mod.moduleId === moduleId;
                const expanded = expandedModules[mod.moduleId] ?? true;
                return (
                  <div
                    key={mod.moduleId}
                    className={[
                      "rounded-xl border border-white/[0.09] bg-white/[0.035] p-0.5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] backdrop-blur-[2px]",
                      isActiveModule ? "ring-1 ring-sky-300/25" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-stretch gap-1 rounded-[10px] bg-black/15">
                      <button
                        type="button"
                        onClick={() => {
                          selectWorkspaceView(mod.moduleId, defaultSubForModule(mod.moduleId));
                        }}
                        className={[
                          "min-w-0 flex-1 px-3 py-2.5 text-left text-[13px] font-semibold leading-tight tracking-tight transition-colors",
                          isActiveModule ? "text-white" : "text-white/88 hover:text-white",
                        ].join(" ")}
                      >
                        {mod.label}
                      </button>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-label={expanded ? `Collapse ${mod.label}` : `Expand ${mod.label}`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleModuleExpanded(mod.moduleId);
                        }}
                        className="flex shrink-0 items-center justify-center rounded-lg px-2.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                      >
                        <NavChevron expanded={expanded} />
                      </button>
                    </div>
                    {expanded && (
                      <ul className="space-y-0.5 px-1.5 pb-2 pt-1" role="list">
                        {mod.subs.map((s) => {
                          const subOn = s.subId === subId && isActiveModule;
                          return (
                            <li key={s.subId}>
                              <button
                                type="button"
                                onClick={() => {
                                  selectWorkspaceView(mod.moduleId, s.subId);
                                }}
                                className={[
                                  "w-full rounded-lg border border-transparent px-2.5 py-2 text-left text-[12px] leading-snug transition-all",
                                  subOn
                                    ? "border-white/25 bg-white font-semibold text-slate-900 shadow-sm"
                                    : "text-white/78 hover:border-white/12 hover:bg-white/[0.06] hover:text-white",
                                ].join(" ")}
                              >
                                {s.label}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="hidden border-t border-white/[0.07] p-3.5 text-[10px] leading-relaxed text-white/55 md:block">
              <p className="font-semibold uppercase tracking-wide text-white/65">RAG-ready snapshot</p>
              <p className="mt-1.5 text-white/55">
                This tree mirrors common Marketplace workspace areas. The same structured JSON can be chunked for retrieval + tool calls.
              </p>
            </div>
          </aside>

          <main className="min-h-0 flex-1 overflow-y-auto bg-[#e8eef1] p-3 sm:p-5">
            <div className="mx-auto max-w-4xl space-y-4 pb-16 animate-[msg-in_0.3s_ease-out_both]">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
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
