
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Initial theme (no flash): read localStorage or system preference
(() => {
  try {
    const stored = localStorage.getItem("theme"); // "light" | "dark"
    const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (systemDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch {}
})();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
