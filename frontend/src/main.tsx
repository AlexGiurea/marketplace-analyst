import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChatCoachProvider } from "./context/ChatCoachContext.tsx";
import { DemoDataProvider } from "./context/DemoDataContext.tsx";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DemoDataProvider>
      <BrowserRouter>
        <ChatCoachProvider>
          <App />
        </ChatCoachProvider>
      </BrowserRouter>
    </DemoDataProvider>
  </StrictMode>,
);
