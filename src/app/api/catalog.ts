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

import type {
  GetMenuItemAnalyticsParams,
  GetMenuItemAnalyticsResponse,
} from "../../types/analytics";

import type { GetCustomerFeedbackParams, GetCustomerFeedbackResponse } from "../../types/feedback";

export type * from "../../types/catalog";
export type * from "../../types/analytics";
export type * from "../../types/feedback";

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

interface BackendBrandDto {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  slug?: string;
  Slug?: string;
  description?: string | null;
  Description?: string | null;
  logoUrl?: string | null;
  LogoUrl?: string | null;
  contactEmail?: string;
  ContactEmail?: string;
  contactPhone?: string | null;
  ContactPhone?: string | null;
  cuisineType?: CuisineType | number | string;
  CuisineType?: CuisineType | number | string;
  websiteUrl?: string | null;
  WebsiteUrl?: string | null;
  active?: boolean;
  isActive?: boolean;
  IsActive?: boolean;
  createdAt?: unknown;
  CreatedAt?: unknown;
  updatedAt?: unknown;
  LastModifiedAt?: unknown;
}

interface BackendRestaurantDto {
  id?: string;
  Id?: string;
  name?: string;
  Name?: string;
  cuisine?: string;
  Cuisine?: string;
  city?: string;
  City?: string;
  country?: string;
  Country?: string;
  address?: string | AdminRestaurantAddress;
  Address?: string | AdminRestaurantAddress;
  active?: boolean;
  isActive?: boolean;
  IsActive?: boolean;
  brandId?: string;
  BrandId?: string;
  ownerId?: string | null;
  OwnerId?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  PhoneNumber?: string | null;
  email?: string | null;
  Email?: string | null;
  timezone?: string;
  timeZone?: string;
  TimeZone?: string;
  currency?: string;
  Currency?: string;
  taxRate?: number;
  TaxRate?: number;
  operatingHours?: OperatingHoursDay[];
  OperatingHours?: OperatingHoursDay[];
  estimatedTurnoverMinutes?: number;
  EstimatedTurnoverMinutes?: number;
  autoConfirmReservations?: boolean;
  AutoConfirmReservations?: boolean;
  autoConfirmOrders?: boolean;
  AutoConfirmOrders?: boolean;
  allowAutoSubstitute?: boolean;
  AllowAutoSubstitute?: boolean;
  status?: RestaurantStatus;
  Status?: RestaurantStatus;
  createdAt?: unknown;
  CreatedAt?: unknown;
  updatedAt?: unknown;
  LastModifiedAt?: unknown;
}

interface BackendBrandListEnvelope {
  brands?: BackendBrandDto[];
  Brands?: BackendBrandDto[];
}

interface BackendRestaurantListEnvelope {
  restaurants?: BackendRestaurantDto[];
  Restaurants?: BackendRestaurantDto[];
}

function parseCuisineType(val: unknown): CuisineType {
  if (typeof val === "string") {
    if (
      val === "Italian" ||
      val === "Mexican" ||
      val === "Japanese" ||
      val === "American" ||
      val === "Other"
    ) {
      return val;
    }
    return "Other";
  }
  if (typeof val === "number") {
    switch (val) {
      case 0:
        return "American";
      case 1:
        return "Italian";
      case 2:
        return "Mexican";
      default:
        return "Other";
    }
  }
  return "Other";
}

function normalizeBrand(b: BackendBrandDto): CatalogBrand {
  const name = b.name ?? b.Name ?? "";
  const rawCreated = b.createdAt ?? b.CreatedAt;
  const rawUpdated = b.updatedAt ?? b.LastModifiedAt;

  return {
    id: b.id ?? b.Id ?? "",
    name,
    slug: b.slug ?? b.Slug ?? name.toLowerCase().replace(/\s+/g, "-"),
    description: b.description ?? b.Description ?? null,
    logoUrl: b.logoUrl ?? b.LogoUrl ?? null,
    contactEmail: b.contactEmail ?? b.ContactEmail ?? "",
    contactPhone: b.contactPhone ?? b.ContactPhone ?? null,
    cuisineType: parseCuisineType(b.cuisineType ?? b.CuisineType),
    websiteUrl: b.websiteUrl ?? b.WebsiteUrl ?? null,
    active: b.active ?? b.isActive ?? b.IsActive ?? true,
    createdAt: typeof rawCreated === "string" ? rawCreated : new Date().toISOString(),
    updatedAt: typeof rawUpdated === "string" ? rawUpdated : new Date().toISOString(),
  };
}

