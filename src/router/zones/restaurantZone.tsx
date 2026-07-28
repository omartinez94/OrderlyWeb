/**
 * restaurantZone — the lazy route module for `/site/restaurant`.
 * Role-guarded via `RequireRole allow="restaurant"`.
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
import { RequireRole } from "../../components/RouteGuards/RequireRole";

const restaurantZone: RouteObject = {
  Component: RestaurantZoneLayout,
  children: [
    {
      index: true,
      Component: () => (
        <RequireRole allow="restaurant">
          <RestaurantDashboardPage />
        </RequireRole>
      ),
    },
    {
      path: "orders",
      Component: () => (
        <RequireRole allow="restaurant">
          <Outlet />
        </RequireRole>
      ),
      children: [
        { index: true, Component: OrderListPage },
        { path: "new", Component: OrderNewPage },
        { path: ":id", Component: OrderDetailPage },
        { path: ":id/split-bill", Component: OrderSplitBillPage },
      ],
    },
    {
      path: "tables",
      Component: () => (
        <RequireRole allow="restaurant">
          <Outlet />
        </RequireRole>
      ),
      children: [{ index: true, Component: TablesPage }],
    },
    {
      path: "menu",
      Component: () => (
        <RequireRole allow="restaurant">
          <Outlet />
        </RequireRole>
      ),
      children: [{ index: true, Component: MenuPage }],
    },
    {
      path: "reservations",
      Component: () => (
        <RequireRole allow="restaurant">
          <Outlet />
        </RequireRole>
      ),
      children: [{ index: true, Component: ReservationsPage }],
    },
    {
      path: "queue",
      Component: () => (
        <RequireRole allow="restaurant">
          <Outlet />
        </RequireRole>
      ),
      children: [{ index: true, Component: QueuePage }],
    },
    {
      path: "feedback",
      Component: () => (
        <RequireRole allow="restaurant">
          <Outlet />
        </RequireRole>
      ),
      children: [{ index: true, Component: FeedbackPage }],
    },
    {
      path: "analytics",
      Component: () => (
        <RequireRole allow="restaurant">
          <Outlet />
        </RequireRole>
      ),
      children: [{ index: true, Component: AnalyticsPage }],
    },
  ],
};

export default restaurantZone;
