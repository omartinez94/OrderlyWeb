/**
 * Router entry — the single `createBrowserRouter` instance for the
 * app. The route tree is the source of truth for the URL surface.
 *
 * Phase 3 layout:
 *   - `/`         → RootRedirect (default-zone by role, or legacy
 *                   `?showcase=1` redirect to `/showcase`).
 *   - `/home`     → HomePage (the marketing landing).
 *   - `/login`    → LoginPage (placeholder; auth plan replaces).
 *   - `/profile`  → ProfilePage (placeholder; auth plan replaces).
 *   - `/showcase` → lazy-loaded ShowcasePage.
 *   - `/site/admin/*`     → admin zone (lazy chunk).
 *   - `/site/kitchen/*`   → kitchen zone (lazy chunk).
 *   - `/site/restaurant/*`→ restaurant zone (lazy chunk).
 *   - `*`         → NotFoundPage.
 *
 * The legacy `?showcase=1` URL is preserved by `RootRedirect`,
 * which inspects `window.location.search` once on mount and
 * navigates to `/showcase` with `replace: true` when the flag is
 * present. The home page itself never sees the search param.
 *
 * Why zone modules are statically imported:
 *   - React Router v7's `lazy` route function does not accept a
 *     `children` property. Returning one is silently ignored. The
 *     zone modules are tiny (the routes are mostly placeholders),
 *     so a static import is the cleanest path. The showcase is
 *     kept lazy because it pulls in every UI primitive.
 *
 * Tests should import `routes` from this module and feed it to
 * `createMemoryRouter(routes)` directly.
 */

import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { RootLayout } from "../components/Layout/RootLayout";
import { RootErrorBoundary } from "../components/Layout/RootErrorBoundary";
import { RootRedirect } from "../components/Layout/RootRedirect";
import { RouteLoadingShell } from "../components/Layout/RouteLoadingShell";
import { HomePage } from "../routes/HomePage";
import { NotFoundPage } from "../routes/NotFoundPage";
import { ForbiddenPage } from "../routes/ForbiddenPage";
import { LoginPage } from "../routes/LoginPage";
import { PATH } from "./pathNames";
import adminZone from "./zones/adminZone";
import kitchenZone from "./zones/kitchenZone";
import restaurantZone from "./zones/restaurantZone";

const ShowcasePage = lazy(() =>
  import("../routes/ShowcasePage").then((m) => ({ default: m.ShowcasePage })),
);

export const routes = [
  {
    Component: RootLayout,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        Component: RootRedirect,
      },
      {
        path: PATH.HOME,
        Component: HomePage,
      },
      {
        path: PATH.LOGIN,
        Component: LoginPage,
      },
      {
        path: PATH.PROFILE,
        Component: () => (
          <main className="bg-surface text-ink min-h-screen font-sans antialiased">
            <div className="mx-auto max-w-3xl px-5 py-24">
              <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">
                Profile
              </p>
              <h1 className="text-primary font-display text-4xl font-bold tracking-tight">
                Read-only profile
              </h1>
              <p className="text-ink-muted mt-4 font-sans text-base leading-relaxed">
                The full profile view ships with the auth slice.
              </p>
            </div>
          </main>
        ),
      },
      {
        path: PATH.SHOWCASE,
        Component: () => (
          <Suspense fallback={<RouteLoadingShell />}>
            <ShowcasePage />
          </Suspense>
        ),
      },
      { ...adminZone, path: PATH.ADMIN.slice(1) },
      { ...kitchenZone, path: PATH.KITCHEN.slice(1) },
      { ...restaurantZone, path: PATH.RESTAURANT.slice(1) },
      { path: PATH.NOT_FOUND, Component: NotFoundPage },
    ],
  },
];

void ForbiddenPage;

export const router = createBrowserRouter(routes as Parameters<typeof createBrowserRouter>[0]);
