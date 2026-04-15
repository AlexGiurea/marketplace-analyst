import { Navigate, Route, Routes } from "react-router-dom";
import { ChatPage } from "./pages/ChatPage";
import { QuarterDashboardPage } from "./pages/QuarterDashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/workspace" element={<QuarterDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
