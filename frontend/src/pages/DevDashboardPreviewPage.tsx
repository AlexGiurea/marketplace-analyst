import { useSearchParams } from "react-router-dom";
import { DashboardPreviewWidget } from "../chat/coachDashboard";
import { TopNav } from "../components/TopNav";
import { useDemoData } from "../context/DemoDataContext";

/** Dev-only: open modal immediately. Use ?scope=quarter or ?scope=project */
export function DevDashboardPreviewPage() {
  const [params] = useSearchParams();
  const scope = params.get("scope") === "project" ? "project" : "quarter";
  const { snapshot, scenario, activeQuarterIndex } = useDemoData();

  return (
    <div className="min-h-dvh bg-gradient-to-br from-sky-100/90 via-[#e8f4f7] to-[#c5dfe8]">
      <TopNav />
      <div className="mx-auto max-w-3xl px-3 py-6 sm:px-6">
        <p className="mb-4 rounded-2xl border border-white/50 bg-white/40 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur-md">
          <span className="font-semibold text-slate-800">QA helper</span> (dev only). The full dashboard opens as a modal on load. Append{" "}
          <code className="rounded-md bg-white/90 px-1.5 py-0.5 text-xs">?scope=project</code> for the multi-quarter view. Use{" "}
          <strong className="font-semibold">AI Coach</strong> in the header to return to chat.
        </p>
        <div className="w-full max-w-xl sm:max-w-2xl">
          <DashboardPreviewWidget
            initialOpen
            widget={{ type: "dashboard_preview", scope }}
            context={{ snapshot, scenario, activeQuarterIndex }}
          />
        </div>
      </div>
    </div>
  );
}
