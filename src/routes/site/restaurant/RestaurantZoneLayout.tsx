/**
 * RestaurantZoneLayout — the restaurant zone shell. The sidebar
 * items cover the restaurant routes from `docs/website-spec.md`
 * §4.1.
 *
 * The layout is role-guarded by `RequireRole allow="restaurant"`.
 */

import { ZoneShell } from "../../../components/Layout/ZoneShell";
import type { SidebarItem } from "../../../components/Layout/ZoneSidebar";

export const RESTAURANT_SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { to: "/site/restaurant", label: "Dashboard" },
  { to: "/site/restaurant/orders", label: "Orders", labelKey: "orders:list.title" },
  { to: "/site/restaurant/tables", label: "Tables", labelKey: "restaurant:tables.title" },
  { to: "/site/restaurant/menu", label: "Menu" },
  {
    to: "/site/restaurant/reservations",
    label: "Reservations",
    labelKey: "restaurant:reservations.title",
  },
  { to: "/site/restaurant/queue", label: "Queue" },
  { to: "/site/restaurant/feedback", label: "Feedback" },
  { to: "/site/restaurant/analytics", label: "Analytics" },
];

export function RestaurantZoneLayout() {
  return <ZoneShell zone="restaurant" items={RESTAURANT_SIDEBAR_ITEMS} />;
}
