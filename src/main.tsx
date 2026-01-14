import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { HealthProfileProvider } from "./contexts/HealthProfileContext";
import { ForumProvider } from "./contexts/ForumContext";

createRoot(document.getElementById("root")!).render(
  <HealthProfileProvider>
    <ForumProvider>
      <App />
    </ForumProvider>
  </HealthProfileProvider>
);
