/**
 * KitchenZoneLayout — the kitchen zone shell. The sidebar items
 * cover the kitchen routes from `docs/website-spec.md` §4.1.
 *
 * The layout is role-guarded by `RequireRole allow="kitchen"`.
 * The kitchen KDS is full-screen on large touch displays, but the
 * shell renders identically to the other zones in MVP — the
 * dedicated full-screen styling lands with the KDS feature.
 */

import { ZoneShell } from "../../../components/Layout/ZoneShell";
import type { SidebarItem } from "../../../components/Layout/ZoneSidebar";

export const KITCHEN_SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { to: "/site/kitchen", label: "Order queue", labelKey: "kds:queue.title" },
  { to: "/site/kitchen/settings", label: "Settings" },
];

export function KitchenZoneLayout() {
  return <ZoneShell zone="kitchen" items={KITCHEN_SIDEBAR_ITEMS} />;
}
