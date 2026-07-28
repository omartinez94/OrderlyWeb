/**
 * ZoneShell — the shared chrome for every zone layout. Owns the
 * `bg-surface` background, the top bar, the sidebar slot, and the
 * main content area. The active route is rendered into the main
 * area via `<Outlet />`.
 *
 * Phase 1 cleanup: the inner `<Suspense>` boundary was dropped. The
 * root-level `<Suspense>` in `RootLayout` already covers lazy zone
 * chunks under `RouteLoadingShell`. Nesting another `<Suspense>`
 * with the same fallback caused a "fallback swap flicker" when the
 * zone chunk arrived — React replaced the loading shell with itself.
 *
 * Each zone layout (`AdminZoneLayout`, `KitchenZoneLayout`,
 * `RestaurantZoneLayout`) supplies its own sidebar items and
 * zone label; the shell is the pure presentational chassis.
 */

import { Outlet } from "react-router";
import { ZoneTopBar } from "./ZoneTopBar";
import { ZoneSidebar, type SidebarItem } from "./ZoneSidebar";
import type { Zone } from "../Header/types";

export function ZoneShell({ zone, items }: { zone: Zone; items: readonly SidebarItem[] }) {
  return (
    <div className="bg-surface text-ink min-h-screen font-sans antialiased">
      <ZoneTopBar zone={zone} />
      <div className="grid grid-cols-[auto_1fr]">
        <ZoneSidebar items={items} />
        <main id="main" className="bg-surface min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
