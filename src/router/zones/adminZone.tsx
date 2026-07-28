/**
 * adminZone — the lazy route module for `/site/admin`. The module
 * exports a `RouteObject` that the parent `lazy:` resolves into
 * the router tree.
 *
 * Phase 1 cleanup: the entire zone is wrapped in a single
 * `<GuardedPage allow="admin">` at the layout level instead of
 * wrapping each leaf in an inline
 * `Component: () => (<RequireRole>...</RequireRole>)`. This removes
 * the React DevTools "inline component re-mount" warning that fires
 * when guards re-evaluate.
 *
 * Phase 3 wires every leaf route from `docs/website-spec.md` §4.1
 * to a `<ZoneSplash />` placeholder. Each leaf still renders its
 * own page; the role check happens once at the layout boundary.
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
import { GuardedPage } from "../../components/RouteGuards/GuardedPage";

const adminZone: RouteObject = {
  Component: () => (
    <GuardedPage allow="admin">
      <AdminZoneLayout />
    </GuardedPage>
  ),
  children: [
    { index: true, Component: AdminDashboardPage },
    {
      path: "staff",
      Component: () => <Outlet />,
      children: [
        { index: true, Component: StaffListPage },
        { path: "new", Component: StaffNewPage },
        { path: ":id", Component: StaffDetailPage },
      ],
    },
    {
      path: "restaurants",
      Component: () => <Outlet />,
      children: [
        { index: true, Component: RestaurantListPage },
        { path: ":id", Component: RestaurantDetailPage },
      ],
    },
    {
      path: "settings",
      Component: () => <Outlet />,
      children: [{ index: true, Component: AdminSettingsPage }],
    },
  ],
};

export default adminZone;
