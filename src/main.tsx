import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Register service worker for PWA
registerSW({
  onNeedRefresh() {
    if (confirm("A new version is available. Reload to update?")) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log("App is ready for offline use.");
  },
});

createRoot(document.getElementById("root")!).render(<App />);
