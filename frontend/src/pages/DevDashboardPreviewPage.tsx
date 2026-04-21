import { useSearchParams } from "react-router-dom";
import { DashboardPreviewWidget } from "../chat/coachDashboard";
import { useDemoData } from "../context/DemoDataContext";

/** Dev-only: open modal immediately. Use ?scope=quarter or ?scope=project */
export function DevDashboardPreviewPage() {
  const [params] = useSearchParams();
  const scope = params.get("scope") === "project" ? "project" : "quarter";
  const { snapshot, scenario, activeQuarterIndex } = useDemoData();

  return (
    <div className="min-h-screen bg-slate-200/80 p-6">
      <p className="mb-4 max-w-xl text-sm text-slate-700">
        QA helper (dev build only). Modal opens automatically. Append <code className="rounded bg-white px-1">?scope=project</code> for multi-quarter
        project dashboard.
      </p>
      <div className="max-w-md">
        <DashboardPreviewWidget
          initialOpen
          widget={{ type: "dashboard_preview", scope }}
          context={{ snapshot, scenario, activeQuarterIndex }}
        />
      </div>
    </div>
  );
}
