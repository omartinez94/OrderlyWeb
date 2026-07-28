/**
 * kitchenZone — the lazy route module for `/site/kitchen`.
 * Role-guarded via `RequireRole allow="kitchen"`.
 */

import type { RouteObject } from "react-router";
import { KitchenZoneLayout } from "../../routes/site/kitchen/KitchenZoneLayout";
import { KitchenDashboardPage } from "../../routes/site/kitchen/KitchenDashboardPage";
import { KitchenOrderDetailPage } from "../../routes/site/kitchen/order/KitchenOrderDetailPage";
import { KitchenSettingsPage } from "../../routes/site/kitchen/KitchenSettingsPage";
import { RequireRole } from "../../components/RouteGuards/RequireRole";

const kitchenZone: RouteObject = {
  Component: KitchenZoneLayout,
  children: [
    {
      index: true,
      Component: () => (
        <RequireRole allow="kitchen">
          <KitchenDashboardPage />
        </RequireRole>
      ),
    },
    {
      path: "order/:id",
      Component: () => (
        <RequireRole allow="kitchen">
          <KitchenOrderDetailPage />
        </RequireRole>
      ),
    },
    {
      path: "settings",
      Component: () => (
        <RequireRole allow="kitchen">
          <KitchenSettingsPage />
        </RequireRole>
      ),
    },
  ],
};

export default kitchenZone;
