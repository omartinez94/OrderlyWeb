/**
 * identityApi — auth + staff endpoints, fronted through YARP at
 * `${VITE_API_BASE_URL}/identity-api`.
 *
 * Endpoints:
 *   - login        POST   /auth/login          {email, password}
 *   - refresh      POST   /auth/refresh         (httpOnly cookie)
 *   - logout       POST   /auth/logout
 *   - currentUser  GET    /users/me
 *   - userRestaurants GET /users/me/restaurants (Phase 3: distinct
 *                     from catalog.getRestaurants — this is the
 *                     user-scoped list of restaurants the caller
 *                     has access to, not the global catalog)
 *   - listStaff    GET    /staff?restaurantId=
 *   - getStaff     GET    /staff/:id
 *   - createStaff  POST   /staff
 *   - updateStaff  PUT    /staff/:id
 *   - deactivateStaff POST /staff/:id/deactivate
 *
 * Phase 3 wires `login` / `refresh` to dispatch `setCredentials` on
 * the session slice via `onQueryStarted`.
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { dynamicBaseQuery } from "./base";
import { env } from "../../lib/env";
import { setCredentials, clearCredentials } from "../session/sessionSlice";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: number;
  user: {
    id: string;
    name: string;
    email: string;
    initials: string;
    isActive: boolean;
  };
  roles: readonly import("../../types/auth").Role[];
  permissions: readonly import("../../types/auth").Permission[];
}

export interface RestaurantSummary {
  id: string;
  name: string;
  role: "Owner" | "Manager" | "Staff";
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  roles: readonly import("../../types/auth").Role[];
  restaurantIds: readonly string[];
  active: boolean;
  brandId?: string;
  phone?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
}

export interface StaffRoleGrant {
  staffId: string;
  restaurantId: string;
  role: import("../../types/auth").Role;
  grantedAt: string;
  grantedBy: string;
}

export interface StaffAuditEntry {
  id: string;
  staffId: string;
  actorId: string;
  actorName: string;
  action:
    | "create"
    | "update"
    | "deactivate"
    | "reactivate"
    | "role-grant"
    | "role-revoke"
    | "restaurant-assign"
    | "restaurant-unassign";
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: string;
  reason?: string;
}

function transformAuthResponse(res: any): AuthResponse {
  // If the backend already returns the custom shape, use it:
  if (res.user && res.accessToken) return res as AuthResponse;

  // Otherwise, parse the OpenIddict shape:
  const token = res.id_token || res.access_token;
  if (!token) throw new Error("No token returned");

  let claims: any = {};
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    claims = JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT claims", e);
  }

  const roleClaim = claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
  const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];

  const name = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "";
  const email = claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "";

  return {
    accessToken: res.access_token,
    expiresAt: Date.now() + res.expires_in * 1000,
    user: {
      id:
        claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        claims.sub ||
        "",
      name,
      email,
      initials: name.substring(0, 2).toUpperCase(),
      isActive: true,
    },
    roles,
    permissions: [],
  };
}

export const identityApi = createApi({
  reducerPath: "identityApi",
  baseQuery: dynamicBaseQuery,
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/identity-api/connect/token`,
        method: "POST",
        body: new URLSearchParams({
          grant_type: "password",
          username: body.email,
          password: body.password,
          scope: "openid email profile offline_access",
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }),
      transformResponse: (res: any) => transformAuthResponse(res),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (err) {
          console.error("Login onQueryStarted failed:", err);
        }
      },
    }),
    refresh: build.mutation<AuthResponse, void>({
      query: () => ({
        url: `${env.apiBaseUrl}/identity-api/api/auth/refresh`,
        method: "POST",
      }),
      transformResponse: (res: any) => transformAuthResponse(res),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          dispatch(clearCredentials());
        }
      },
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: `${env.apiBaseUrl}/identity-api/api/auth/logout`,
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(clearCredentials());
      },
    }),
    currentUser: build.query<AuthResponse["user"], void>({
      query: () => `${env.apiBaseUrl}/identity-api/api/users/me`,
    }),
    userRestaurants: build.query<RestaurantSummary[], void>({
      query: () => `${env.apiBaseUrl}/identity-api/api/users/me/restaurants`,
      providesTags: ["Restaurants"],
    }),
    listStaff: build.query<StaffMember[], { restaurantId: string }>({
      query: ({ restaurantId }) =>
        `${env.apiBaseUrl}/identity-api/api/staff?restaurantId=${encodeURIComponent(restaurantId)}`,
      providesTags: (result, _err, { restaurantId }) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Staff" as const, id })),
              { type: "Staff" as const, id: `LIST-${restaurantId}` },
            ]
          : [{ type: "Staff" as const, id: `LIST-${restaurantId}` }],
    }),
    getStaff: build.query<StaffMember, string>({
      query: (id) => `${env.apiBaseUrl}/identity-api/api/staff/${encodeURIComponent(id)}`,
      providesTags: (_r, _e, id) => [{ type: "Staff", id }],
    }),
    createStaff: build.mutation<StaffMember, Omit<StaffMember, "id" | "active">>({
      query: (body) => ({
        url: `${env.apiBaseUrl}/identity-api/api/staff`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { restaurantIds }) =>
        restaurantIds.map((rid) => ({ type: "Staff" as const, id: `LIST-${rid}` })),
    }),
    updateStaff: build.mutation<StaffMember, Partial<StaffMember> & { id: string }>({
      query: ({ id, ...patch }) => ({
        url: `${env.apiBaseUrl}/identity-api/api/staff/${encodeURIComponent(id)}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Staff", id }],
    }),
    deactivateStaff: build.mutation<StaffMember, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/identity-api/api/staff/${encodeURIComponent(id)}/deactivate`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "Staff", id }],
    }),
    staffGrantsFor: build.query<StaffRoleGrant[], string>({
      query: (id) => `${env.apiBaseUrl}/identity-api/api/staff/${encodeURIComponent(id)}/grants`,
      providesTags: (_r, _e, id) => [{ type: "Staff", id: `GRANTS-${id}` }],
    }),
    reactivateStaff: build.mutation<StaffMember, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/identity-api/api/staff/${encodeURIComponent(id)}/reactivate`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, id) => [{ type: "Staff", id }],
    }),
    auditLogFor: build.query<StaffAuditEntry[], string>({
      query: (id) => `${env.apiBaseUrl}/identity-api/api/staff/${encodeURIComponent(id)}/audit`,
      providesTags: (_r, _e, id) => [{ type: "Staff", id: `AUDIT-${id}` }],
    }),
    resendInvitation: build.mutation<{ ok: true }, string>({
      query: (id) => ({
        url: `${env.apiBaseUrl}/identity-api/api/staff/invitations/${encodeURIComponent(id)}/resend`,
        method: "POST",
      }),
    }),
  }),
  tagTypes: ["Staff", "Restaurants"],
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useCurrentUserQuery,
  useUserRestaurantsQuery,
  useListStaffQuery,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useDeactivateStaffMutation,
  useStaffGrantsForQuery,
  useReactivateStaffMutation,
  useAuditLogForQuery,
  useResendInvitationMutation,
} = identityApi;
