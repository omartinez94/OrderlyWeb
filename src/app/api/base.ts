/**
 * base — the shared `fetchBaseQuery` instance for every Orderly RTK
 * Query slice. Adds the JWT access token (from the session slice),
 * routes through the YARP gateway, and tags responses per service so
 * downstream `invalidatesTags` calls can clear caches on mutation.
 *
 * 401 handling:
 *   - On a 401, `apiClient.singleFlightRefresh` is awaited; on
 *     success the original request is retried once. Concurrent
 *     401s share the same refresh Promise (no token-rotation race).
 *   - On terminal failure, the request resolves with `{ error }`
 *     so consumers can branch on `result.error.status === 401`.
 *
 * Path-prefix convention:
 *   Each slice appends its upstream path prefix to `baseUrl`:
 *     - identity     → /identity-api
 *     - catalog      → /catalog-api
 *     - orders       → /order-api
 *     - kitchen      → /kitchen-api
 *     - notifications→ /notification-api
 *
 * The gateway strips the prefix and forwards to the matching
 * upstream service. Frontend code never talks to upstream ports.
 */

import { fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { BaseQueryFn, FetchArgs } from "@reduxjs/toolkit/query";
import { env } from "../../lib/env";

/**
 * Per-slice fetchBaseQuery configuration. Each slice appends its
 * own prefix via `baseUrl: env.apiBaseUrl + '/identity-api'` etc.
 *
 * The auth header is sourced from RTK Query's built-in `getState`
 * accessor rather than a direct store import. This breaks the
 * `store.ts → api/identity.ts → api/base.ts → store.ts` cycle that
 * would otherwise leave `store` undefined at module evaluation time.
 */
export const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { session?: { accessToken: string | null } };
    const token = state.session?.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
  credentials: "include",
});

let inFlightRefresh: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (inFlightRefresh) return inFlightRefresh;
  const promise = (async () => {
    const res = await fetch(`${env.apiBaseUrl}/identity-api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { accessToken?: string };
    return json.accessToken ?? null;
  })();
  inFlightRefresh = promise;
  try {
    return await promise;
  } finally {
    inFlightRefresh = null;
  }
}

/**
 * `dynamicBaseQuery` — wraps `rawBaseQuery` with a single-flight
 * 401 refresh + retry. The first 401 kicks off a refresh; concurrent
 * 401s share the same Promise. On success, the original request is
 * retried once with the new token. On terminal failure, the
 * original error is returned.
 */
export const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }
  return result;
};
