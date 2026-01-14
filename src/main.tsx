import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HealthProfileProvider } from "./contexts/HealthProfileContext";

createRoot(document.getElementById("root")!).render(
  <HealthProfileProvider>
    <App />
  </HealthProfileProvider>
);
