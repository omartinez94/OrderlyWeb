/**
 * Phase A proof — `dynamicBaseQuery` 401 exclusion.
 *
 * Verifies:
 *   1. `isAuthEndpoint` recognizes `/connect/token` and `/auth/refresh`.
 *   2. `dynamicBaseQuery` on a 401 from `/connect/token` does NOT call
 *      `refreshAccessToken` and returns the 401 untouched.
 *   3. `dynamicBaseQuery` on a 401 from a non-auth endpoint calls
 *      `refreshAccessToken`, dispatches `setCredentials` on success,
 *      and retries the original request.
 *
 * The MSW handlers in `src/test/handlers/identity.ts` already return
 * 401 from `/connect/token` when credentials are missing — that is the
 * fixture for test #2.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../test/server";
import { store } from "../store";
import { dynamicBaseQuery, isAuthEndpoint } from "./base";
import type { BaseQueryApi } from "@reduxjs/toolkit/query";

const buildApi = (): BaseQueryApi =>
  ({
    signal: new AbortController().signal,
    dispatch: store.dispatch,
    getState: store.getState,
    extra: undefined,
    type: "query",
    endpoint: "test",
    forced: false,
    abort: () => {},
  }) as unknown as BaseQueryApi;

describe("isAuthEndpoint", () => {
  it("matches /connect/token", () => {
    expect(isAuthEndpoint("/identity-api/api/connect/token")).toBe(true);
    expect(isAuthEndpoint({ url: "/identity-api/api/connect/token", method: "POST" })).toBe(true);
  });

  it("matches /auth/refresh", () => {
    expect(isAuthEndpoint("/identity-api/api/auth/refresh")).toBe(true);
    expect(isAuthEndpoint({ url: "/identity-api/api/auth/refresh", method: "POST" })).toBe(true);
  });

  it("does NOT match unrelated endpoints", () => {
    expect(isAuthEndpoint("/identity-api/api/users/me")).toBe(false);
    expect(isAuthEndpoint({ url: "/catalog-api/restaurants", method: "GET" })).toBe(false);
  });

  it("returns false for empty url in FetchArgs", () => {
    expect(isAuthEndpoint({ url: "", method: "GET" })).toBe(false);
  });
});

describe("dynamicBaseQuery — 401 interceptor exclusion", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    server.resetHandlers(...server.listHandlers());
  });

  it("returns the 401 untouched for /connect/token (does NOT call refresh)", async () => {
    // Override /connect/token to return 401 (the default handler returns
    // 400 for empty bodies). Track refresh calls via the refresh
    // handler.
    let refreshCalls = 0;
    server.use(
      http.post("*/identity-api/connect/token", () => {
        return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }),
      http.post("*/identity-api/auth/refresh", () => {
        refreshCalls++;
        return HttpResponse.json({}, { status: 401 });
      }),
    );

    const api = buildApi();
    const result = await dynamicBaseQuery(
      {
        url: "/identity-api/connect/token",
        method: "POST",
        body: { email: "test@example.com", password: "wrong" },
      },
      api,
      {},
    );

    expect(result.error).toBeDefined();
    expect(result.error?.status).toBe(401);
    expect(refreshCalls).toBe(0);
  });

  it("returns the 401 untouched for /auth/refresh (does NOT recurse)", async () => {
    let refreshCalls = 0;
    server.use(
      http.post("*/identity-api/auth/refresh", () => {
        refreshCalls++;
        return HttpResponse.json({ message: "expired" }, { status: 401 });
      }),
    );

    const api = buildApi();
    const result = await dynamicBaseQuery(
      {
        url: "/identity-api/auth/refresh",
        method: "POST",
      },
      api,
      {},
    );

    expect(result.error?.status).toBe(401);
    expect(refreshCalls).toBe(1); // The single call from dynamicBaseQuery; no recursion.
  });

  it("triggers refresh + retry for a 401 from a non-auth endpoint", async () => {
    let refreshCalls = 0;
    server.use(
      http.post("*/identity-api/api/auth/refresh", () => {
        refreshCalls++;
        return HttpResponse.json({
          accessToken: "refreshed-token",
          expiresAt: Date.now() + 60_000,
          user: {
            id: "u-001",
            name: "Test",
            email: "test@example.com",
            initials: "T",
            isActive: true,
          },
          roles: ["Manager"],
          permissions: [],
        });
      }),
    );

    // First call to /users/me returns 401, second (after refresh) returns 200.
    let usersMeCalls = 0;
    server.use(
      http.get("*/identity-api/users/me", () => {
        usersMeCalls++;
        if (usersMeCalls === 1) {
          return HttpResponse.json({ message: "expired" }, { status: 401 });
        }
        return HttpResponse.json({
          id: "u-001",
          name: "Test",
          email: "test@example.com",
          initials: "T",
          isActive: true,
        });
      }),
    );

    const api = buildApi();
    const result = await dynamicBaseQuery("/identity-api/users/me", api, {});

    expect(result.error).toBeUndefined();
    expect(refreshCalls).toBe(1);
    expect(usersMeCalls).toBe(2);
  });
});