function normalizeRestaurant(r: BackendRestaurantDto): CatalogRestaurant {
  const rawAddress =
    typeof r.address === "string" ? r.address : typeof r.Address === "string" ? r.Address : "";
  return {
    id: r.id ?? r.Id ?? "",
    name: r.name ?? r.Name ?? "",
    cuisine: r.cuisine ?? r.Cuisine ?? "General",
    city: r.city ?? r.City ?? rawAddress ?? "Unknown",
    country: r.country ?? r.Country ?? "MX",
    active: r.active ?? r.isActive ?? r.IsActive ?? true,
  };
}

function normalizeAdminRestaurant(r: BackendRestaurantDto): AdminRestaurantDetail {
  const base = normalizeRestaurant(r);
  const rawAddress = r.address ?? r.Address;
  const address: AdminRestaurantAddress =
    typeof rawAddress === "object" && rawAddress !== null
      ? (rawAddress as AdminRestaurantAddress)
      : {
          line1: typeof rawAddress === "string" ? rawAddress : "",
          line2: null,
          city: r.city ?? r.City ?? "",
          region: "",
          postalCode: "",
          country: r.country ?? r.Country ?? "MX",
        };

  const rawCreated = r.createdAt ?? r.CreatedAt;
  const rawUpdated = r.updatedAt ?? r.LastModifiedAt;
  const isActive = r.active ?? r.isActive ?? r.IsActive ?? true;

  return {
    ...base,
    brandId: r.brandId ?? r.BrandId ?? "",
    ownerId: r.ownerId ?? r.OwnerId ?? null,
    address,
    phone: r.phone ?? r.phoneNumber ?? r.PhoneNumber ?? null,
    email: r.email ?? r.Email ?? null,
    timezone: r.timezone ?? r.timeZone ?? r.TimeZone ?? "UTC",
    currency: r.currency ?? r.Currency ?? "MXN",
    taxRate: Number(r.taxRate ?? r.TaxRate ?? 0),
    operatingHours: r.operatingHours ?? r.OperatingHours ?? [],
    estimatedTurnoverMinutes: Number(
      r.estimatedTurnoverMinutes ?? r.EstimatedTurnoverMinutes ?? 30,
    ),
    autoConfirmReservations: Boolean(r.autoConfirmReservations ?? r.AutoConfirmReservations),
    autoConfirmOrders: Boolean(r.autoConfirmOrders ?? r.AutoConfirmOrders),
    allowAutoSubstitute: Boolean(r.allowAutoSubstitute ?? r.AllowAutoSubstitute),
    status: r.status ?? r.Status ?? (isActive ? "active" : "inactive"),
    createdAt: typeof rawCreated === "string" ? rawCreated : new Date().toISOString(),
    updatedAt: typeof rawUpdated === "string" ? rawUpdated : new Date().toISOString(),
  };
}

function unwrapBrand(response: unknown): BackendBrandDto {
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    if (r.brand && typeof r.brand === "object") return r.brand as BackendBrandDto;
    if (r.Brand && typeof r.Brand === "object") return r.Brand as BackendBrandDto;
  }
  return (response ?? {}) as BackendBrandDto;
}

