/**
 * adminZone — the lazy route module for `/site/admin`. The module
 * exports a `RouteObject` that the parent `lazy:` resolves into
 * the router tree.
 *
 * Phase 3 wires every leaf route from `docs/website-spec.md` §4.1
 * to a `<ZoneSplash />` placeholder. The zone layout is
 * role-guarded via `RequireRole allow="admin"`.
 */

import type { RouteObject } from "react-router";
import { Outlet } from "react-router";
import { AdminZoneLayout } from "../../routes/site/admin/AdminZoneLayout";
import { AdminDashboardPage } from "../../routes/site/admin/AdminDashboardPage";
import { StaffListPage } from "../../routes/site/admin/staff/StaffListPage";
import { StaffNewPage } from "../../routes/site/admin/staff/StaffNewPage";
import { StaffDetailPage } from "../../routes/site/admin/staff/StaffDetailPage";
import { RestaurantListPage } from "../../routes/site/admin/restaurants/RestaurantListPage";
import { RestaurantDetailPage } from "../../routes/site/admin/restaurants/RestaurantDetailPage";
import { AdminSettingsPage } from "../../routes/site/admin/AdminSettingsPage";
import { RequireRole } from "../../components/RouteGuards/RequireRole";

const adminZone: RouteObject = {
  Component: AdminZoneLayout,
  children: [
    {
      index: true,
      Component: () => (
        <RequireRole allow="admin">
          <AdminDashboardPage />
        </RequireRole>
      ),
    },
    {
      path: "staff",
      Component: () => (
        <RequireRole allow="admin">
          <Outlet />
        </RequireRole>
      ),
      children: [
        { index: true, Component: StaffListPage },
        { path: "new", Component: StaffNewPage },
        { path: ":id", Component: StaffDetailPage },
      ],
    },
    {
      path: "restaurants",
      Component: () => (
        <RequireRole allow="admin">
          <Outlet />
        </RequireRole>
      ),
      children: [
        { index: true, Component: RestaurantListPage },
        { path: ":id", Component: RestaurantDetailPage },
      ],
    },
    {
      path: "settings",
      Component: () => (
        <RequireRole allow="admin">
          <Outlet />
        </RequireRole>
      ),
      children: [{ index: true, Component: AdminSettingsPage }],
    },
  ],
};

export default adminZone;
