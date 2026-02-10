import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";  // relative path to App.tsx
import "./style.css";

const container = document.getElementById("app");
if (!container) throw new Error("No #app element found");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
