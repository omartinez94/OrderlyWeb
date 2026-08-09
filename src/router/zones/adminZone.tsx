/**
 * Admin CRM route tree. The zone stays behind one role guard at the
 * layout boundary; leaf pages remain independently replaceable as
 * each CRM phase ships.
 */

import type { RouteObject } from "react-router";
import { Outlet } from "react-router";
import { AdminZoneLayout } from "../../routes/site/admin/AdminZoneLayout";
import { AdminDashboardPage } from "../../routes/site/admin/AdminDashboardPage";
import { AdminSettingsPage } from "../../routes/site/admin/AdminSettingsPage";
import { AdminUsersPage } from "../../routes/site/admin/AdminUsersPage";
import { AdminAuditPage } from "../../routes/site/admin/AdminAuditPage";
import { AdminRolesPage } from "../../routes/site/admin/AdminRolesPage";
import { BrandListPage } from "../../routes/site/admin/brands/BrandListPage";
import { BrandNewPage } from "../../routes/site/admin/brands/BrandNewPage";
import { BrandDetailPage } from "../../routes/site/admin/brands/BrandDetailPage";
import { BrandRestaurantsPage } from "../../routes/site/admin/brands/BrandRestaurantsPage";
import { BrandStaffPage } from "../../routes/site/admin/brands/BrandStaffPage";
import { BrandSettingsPage } from "../../routes/site/admin/brands/BrandSettingsPage";
import { BrandAuditPage } from "../../routes/site/admin/brands/BrandAuditPage";
import { StaffListPage } from "../../routes/site/admin/staff/StaffListPage";
import { StaffNewPage } from "../../routes/site/admin/staff/StaffNewPage";
import { StaffDetailPage } from "../../routes/site/admin/staff/StaffDetailPage";
import { RestaurantListPage } from "../../routes/site/admin/restaurants/RestaurantListPage";
import { RestaurantNewPage } from "../../routes/site/admin/restaurants/RestaurantNewPage";
import { RestaurantDetailPage } from "../../routes/site/admin/restaurants/RestaurantDetailPage";
import { RestaurantStaffPage } from "../../routes/site/admin/restaurants/RestaurantStaffPage";
import { RestaurantSettingsPage } from "../../routes/site/admin/restaurants/RestaurantSettingsPage";
import { RestaurantAuditPage } from "../../routes/site/admin/restaurants/RestaurantAuditPage";
import { GuardedPage } from "../../components/RouteGuards/GuardedPage";

function OutletPage() {
  return <Outlet />;
}

const adminZone: RouteObject = {
  Component: () => (
    <GuardedPage allow="admin">
      <AdminZoneLayout />
    </GuardedPage>
  ),
  children: [
    { index: true, Component: AdminDashboardPage },
    {
      path: "brands",
      Component: OutletPage,
      children: [
        { index: true, Component: BrandListPage },
        { path: "new", Component: BrandNewPage },
        {
          path: ":id",
          Component: OutletPage,
          children: [
            { index: true, Component: BrandDetailPage },
            { path: "restaurants", Component: BrandRestaurantsPage },
            { path: "staff", Component: BrandStaffPage },
            { path: "settings", Component: BrandSettingsPage },
            { path: "audit", Component: BrandAuditPage },
          ],
        },
      ],
    },
    {
      path: "restaurants",
      Component: OutletPage,
      children: [
        { index: true, Component: RestaurantListPage },
        { path: "new", Component: RestaurantNewPage },
        {
          path: ":id",
          Component: OutletPage,
          children: [
            { index: true, Component: RestaurantDetailPage },
            { path: "staff", Component: RestaurantStaffPage },
            { path: "settings", Component: RestaurantSettingsPage },
            { path: "audit", Component: RestaurantAuditPage },
          ],
        },
      ],
    },
    {
      path: "staff",
      Component: OutletPage,
      children: [
        { index: true, Component: StaffListPage },
        { path: "new", Component: StaffNewPage },
        { path: ":id", Component: StaffDetailPage },
      ],
    },
    { path: "users", Component: AdminUsersPage },
    { path: "audit", Component: AdminAuditPage },
    { path: "roles", Component: AdminRolesPage },
    {
      path: "settings",
      Component: OutletPage,
      children: [{ index: true, Component: AdminSettingsPage }],
    },
  ],
};

export default adminZone;
