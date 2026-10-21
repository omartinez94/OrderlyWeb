/**
 * RestaurantZoneLayout — the restaurant zone shell. The sidebar
 * items cover the restaurant routes from `docs/website-spec.md`
 * §4.1.
 *
 * The layout is role-guarded by `RequireRole allow="restaurant"`.
 */

import {
  LayoutDashboard,
  ReceiptText,
  Grid3X3,
  UtensilsCrossed,
  CalendarCheck,
  Clock,
  MessageSquareQuote,
  TrendingUp,
} from "lucide-react";
import { ZoneShell } from "../../../components/Layout/ZoneShell";
import type { SidebarItem } from "../../../components/Layout/ZoneSidebar";

export const RESTAURANT_SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { to: "/site/restaurant", label: "Dashboard", icon: LayoutDashboard },
  {
    to: "/site/restaurant/orders",
    label: "Orders",
    labelKey: "orders:list.title",
    icon: ReceiptText,
  },
  {
    to: "/site/restaurant/tables",
    label: "Tables",
    labelKey: "restaurant:tables.title",
    icon: Grid3X3,
  },
  { to: "/site/restaurant/menu", label: "Menu", icon: UtensilsCrossed },
  {
    to: "/site/restaurant/reservations",
    label: "Reservations",
    labelKey: "restaurant:reservations.title",
    icon: CalendarCheck,
  },
  { to: "/site/restaurant/queue", label: "Queue", icon: Clock },
  { to: "/site/restaurant/feedback", label: "Feedback", icon: MessageSquareQuote },
  { to: "/site/restaurant/analytics", label: "Analytics", icon: TrendingUp },
];

export function RestaurantZoneLayout() {
  return <ZoneShell zone="restaurant" items={RESTAURANT_SIDEBAR_ITEMS} />;
}
