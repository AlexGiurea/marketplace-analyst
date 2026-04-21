import { Navigate, Route, Routes } from "react-router-dom";
import { ChatPage } from "./pages/ChatPage";
import { DevDashboardPreviewPage } from "./pages/DevDashboardPreviewPage";
import { QuarterDashboardPage } from "./pages/QuarterDashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/workspace" element={<QuarterDashboardPage />} />
      {import.meta.env.DEV ? <Route path="/dev/dashboard" element={<DevDashboardPreviewPage />} /> : null}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
