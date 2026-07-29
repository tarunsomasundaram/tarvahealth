import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { HealthProfileProvider } from "./contexts/HealthProfileContext";
import { ForumProvider } from "./contexts/ForumContext";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <HealthProfileProvider>
      <ForumProvider>
        <App />
      </ForumProvider>
    </HealthProfileProvider>
  </HelmetProvider>
);
