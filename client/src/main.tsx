// Import reflect-metadata first
import "reflect-metadata";

// React Core
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Global Styles
import "./index.css";

// App Entry
import App from "./App.tsx";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <App />
  </StrictMode>
);
