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
// Side-effect import: i18next + react-i18next initialise synchronously
// here so the `<I18nextProvider>` below receives a fully wired `i18n`
// instance. The pre-hydration script in `index.html` has already set
// `<html lang>` before this module runs.
import "./lib/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import { RouterProvider } from "react-router";
import { router } from "./router/router";
import { StorefrontProvider } from "./app/StorefrontProvider";

// Mount order (top-down):
//   1. StrictMode         — strict-mode double-invocation in dev
//   2. StorefrontProvider — Redux <Provider store={store}>
//   3. I18nextProvider    — supplies `useTranslation()` everywhere
//   4. RouterProvider     — React Router v7
//   5. RootLayout         — first component the router mounts; owns
//                            theme, toaster, tooltip provider, dialog
//
// Phase 4 will additionally mount <SignalRBoot /> inside
// StorefrontProvider so it can subscribe to session state via
// selectors before opening the kitchen hub.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StorefrontProvider>
      <I18nextProvider i18n={i18n} defaultNS="common">
        <RouterProvider router={router} />
      </I18nextProvider>
    </StorefrontProvider>
  </StrictMode>,
);
