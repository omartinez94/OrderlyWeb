/**
 * kitchenApi — KDS aggregation endpoints. The live updates arrive
 * via SignalR (`/kitchen-api/hubs/kitchen`); this slice holds the
 * REST snapshot used when the page first mounts.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";
import type { OrderStatus } from "../../types/order";

export interface KitchenQueueItem {
  orderId: string;
  tableId: string;
  tableLabel: string;
  status: OrderStatus;
  items: Array<{ id: string; name: string; station: string; qty: number }>;
  receivedAt: string;
  elapsedSeconds: number;
}

export const kitchenApi = createApi({
  reducerPath: "kitchenApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    getKitchenQueue: build.query<KitchenQueueItem[], { restaurantId: string }>({
      query: ({ restaurantId }) =>
        `${env.apiBaseUrl}/kitchen-api/kds/${encodeURIComponent(restaurantId)}/queue`,
      providesTags: (_r, _e, { restaurantId }) => [
        { type: "KitchenQueue", id: `LIST-${restaurantId}` },
      ],
    }),
    bumpOrder: build.mutation<KitchenQueueItem, { id: string; nextStatus: OrderStatus }>({
      query: ({ id, nextStatus }) => ({
        url: `${env.apiBaseUrl}/kitchen-api/kds/orders/${encodeURIComponent(id)}/bump`,
        method: "POST",
        body: { nextStatus },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "KitchenQueue", id }],
    }),
  }),
  tagTypes: ["KitchenQueue"],
});

export const { useGetKitchenQueueQuery, useBumpOrderMutation } = kitchenApi;
