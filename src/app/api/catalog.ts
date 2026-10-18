/**
 * catalogApi — restaurants, tables, merged tables, and menu.
 *
 * Aligned with .NET 10 Carter Minimal APIs at `/catalog-api/v1`.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";
import type {
  CatalogRestaurant,
  CatalogBrand,
  CuisineType,
  Table,
  MergedTableDto,
  MenuCategory,
  MenuItem,
  TableStatus,
  ReservationDto,
  ReservationStatus,
  QueuePartyDto,
  QueuePartyStatus,
  AuditEntityType,
  AdminAuditEntry,
  AdminRestaurantDetail,
  AdminRestaurantAddress,
  RestaurantStatus,
  OperatingHoursDay,
  AdminSettings,
} from "../../types/catalog";

export type * from "../../types/catalog";

export interface ListAuditParams {
  entityType?: AuditEntityType;
  entityId?: string;
  actorId?: string;
  since?: string;
  until?: string;
}

export interface ListBrandsParams {
  q?: string;
  active?: boolean;
}

export interface CreateBrandRequest {
  name: string;
  slug: string;
  description?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  cuisineType: CuisineType;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}

export interface UpdateBrandRequest {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  cuisineType: CuisineType;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}

export interface CreateRestaurantRequest {
  name: string;
  brandId: string;
  cuisine: string;
  ownerId?: string | null;
  address: AdminRestaurantAddress;
  phone?: string | null;
  email?: string | null;
  timezone: string;
  currency: string;
  taxRate: number;
  operatingHours: OperatingHoursDay[];
  estimatedTurnoverMinutes: number;
  autoConfirmReservations: boolean;
  autoConfirmOrders: boolean;
  allowAutoSubstitute: boolean;
  status: RestaurantStatus;
}

export interface UpdateRestaurantRequest extends CreateRestaurantRequest {
  id: string;
}

export interface GetTablesParams {
  restaurantId: string;
  status?: TableStatus;
  pageNumber?: number;
  pageSize?: number;
}

export interface GetTablesResponse {
  tables: Table[];
  totalCount: number;
}

export interface GetMergedTablesResponse {
  mergedTables: MergedTableDto[];
}

export interface MergeTablesRequest {
  restaurantId: string;
  parentTableId: string;
  childTableId: string;
}

export interface MergeTablesResponse {
  id: string;
}

export interface SplitTablesRequest {
  restaurantId: string;
  mergedTableId: string;
}

export interface UpdateMenuItemAvailabilityRequest {
  id: string;
  isAvailable: boolean;
  restaurantId?: string;
}

export interface UpdateTableStatusRequest {
  restaurantId: string;
  tableId: string;
  status: TableStatus;
}

export interface CreateReservationRequest {
  restaurantId: string;
  guestName: string;
  partySize: number;
  reservationTime: string;
  tableNumber?: string | null;
  tableId?: string | null;
  contactPhone?: string | null;
  specialRequests?: string | null;
}

export interface UpdateReservationStatusRequest {
  restaurantId: string;
  reservationId: string;
  status: ReservationStatus;
  tableNumber?: string | null;
  tableId?: string | null;
}

export interface AddToQueueRequest {
  restaurantId: string;
  guestName: string;
  partySize: number;
  phone: string;
  quotedWaitMinutes: number;
}

export interface UpdateQueueStatusRequest {
  restaurantId: string;
  partyId: string;
  status: QueuePartyStatus;
  allocatedTableId?: string | null;
  allocatedTableNumber?: string | null;
}

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    getRestaurants: build.query<CatalogRestaurant[], void>({
      query: () => `${env.apiBaseUrl}/catalog-api/restaurants`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Restaurants" as const, id })),
              { type: "Restaurants" as const, id: "LIST" },
            ]
          : [{ type: "Restaurants" as const, id: "LIST" }],
    }),

    getRestaurant: build.query<CatalogRestaurant, string>({
      query: (id) => `${env.apiBaseUrl}/catalog-api/restaurants/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "Restaurants", id }],
    }),

    getTables: build.query<Table[], GetTablesParams | { restaurantId: string }>({
      query: (params) => {
        const { restaurantId, ...rest } = params as GetTablesParams;
        const qs = new URLSearchParams();
        if (rest.status) qs.set("status", rest.status);
        if (rest.pageNumber !== undefined) qs.set("pageNumber", String(rest.pageNumber));
        if (rest.pageSize !== undefined) qs.set("pageSize", String(rest.pageSize));
        const queryStr = qs.toString();
        return `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/tables${queryStr ? `?${queryStr}` : ""}`;
      },
      transformResponse: (response: GetTablesResponse | Table[]) => {
        // Backend returns GetTablesResponse { tables: Table[], totalCount: number }, or raw array in mock
        if (Array.isArray(response)) return response;
        return response?.tables ?? [];
      },
      providesTags: (_r, _e, { restaurantId }) => [{ type: "Tables", id: `LIST-${restaurantId}` }],
    }),

    getMergedTables: build.query<MergedTableDto[], { restaurantId: string }>({
      query: ({ restaurantId }) =>
        `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/merged-tables`,
      transformResponse: (response: GetMergedTablesResponse | MergedTableDto[]) => {
        if (Array.isArray(response)) return response;
        return response?.mergedTables ?? [];
      },
      providesTags: (_r, _e, { restaurantId }) => [
        { type: "MergedTables", id: `LIST-${restaurantId}` },
      ],
    }),

    mergeTables: build.mutation<MergeTablesResponse, MergeTablesRequest>({
      query: ({ restaurantId, parentTableId, childTableId }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/merged-tables`,
        method: "POST",
        body: { parentTableId, childTableId },
      }),
      invalidatesTags: (_r, _e, { restaurantId }) => [
        { type: "Tables", id: `LIST-${restaurantId}` },
        { type: "MergedTables", id: `LIST-${restaurantId}` },
      ],
    }),

    splitTables: build.mutation<void, SplitTablesRequest>({
      query: ({ restaurantId, mergedTableId }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/merged-tables/${encodeURIComponent(mergedTableId)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { restaurantId }) => [
        { type: "Tables", id: `LIST-${restaurantId}` },
        { type: "MergedTables", id: `LIST-${restaurantId}` },
      ],
    }),

    getMenu: build.query<
      { categories: MenuCategory[]; items: MenuItem[] },
      { restaurantId: string }
    >({
      query: ({ restaurantId }) =>
        `${env.apiBaseUrl}/catalog-api/restaurants/${encodeURIComponent(restaurantId)}/menu`,
      providesTags: (_r, _e, { restaurantId }) => [
        { type: "Menu", id: `MENU-${restaurantId}` },
        { type: "Menu", id: "LIST" },
      ],
    }),

    updateMenuItemAvailability: build.mutation<void, UpdateMenuItemAvailabilityRequest>({
      query: ({ id, isAvailable }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/menu-items/${encodeURIComponent(id)}`,
        method: "PUT",
        body: { isAvailable },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Menu", id: "LIST" },
        ...(arg.restaurantId ? [{ type: "Menu" as const, id: `MENU-${arg.restaurantId}` }] : []),
      ],
      async onQueryStarted({ id, isAvailable, restaurantId }, { dispatch, queryFulfilled }) {
        let patchResult: { undo: () => void } | undefined;
        if (restaurantId) {
          patchResult = dispatch(
            catalogApi.util.updateQueryData("getMenu", { restaurantId }, (draft) => {
              const item = draft.items.find((i) => i.id === id);
              if (item) {
                item.status = isAvailable ? "available" : "sold_out";
              }
            }),
          );
        }
        try {
          await queryFulfilled;
        } catch {
          patchResult?.undo();
        }
      },
    }),

    updateTableStatus: build.mutation<void, UpdateTableStatusRequest>({
      query: ({ restaurantId, tableId, status }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/tables/${encodeURIComponent(tableId)}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_r, _e, { restaurantId }) => [
        { type: "Tables", id: `LIST-${restaurantId}` },
      ],
    }),

    getReservations: build.query<ReservationDto[], { restaurantId: string; date?: string }>({
      query: ({ restaurantId, date }) => {
        const qs = date ? `?date=${encodeURIComponent(date)}` : "";
        return `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/reservations${qs}`;
      },
      providesTags: (_r, _e, { restaurantId }) => [
        { type: "Reservations", id: `LIST-${restaurantId}` },
      ],
    }),

    createReservation: build.mutation<ReservationDto, CreateReservationRequest>({
      query: ({ restaurantId, ...body }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/reservations`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { restaurantId }) => [
        { type: "Reservations", id: `LIST-${restaurantId}` },
      ],
    }),

    updateReservationStatus: build.mutation<void, UpdateReservationStatusRequest>({
      query: ({ restaurantId, reservationId, ...body }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/reservations/${encodeURIComponent(reservationId)}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { restaurantId }) => [
        { type: "Reservations", id: `LIST-${restaurantId}` },
        { type: "Tables", id: `LIST-${restaurantId}` },
      ],
    }),

    getQueue: build.query<QueuePartyDto[], { restaurantId: string }>({
      query: ({ restaurantId }) =>
        `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(restaurantId)}/queue`,
      providesTags: (_r, _e, { restaurantId }) => [{ type: "Queue", id: `LIST-${restaurantId}` }],
    }),

    addToQueue: build.mutation<QueuePartyDto, AddToQueueRequest>({
      query: ({ restaurantId, ...body }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/queue`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { restaurantId }) => [
        { type: "Queue", id: `LIST-${restaurantId}` },
      ],
    }),

    updateQueueStatus: build.mutation<void, UpdateQueueStatusRequest>({
      query: ({ restaurantId, partyId, ...body }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/queue/${encodeURIComponent(partyId)}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { restaurantId }) => [
        { type: "Queue", id: `LIST-${restaurantId}` },
        { type: "Tables", id: `LIST-${restaurantId}` },
      ],
    }),

    // Brands CRUD (Phase 2)
    listBrands: build.query<CatalogBrand[], ListBrandsParams | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params && params.q) qs.set("q", params.q);
        if (params && params.active !== undefined) qs.set("active", String(params.active));
        const queryStr = qs.toString();
        return `${env.apiBaseUrl}/catalog-api/brands${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Brands" as const, id })),
              { type: "Brands" as const, id: "LIST" },
            ]
          : [{ type: "Brands" as const, id: "LIST" }],
    }),

    getBrand: build.query<CatalogBrand, string>({
      query: (id) => `${env.apiBaseUrl}/catalog-api/brands/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "Brands", id }],
    }),

    createBrand: build.mutation<CatalogBrand, CreateBrandRequest>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/catalog-api/brands`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Brands", id: "LIST" }],
    }),

    updateBrand: build.mutation<CatalogBrand, UpdateBrandRequest>({
      query: ({ id, ...body }) => ({
        url: `${env.apiBaseUrl}/catalog-api/brands/${encodeURIComponent(id)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Brands", id },
        { type: "Brands", id: "LIST" },
      ],
    }),

    archiveBrand: build.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/catalog-api/brands/${encodeURIComponent(id)}/archive`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Brands", id },
        { type: "Brands", id: "LIST" },
        { type: "Restaurants", id: "LIST" },
      ],
    }),

    // Generic Audit Endpoints (Phase 3)
    auditFor: build.query<AdminAuditEntry[], { entityType: AuditEntityType; entityId: string }>({
      query: ({ entityType, entityId }) =>
        `${env.apiBaseUrl}/catalog-api/audit/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
      providesTags: (_r, _e, { entityId }) => [{ type: "Audit", id: entityId }],
    }),

    listAudit: build.query<AdminAuditEntry[], ListAuditParams | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params && params.entityType) qs.set("entityType", params.entityType);
        if (params && params.entityId) qs.set("entityId", params.entityId);
        if (params && params.actorId) qs.set("actorId", params.actorId);
        if (params && params.since) qs.set("since", params.since);
        if (params && params.until) qs.set("until", params.until);
        const queryStr = qs.toString();
        return `${env.apiBaseUrl}/catalog-api/audit${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Audit" as const, id })),
              { type: "Audit" as const, id: "LIST" },
            ]
          : [{ type: "Audit" as const, id: "LIST" }],
    }),

    // Admin Restaurant Endpoints (Phase 5)
    getAdminRestaurant: build.query<AdminRestaurantDetail, string>({
      query: (id) => `${env.apiBaseUrl}/catalog-api/restaurants/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "Restaurants", id }],
    }),

    createRestaurant: build.mutation<AdminRestaurantDetail, CreateRestaurantRequest>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/catalog-api/restaurants`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { brandId }) => [
        { type: "Restaurants", id: "LIST" },
        { type: "Brands", id: brandId },
      ],
    }),

    updateRestaurant: build.mutation<AdminRestaurantDetail, UpdateRestaurantRequest>({
      query: ({ id, ...body }) => ({
        url: `${env.apiBaseUrl}/catalog-api/restaurants/${encodeURIComponent(id)}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { id, brandId }) => [
        { type: "Restaurants", id },
        { type: "Restaurants", id: "LIST" },
        { type: "Brands", id: brandId },
      ],
    }),

    archiveRestaurant: build.mutation<{ success: boolean }, { id: string; brandId?: string }>({
      query: ({ id }) => ({
        url: `${env.apiBaseUrl}/catalog-api/restaurants/${encodeURIComponent(id)}/archive`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { id, brandId }) => [
        { type: "Restaurants", id },
        { type: "Restaurants", id: "LIST" },
        ...(brandId ? [{ type: "Brands" as const, id: brandId }] : []),
      ],
    }),

    // Global Admin Settings Endpoints (Phase 6)
    getAdminSettings: build.query<AdminSettings, void>({
      query: () => `${env.apiBaseUrl}/catalog-api/settings`,
      providesTags: [{ type: "AdminSettings", id: "GLOBAL" }],
    }),

    updateAdminSettings: build.mutation<AdminSettings, AdminSettings>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/catalog-api/settings`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "AdminSettings", id: "GLOBAL" }],
    }),
  }),
  tagTypes: [
    "Restaurants",
    "Tables",
    "MergedTables",
    "Menu",
    "Brands",
    "AdminSettings",
    "Audit",
    "Reservations",
    "Queue",
  ],
});

export const {
  useGetRestaurantsQuery,
  useGetRestaurantQuery,
  useGetAdminRestaurantQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useArchiveRestaurantMutation,
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
  useGetTablesQuery,
  useGetMergedTablesQuery,
  useMergeTablesMutation,
  useSplitTablesMutation,
  useGetMenuQuery,
  useUpdateMenuItemAvailabilityMutation,
  useUpdateTableStatusMutation,
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationStatusMutation,
  useGetQueueQuery,
  useAddToQueueMutation,
  useUpdateQueueStatusMutation,
  useListBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useArchiveBrandMutation,
  useAuditForQuery,
  useListAuditQuery,
} = catalogApi;