function unwrapRestaurant(response: unknown): BackendRestaurantDto {
  if (response && typeof response === "object") {
    const r = response as Record<string, unknown>;
    if (r.restaurant && typeof r.restaurant === "object")
      return r.restaurant as BackendRestaurantDto;
    if (r.Restaurant && typeof r.Restaurant === "object")
      return r.Restaurant as BackendRestaurantDto;
  }
  return (response ?? {}) as BackendRestaurantDto;
}

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    getRestaurants: build.query<CatalogRestaurant[], void>({
      query: () => `${env.apiBaseUrl}/catalog-api/v1/restaurants`,
      transformResponse: (response: BackendRestaurantListEnvelope | BackendRestaurantDto[]) => {
        const rawList = Array.isArray(response)
          ? response
          : (response?.restaurants ?? response?.Restaurants ?? []);
        return rawList.map(normalizeRestaurant);
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Restaurants" as const, id })),
              { type: "Restaurants" as const, id: "LIST" },
            ]
          : [{ type: "Restaurants" as const, id: "LIST" }],
    }),

    getRestaurant: build.query<CatalogRestaurant, string>({
      query: (id) => `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => normalizeRestaurant(unwrapRestaurant(response)),
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
        return `${env.apiBaseUrl}/catalog-api/v1/brands${queryStr ? `?${queryStr}` : ""}`;
      },
      transformResponse: (response: BackendBrandListEnvelope | BackendBrandDto[]) => {
        const rawList = Array.isArray(response)
          ? response
          : (response?.brands ?? response?.Brands ?? []);
        return rawList.map(normalizeBrand);
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
      query: (id) => `${env.apiBaseUrl}/catalog-api/v1/brands/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) => normalizeBrand(unwrapBrand(response)),
      providesTags: (_r, _e, id) => [{ type: "Brands", id }],
    }),

    createBrand: build.mutation<CatalogBrand, CreateBrandRequest>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/brands`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) => normalizeBrand(unwrapBrand(response)),
      invalidatesTags: [{ type: "Brands", id: "LIST" }],
    }),

    updateBrand: build.mutation<CatalogBrand, UpdateBrandRequest>({
      query: ({ id, ...body }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/brands/${encodeURIComponent(id)}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) => normalizeBrand(unwrapBrand(response)),
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
      query: (id) => `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(id)}`,
      transformResponse: (response: unknown) =>
        normalizeAdminRestaurant(unwrapRestaurant(response)),
      providesTags: (_r, _e, id) => [{ type: "Restaurants", id }],
    }),

    createRestaurant: build.mutation<AdminRestaurantDetail, CreateRestaurantRequest>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants`,
        method: "POST",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeAdminRestaurant(unwrapRestaurant(response)),
      invalidatesTags: (_r, _e, { brandId }) => [
        { type: "Restaurants", id: "LIST" },
        { type: "Brands", id: brandId },
      ],
    }),

    updateRestaurant: build.mutation<AdminRestaurantDetail, UpdateRestaurantRequest>({
      query: ({ id, ...body }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(id)}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: unknown) =>
        normalizeAdminRestaurant(unwrapRestaurant(response)),
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

    // Operational Analytics (Phase 5: 1 & 2)
    getMenuItemAnalytics: build.query<GetMenuItemAnalyticsResponse, GetMenuItemAnalyticsParams>({
      query: ({ restaurantId, dateRange }) => ({
        url: `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(restaurantId)}/analytics/menu-items`,
        params: dateRange ? { dateRange } : undefined,
      }),
      providesTags: (_res, _err, { restaurantId }) => [
        { type: "Analytics", id: restaurantId },
        { type: "Analytics", id: "LIST" },
      ],
    }),

    // Customer Feedback & Reward Portal (Phase 5: 3)
    getCustomerFeedback: build.query<GetCustomerFeedbackResponse, GetCustomerFeedbackParams>({
      query: ({ restaurantId, ...params }) => {
        const qs = new URLSearchParams();
        if (params.minRating !== undefined) qs.set("minRating", String(params.minRating));
        if (params.maxRating !== undefined) qs.set("maxRating", String(params.maxRating));
        if (params.rewardRedeemed !== undefined)
          qs.set("rewardRedeemed", String(params.rewardRedeemed));
        if (params.from) qs.set("from", params.from);
        if (params.to) qs.set("to", params.to);
        if (params.pageIndex !== undefined) qs.set("pageIndex", String(params.pageIndex));
        if (params.pageSize !== undefined) qs.set("pageSize", String(params.pageSize));
        const queryStr = qs.toString();
        return `${env.apiBaseUrl}/catalog-api/v1/restaurants/${encodeURIComponent(
          restaurantId,
        )}/feedback${queryStr ? `?${queryStr}` : ""}`;
      },
      providesTags: (_res, _err, { restaurantId }) => [
        { type: "Feedback", id: restaurantId },
        { type: "Feedback", id: "LIST" },
      ],
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
    "Analytics",
    "Feedback",
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
  useGetMenuItemAnalyticsQuery,
  useGetCustomerFeedbackQuery,
} = catalogApi;
