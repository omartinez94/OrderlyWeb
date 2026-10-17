/**
 * kitchenApi — KDS REST endpoints.
 *
 * Aligned with .NET 10 Carter Minimal APIs at `/kitchen-api/v1/kitchen`.
 * Real-time updates arrive via SignalR (`/kitchen-api/hubs/kitchen`),
 * while this slice handles the REST queue snapshots and lifecycle state mutations.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";
import type { KitchenTicketDto, KitchenQueueResponse } from "../../types/kitchen";

export interface GetKitchenQueueParams {
  restaurantId?: string;
  stationId?: string;
  page?: number;
  pageSize?: number;
}

export interface CancelKitchenTicketRequest {
  id: string;
  reason: string;
}

export interface KitchenItemActionRequest {
  id: string;
  itemId: string;
}

export const kitchenApi = createApi({
  reducerPath: "kitchenApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    getKitchenQueue: build.query<KitchenQueueResponse, GetKitchenQueueParams | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.restaurantId) qs.set("restaurantId", params.restaurantId);
        if (params?.stationId) qs.set("stationId", params.stationId);
        if (params?.page !== undefined) qs.set("page", String(params.page));
        if (params?.pageSize !== undefined) qs.set("pageSize", String(params.pageSize));
        const queryStr = qs.toString();
        return `${env.apiBaseUrl}/kitchen-api/v1/kitchen/queue${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: (result, _e, params) => {
        const restaurantId = params?.restaurantId;
        const tickets = result?.data ?? [];
        return [
          ...tickets.map(({ id }) => ({ type: "KitchenQueue" as const, id })),
          { type: "KitchenQueue" as const, id: restaurantId ? `LIST-${restaurantId}` : "LIST" },
        ];
      },
    }),

    getTicketDetail: build.query<KitchenTicketDto, string>({
      query: (id) => `${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "KitchenQueue", id }],
    }),

    acceptOrder: build.mutation<void, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/${encodeURIComponent(id)}/accept`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "KitchenQueue", id },
        { type: "KitchenQueue", id: "LIST" },
      ],
    }),

    startItemPrep: build.mutation<void, KitchenItemActionRequest>({
      query: ({ id, itemId }) => ({
        url: `${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/${encodeURIComponent(
          id,
        )}/items/${encodeURIComponent(itemId)}/start`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "KitchenQueue", id }],
    }),

    markItemReady: build.mutation<void, KitchenItemActionRequest>({
      query: ({ id, itemId }) => ({
        url: `${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/${encodeURIComponent(
          id,
        )}/items/${encodeURIComponent(itemId)}/ready`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "KitchenQueue", id }],
    }),

    markTicketReady: build.mutation<void, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/${encodeURIComponent(id)}/mark-ready`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "KitchenQueue", id },
        { type: "KitchenQueue", id: "LIST" },
      ],
    }),

    bumpOrder: build.mutation<void, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/${encodeURIComponent(id)}/bump`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "KitchenQueue", id },
        { type: "KitchenQueue", id: "LIST" },
      ],
    }),

    recallOrder: build.mutation<void, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/${encodeURIComponent(id)}/recall`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "KitchenQueue", id },
        { type: "KitchenQueue", id: "LIST" },
      ],
    }),

    cancelTicket: build.mutation<void, CancelKitchenTicketRequest>({
      query: ({ id, reason }) => ({
        url: `${env.apiBaseUrl}/kitchen-api/v1/kitchen/tickets/${encodeURIComponent(id)}/cancel`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "KitchenQueue", id },
        { type: "KitchenQueue", id: "LIST" },
      ],
    }),
  }),
  tagTypes: ["KitchenQueue"],
});

export const {
  useGetKitchenQueueQuery,
  useGetTicketDetailQuery,
  useAcceptOrderMutation,
  useStartItemPrepMutation,
  useMarkItemReadyMutation,
  useMarkTicketReadyMutation,
  useBumpOrderMutation,
  useRecallOrderMutation,
  useCancelTicketMutation,
} = kitchenApi;
