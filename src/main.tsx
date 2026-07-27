import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Variable webfonts — full weight axis (100-900) for each family. Importing
// the .css here means Vite bundles the woff2 files and ships them with the
// build, no third-party CDN at runtime. The font families are wired into
// the design system via --font-display / --font-body / --font-mono in
// src/index.css; components consume them through Tailwind utilities
// (font-display, font-sans, font-mono), never by name.
import "@fontsource-variable/museomoderno/wght.css";
import "@fontsource-variable/urbanist/wght.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
