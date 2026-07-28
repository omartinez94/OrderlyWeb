/**
 * showcaseRoute — the lazy route module for `/showcase`. Wraps
 * `ShowcasePage` in the same shared `Suspense` boundary mounted by
 * `RootLayout`.
 */

import type { RouteObject } from "react-router";
import { lazy } from "react";
import { RouteLoadingShell } from "../../components/Layout/RouteLoadingShell";

const ShowcasePage = lazy(() => import("../../routes/ShowcasePage").then((m) => ({ default: m.ShowcasePage })));

export const showcaseRoute: RouteObject = {
  path: "showcase",
  Component: () => (
    <RouteLoadingShell />
  ),
  // The actual page is rendered by the parent <Suspense>.
  // Lazy load resolves on first hit; on subsequent navigations the
  // chunk is already in memory.
};

void ShowcasePage;
export default showcaseRoute;
