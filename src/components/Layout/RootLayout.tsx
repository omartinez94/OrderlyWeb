/**
 * RootLayout — the single mounted shell for the entire app.
 *
 * Owns the global providers and the `<Outlet />` for the active
 * route. Sits below the `RouterProvider` (which mounts the
 * `RootErrorBoundary` on render errors) and above every leaf.
 *
 * Mounts:
 *   - `useTheme()` — initializes the theme once.
 *   - `<TooltipProvider>` — single tooltip delay for the whole tree.
 *   - `<Suspense>` with `RouteLoadingShell` fallback — the lazy zone
 *     and showcase chunks stream under the same shared shell.
 *   - `<Toaster />` — Sonner toast surface.
 *   - `<SignInDialogHost />` — singleton owner of the sign-in dialog.
 *
 * No business logic lives here. The layout is the chrome; each
 * route renders its own body.
 */

import { Suspense } from "react";
import { Outlet } from "react-router";
import { TooltipProvider } from "../ui";
import { Toaster } from "../ui/sonner";
import { useTheme } from "../../hooks";
import { SignInDialogHost } from "../SignInDialog";
import { RouteLoadingShell } from "./RouteLoadingShell";

export function RootLayout(): React.ReactNode {
  useTheme();
  return (
    <TooltipProvider delayDuration={200}>
      <Suspense fallback={<RouteLoadingShell />}>
        <Outlet />
      </Suspense>
      <Toaster />
      <SignInDialogHost />
    </TooltipProvider>
  );
}
