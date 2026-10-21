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
import {
  KitchenTicketStatus,
  KitchenItemStatus,
  type KitchenTicketDto,
  type KitchenTicketItemDto,
  type KitchenQueueResponse,
} from "../../types/kitchen";

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

function mapTicketStatus(status: unknown): KitchenTicketStatus {
  if (status === 0 || status === "0" || status === KitchenTicketStatus.New) {
    return KitchenTicketStatus.New;
  }
  if (status === 1 || status === "1" || status === KitchenTicketStatus.InProgress) {
    return KitchenTicketStatus.InProgress;
  }
  if (status === 2 || status === "2" || status === KitchenTicketStatus.Ready) {
    return KitchenTicketStatus.Ready;
  }
  if (status === 3 || status === "3" || status === KitchenTicketStatus.Bumped) {
    return KitchenTicketStatus.Bumped;
  }
  if (status === 4 || status === "4" || status === KitchenTicketStatus.Cancelled) {
    return KitchenTicketStatus.Cancelled;
  }
  return KitchenTicketStatus.New;
}

function mapItemStatus(status: unknown): KitchenItemStatus {
  if (status === 0 || status === "0" || status === KitchenItemStatus.Pending) {
    return KitchenItemStatus.Pending;
  }
  if (status === 1 || status === "1" || status === KitchenItemStatus.Preparing) {
    return KitchenItemStatus.Preparing;
  }
  if (status === 2 || status === "2" || status === KitchenItemStatus.Ready) {
    return KitchenItemStatus.Ready;
  }
  return KitchenItemStatus.Pending;
}

function normalizeKitchenItem(i: Record<string, unknown>): KitchenTicketItemDto {
  return {
    id: String(i.id ?? i.Id ?? ""),
    orderItemId: String(i.orderItemId ?? i.OrderItemId ?? ""),
    menuItemId: String(i.menuItemId ?? i.MenuItemId ?? ""),
    menuItemName: String(i.menuItemName ?? i.MenuItemName ?? "Item"),
    quantity: Number(i.quantity ?? i.Quantity ?? 1),
    unitPrice: Number(i.unitPrice ?? i.UnitPrice ?? 0),
    selectedVariations: (i.selectedVariations ?? i.SelectedVariations ?? []) as string[],
    customizations: (i.customizations ?? i.Customizations ?? []) as string[],
    specialInstructions: (i.specialInstructions ?? i.SpecialInstructions ?? null) as string | null,
    seatNumber: (i.seatNumber ?? i.SeatNumber ?? null) as number | null,
    status: mapItemStatus(i.status ?? i.Status),
    startedAt:
      typeof (i.startedAt ?? i.StartedAt) === "string" ? String(i.startedAt ?? i.StartedAt) : null,
    readyAt: typeof (i.readyAt ?? i.ReadyAt) === "string" ? String(i.readyAt ?? i.ReadyAt) : null,
    stationId: (i.stationId ?? i.StationId ?? null) as string | null,
  };
}

export function normalizeKitchenTicket(t: Record<string, unknown>): KitchenTicketDto {
  const rawReceivedAt = t.receivedAt ?? t.ReceivedAt;
  const receivedAt = typeof rawReceivedAt === "string" ? rawReceivedAt : new Date().toISOString();
  const rawItems = (t.items ?? t.Items ?? []) as Record<string, unknown>[];
  return {
    id: String(t.id ?? t.Id ?? ""),
    restaurantId: String(t.restaurantId ?? t.RestaurantId ?? ""),
    customerId: String(t.customerId ?? t.CustomerId ?? ""),
    orderNumber: String(t.orderNumber ?? t.OrderNumber ?? ""),
    status: mapTicketStatus(t.status ?? t.Status),
    receivedAt,
    startedAt:
      typeof (t.startedAt ?? t.StartedAt) === "string" ? String(t.startedAt ?? t.StartedAt) : null,
    readyAt: typeof (t.readyAt ?? t.ReadyAt) === "string" ? String(t.readyAt ?? t.ReadyAt) : null,
    bumpedAt:
      typeof (t.bumpedAt ?? t.BumpedAt) === "string" ? String(t.bumpedAt ?? t.BumpedAt) : null,
    cancelledAt:
      typeof (t.cancelledAt ?? t.CancelledAt) === "string"
        ? String(t.cancelledAt ?? t.CancelledAt)
        : null,
    cancellationReason: (t.cancellationReason ?? t.CancellationReason ?? null) as string | null,
    confirmedByUserId: (t.confirmedByUserId ?? t.ConfirmedByUserId ?? null) as string | null,
    cancelledByUserId: (t.cancelledByUserId ?? t.CancelledByUserId ?? null) as string | null,
    notes: String(t.notes ?? t.Notes ?? ""),
    estimatedPrepTimeMinutes: Number(
      t.estimatedPrepTimeMinutes ?? t.EstimatedPrepTimeMinutes ?? 15,
    ),
    items: Array.isArray(rawItems) ? rawItems.map(normalizeKitchenItem) : [],
  };
}

export function normalizeKitchenQueueResponse(response: unknown): KitchenQueueResponse {
  if (!response || typeof response !== "object") {
    return { pageIndex: 1, pageSize: 50, count: 0, data: [] };
  }
  const r = response as Record<string, unknown>;
  const rawData = (r.data ?? r.Data ?? (Array.isArray(response) ? response : [])) as Record<
    string,
    unknown
  >[];
  const pageIndex = Number(r.pageIndex ?? r.PageIndex ?? 1);
  const pageSize = Number(r.pageSize ?? r.PageSize ?? 50);
  const count = Number(r.count ?? r.Count ?? (Array.isArray(rawData) ? rawData.length : 0));

  return {
    pageIndex,
    pageSize,
    count,
    data: Array.isArray(rawData) ? rawData.map(normalizeKitchenTicket) : [],
  };
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
      transformResponse: (response: unknown) => normalizeKitchenQueueResponse(response),
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
      transformResponse: (response: unknown) =>
        normalizeKitchenTicket(response as Record<string, unknown>),
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
