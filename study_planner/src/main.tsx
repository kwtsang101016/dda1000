import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  const base = import.meta.env.BASE_URL;
  void navigator.serviceWorker.register(`${base}sw.js`).catch(() => {
    /* optional — install still works via browser menu */
  });
}

const root = document.getElementById("app");
if (!root) {
  throw new Error("Root element #app not found");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
