import { NavLink } from "react-router-dom";
import { useChatCoach } from "../context/ChatCoachContext";
import { useDemoData } from "../context/DemoDataContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-200",
    isActive
      ? "bg-[#0D50AC] text-white shadow-md"
      : "text-slate-700 hover:bg-white/55 hover:text-slate-900",
  ].join(" ");

export function TopNav() {
  const { resetChat } = useChatCoach();
  const { randomize } = useDemoData();

  function startNewScenario() {
    randomize();
    resetChat();
  }

  return (
    <div className="border-b border-white/45 bg-[#C4D4DB]/90 backdrop-blur-md">
      <nav
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5"
        aria-label="Primary"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden h-2.5 w-2.5 shrink-0 rounded-full sm:inline" style={{ backgroundColor: "#0B6381" }} />
          <p className="truncate text-sm font-semibold tracking-tight text-slate-800/90">Marketplace AI Demo</p>
        </div>
        <div className="flex items-center gap-1 rounded-2xl border border-white/55 bg-white/35 p-1 backdrop-blur-sm">
          <NavLink to="/workspace" className={linkClass}>
            Quarter workspace
          </NavLink>
          <NavLink to="/" className={linkClass} end>
            AI Coach
          </NavLink>
        </div>
      </nav>
      <div className="flex justify-end border-t border-white/30 px-4 pb-3 pt-2 sm:px-5">
        <button
          type="button"
          onClick={startNewScenario}
          className="rounded-xl border border-[#0B6381] bg-[#0B6381] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c7394]"
          title="New demo numbers and a fresh coach conversation"
        >
          New scenario
        </button>
      </div>
    </div>
  );
}
