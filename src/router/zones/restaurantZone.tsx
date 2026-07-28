/**
 * restaurantZone — the lazy route module for `/site/restaurant`.
 *
 * Phase 1 cleanup: the entire zone is wrapped in a single
 * `<GuardedPage allow="restaurant">` at the layout level.
 */

import type { RouteObject } from "react-router";
import { Outlet } from "react-router";
import { RestaurantZoneLayout } from "../../routes/site/restaurant/RestaurantZoneLayout";
import { RestaurantDashboardPage } from "../../routes/site/restaurant/RestaurantDashboardPage";
import { OrderListPage } from "../../routes/site/restaurant/orders/OrderListPage";
import { OrderNewPage } from "../../routes/site/restaurant/orders/OrderNewPage";
import { OrderDetailPage } from "../../routes/site/restaurant/orders/OrderDetailPage";
import { OrderSplitBillPage } from "../../routes/site/restaurant/orders/OrderSplitBillPage";
import { TablesPage } from "../../routes/site/restaurant/tables/TablesPage";
import { MenuPage } from "../../routes/site/restaurant/menu/MenuPage";
import { ReservationsPage } from "../../routes/site/restaurant/reservations/ReservationsPage";
import { QueuePage } from "../../routes/site/restaurant/queue/QueuePage";
import { FeedbackPage } from "../../routes/site/restaurant/feedback/FeedbackPage";
import { AnalyticsPage } from "../../routes/site/restaurant/analytics/AnalyticsPage";
import { GuardedPage } from "../../components/RouteGuards/GuardedPage";

const restaurantZone: RouteObject = {
  Component: () => (
    <GuardedPage allow="restaurant">
      <RestaurantZoneLayout />
    </GuardedPage>
  ),
  children: [
    { index: true, Component: RestaurantDashboardPage },
    {
      path: "orders",
      Component: () => <Outlet />,
      children: [
        { index: true, Component: OrderListPage },
        { path: "new", Component: OrderNewPage },
        { path: ":id", Component: OrderDetailPage },
        { path: ":id/split-bill", Component: OrderSplitBillPage },
      ],
    },
    {
      path: "tables",
      Component: () => <Outlet />,
      children: [{ index: true, Component: TablesPage }],
    },
    { path: "menu", Component: () => <Outlet />, children: [{ index: true, Component: MenuPage }] },
    {
      path: "reservations",
      Component: () => <Outlet />,
      children: [{ index: true, Component: ReservationsPage }],
    },
    {
      path: "queue",
      Component: () => <Outlet />,
      children: [{ index: true, Component: QueuePage }],
    },
    {
      path: "feedback",
      Component: () => <Outlet />,
      children: [{ index: true, Component: FeedbackPage }],
    },
    {
      path: "analytics",
      Component: () => <Outlet />,
      children: [{ index: true, Component: AnalyticsPage }],
    },
  ],
};

export default restaurantZone;
