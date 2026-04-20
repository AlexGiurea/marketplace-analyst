import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
    isActive
      ? "border border-white/35 bg-[#0D50AC]/92 text-white shadow-[0_10px_28px_-10px_rgba(13,80,172,0.55)] backdrop-blur-md"
      : "border border-white/45 bg-white/40 text-slate-700 shadow-sm backdrop-blur-md hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/58 hover:shadow-md",
  ].join(" ");

export function TopNav() {
  return (
    <div className="border-b border-white/45 bg-[#C4D4DB]/85 backdrop-blur-xl">
      <nav
        className="animate-chat-strip flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
        aria-label="Primary"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden h-2.5 w-2.5 shrink-0 rounded-full sm:inline" style={{ backgroundColor: "#0B6381" }} />
          <p className="truncate text-sm font-semibold tracking-tight text-slate-800/90">Marketplace AI Demo</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div className="flex items-center gap-1 rounded-2xl border border-white/50 bg-white/30 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl">
            <NavLink to="/workspace" className={linkClass}>
              Quarter workspace
            </NavLink>
            <NavLink to="/" className={linkClass} end>
              AI Coach
            </NavLink>
          </div>
        </div>
      </nav>
    </div>
  );
}
