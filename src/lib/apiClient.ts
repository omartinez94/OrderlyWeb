/**
 * apiClient — the shared fetch wrapper the entire data layer uses.
 *
 * Responsibilities:
 *
 * 1. **Auth header injection** — reads the access token from the
 *    Redux store via `store.getState().session.accessToken`. No
 *    `useSelector` in this file (it lives outside React).
 *
 * 2. **Unified 401 refresh** — on a 401 response, a single in-flight
 *    `refreshAccessToken()` Promise is shared by every concurrent
 *    caller (single-flight). The refresh call hits
 *    `${env.apiBaseUrl}/identity-api/auth/refresh`; the refresh
 *    token rides on an httpOnly cookie, so the browser sends it
 *    automatically. If the refresh succeeds, the new access token
 *    is stored in Redux and the original request is retried once.
 *    If the refresh fails, `session/clearCredentials` is dispatched
 *    and the original request fails with the 401.
 *
 * 3. **Reuse from RTK Query** — `app/api/base.ts` uses the same
 *    refresh helper via the `extraOptions.refreshAttempted` flag,
 *    so concurrent RTK Query calls share the same refresh promise
 *    (no token-rotation race).
 *
 * 4. **SignalR negotiation** — the same `Authorization` header
 *    shape is reused; the hub's negotiate endpoint also goes
 *    through the gateway.
 *
 * Why a single-flight refresh:
 *   - Without it, N concurrent 401s each fire their own /refresh
 *     round-trip. The refresh endpoint rotates the refresh cookie;
 *     the first call succeeds and rotates, the next N-1 calls then
 *     see a *new* refresh cookie they don't have, fail, and dump
 *     the user to the login screen.
 *
 * Why the token lives in Redux memory only:
 *   - Per AGENTS.md §Security, no `localStorage` / `sessionStorage`.
 *     The refresh token is an httpOnly cookie; only the access
 *     token is exposed to JS.
 */

import { env } from "./env";
import { store } from "../app/store";
import {
  setCredentials as setSessionCredentials,
  clearCredentials as clearSessionCredentials,
} from "../app/session/sessionSlice";
import i18n, { LANGUAGE_STORAGE_KEY, isSupportedLanguage } from "./i18n";
import type { Role } from "../types/auth";
import type { Permission } from "../types/auth";

/**
 * Access token shape stored in the session slice.
 */
export interface AccessToken {
  token: string;
  expiresAt: number;
  user: { id: string; name: string; email: string; initials: string };
  roles: readonly Role[];
  permissions: readonly Permission[];
}

import { refreshAccessToken, type RefreshResponse } from "./authRefresh";

/**
 * Reads the current access token from the store without going
 * through React. Returns `null` when the user is unauthenticated.
 */
function readAccessToken(): string | null {
  return store.getState().session.accessToken;
}

/**
 * Writes a new access token to the session slice. Direct dispatch;
 * no `useSelector` here (this lives outside React).
 */
function writeAccessToken(next: RefreshResponse): void {
  store.dispatch(
    setSessionCredentials({
      accessToken: next.accessToken,
      expiresAt: next.expiresAt,
      user: next.user,
      roles: next.roles,
      permissions: next.permissions,
    }),
  );
}

/**
 * Clears credentials on terminal auth failure.
 */
function clearCredentials(): void {
  store.dispatch(clearSessionCredentials());
}

/**
 * Resolves the active language for the `Accept-Language` header.
 * Reads i18next's current language (kept in sync with the detector),
 * falls back to `localStorage`, then to `"en"`.
 */
function resolveAcceptLanguage(): string {
  const fromI18n = i18n.language;
  if (isSupportedLanguage(fromI18n)) return fromI18n;
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isSupportedLanguage(stored)) return stored;
    } catch {
      // localStorage may be unavailable in private mode or SSR.
    }
  }
  return "en";
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  /** When true, skip the auth header. Used by the public /login endpoint. */
  skipAuth?: boolean;
  /** Internal: how many times this request has been retried after a 401. */
  _refreshAttempted?: boolean;
}

/**
 * Public entry point — issues a request to the Orderly API Gateway.
 * Adds `Authorization: Bearer <token>` when an access token is
 * present, performs a single-flight 401 refresh + retry, and
 * returns the parsed JSON or throws `ApiError`.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { method = "GET", body, headers, skipAuth, _refreshAttempted = false } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (!skipAuth) {
    const token = readAccessToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }
  // Inject the active locale so backend services can localise
  // domain data (item names, status labels, error messages). The
  // header is sourced from i18next first, then from localStorage,
  // then defaults to "en" — mirroring the detector order in
  // `src/lib/i18n.ts`. The pre-hydration script in `index.html`
  // has already set `<html lang>` before any of this code runs.
  finalHeaders["Accept-Language"] = resolveAcceptLanguage();

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  // 401 → single-flight refresh + retry.
  if (res.status === 401 && !_refreshAttempted && !skipAuth) {
    try {
      const json = await refreshAccessToken();
      writeAccessToken(json);
    } catch {
      clearCredentials();
      throw new ApiError(401, "Unauthorized");
    }
    return apiFetch<T>(path, { ...options, _refreshAttempted: true });
  }

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      parsed = undefined;
    }
    throw new ApiError(res.status, `HTTP ${res.status}`, parsed);
  }

  // 204 No Content — return undefined.
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
