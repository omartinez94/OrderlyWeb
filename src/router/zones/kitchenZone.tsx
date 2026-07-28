/**
 * kitchenZone — the lazy route module for `/site/kitchen`.
 *
 * Phase 1 cleanup: the entire zone is wrapped in a single
 * `<GuardedPage allow="kitchen">` at the layout level. Replaces
 * the per-leaf `<RequireRole>` wrappers that triggered the
 * "inline component re-mount" warning.
 */

import type { RouteObject } from "react-router";
import { KitchenZoneLayout } from "../../routes/site/kitchen/KitchenZoneLayout";
import { KitchenDashboardPage } from "../../routes/site/kitchen/KitchenDashboardPage";
import { KitchenOrderDetailPage } from "../../routes/site/kitchen/order/KitchenOrderDetailPage";
import { KitchenSettingsPage } from "../../routes/site/kitchen/KitchenSettingsPage";
import { GuardedPage } from "../../components/RouteGuards/GuardedPage";

const kitchenZone: RouteObject = {
  Component: () => (
    <GuardedPage allow="kitchen">
      <KitchenZoneLayout />
    </GuardedPage>
  ),
  children: [
    { index: true, Component: KitchenDashboardPage },
    { path: "order/:id", Component: KitchenOrderDetailPage },
    { path: "settings", Component: KitchenSettingsPage },
  ],
};

export default kitchenZone;
