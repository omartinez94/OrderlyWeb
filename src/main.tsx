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
import { RouterProvider } from "react-router";
import { router } from "./router/router";
import { StorefrontProvider } from "./app/StorefrontProvider";

// Mount order (top-down):
//   1. StrictMode         — strict-mode double-invocation in dev
//   2. StorefrontProvider — Redux <Provider store={store}>
//   3. RouterProvider     — React Router v7
//   4. RootLayout         — first component the router mounts; owns
//                            theme, toaster, tooltip provider, dialog
//
// Phase 4 will additionally mount <SignalRBoot /> inside
// StorefrontProvider so it can subscribe to session state via
// selectors before opening the kitchen hub.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StorefrontProvider>
      <RouterProvider router={router} />
    </StorefrontProvider>
  </StrictMode>,
);
