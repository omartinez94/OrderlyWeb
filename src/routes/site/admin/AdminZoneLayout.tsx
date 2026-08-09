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
import { PATH } from "../../../router/pathNames";

export const ADMIN_SIDEBAR_ITEMS: readonly SidebarItem[] = [
  { to: PATH.ADMIN, label: "Dashboard", labelKey: "admin:dashboard.title" },
  { to: PATH.ADMIN_BRANDS, label: "Brands", labelKey: "admin:brands.title" },
  {
    to: PATH.ADMIN_RESTAURANTS,
    label: "Restaurants",
    labelKey: "admin:restaurants.title",
    roles: ["SuperAdmin"],
  },
  { to: PATH.ADMIN_STAFF, label: "Staff", labelKey: "admin:staff.title" },
  { to: PATH.ADMIN_AUDIT, label: "Audit", labelKey: "admin:audit.title" },
  { to: PATH.ADMIN_ROLES, label: "Roles", labelKey: "admin:roles.title", roles: ["SuperAdmin"] },
  {
    to: PATH.ADMIN_SETTINGS,
    label: "Settings",
    labelKey: "admin:settings.title",
    roles: ["SuperAdmin"],
  },
];

export function AdminZoneLayout() {
  return <ZoneShell zone="admin" items={ADMIN_SIDEBAR_ITEMS} />;
}
