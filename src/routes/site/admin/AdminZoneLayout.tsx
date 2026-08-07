/**
 * AdminZoneLayout — the admin zone shell. The sidebar items here
 * map to the spec's `/site/admin` routes in `docs/website-spec.md`
 * §4.1. Items are filtered by role via `ZoneSidebar`.
 *
 * The layout is role-guarded by `RequireRole allow="admin"`. The
 * guard renders `<ForbiddenPage />` for users whose roles do not
 * include any of `admin`'s allow-list.
 *
 * Labels carry `labelKey` translation keys; the literal `label`
 * fallback mirrors the English value so the sidebar reads correctly
 * if a translation is missing in development.
 */

import { ZoneShell } from "../../../components/Layout/ZoneShell";
import type { SidebarItem } from "../../../components/Layout/ZoneSidebar";

export const ADMIN_SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { to: "/site/admin", label: "Dashboard", labelKey: "admin:tabs.members" },
  { to: "/site/admin/staff", label: "Staff", labelKey: "admin:staff.title" },
  { to: "/site/admin/restaurants", label: "Restaurants", roles: ["SuperAdmin"] },
  { to: "/site/admin/settings", label: "Settings", roles: ["SuperAdmin"] },
];

export function AdminZoneLayout() {
  return <ZoneShell zone="admin" items={ADMIN_SIDEBAR_ITEMS} />;
}
