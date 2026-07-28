/**
 * MSW handlers for the Identity Service.
 *
 * These intercept calls to `http://localhost:6004/identity-api/*`
 * during Vitest runs (and any future Playwright setup that boots
 * the same worker). The handlers return realistic shape — the
 * tests assert against the response body, not the mock internals.
 */

import { http, HttpResponse } from "msw";

const BASE = "http://localhost:6004/identity-api";

export const identityHandlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return HttpResponse.json({ message: "Missing credentials" }, { status: 400 });
    }
    return HttpResponse.json({
      accessToken: "test-access-token",
      expiresAt: Date.now() + 15 * 60 * 1000,
      user: {
        id: "u-001",
        name: "Test User",
        email: body.email,
        initials: "TU",
      },
      roles: ["Manager"],
      permissions: [],
    });
  }),

  http.post(`${BASE}/auth/refresh`, () =>
    HttpResponse.json({
      accessToken: "test-access-token-refreshed",
      expiresAt: Date.now() + 15 * 60 * 1000,
      user: {
        id: "u-001",
        name: "Test User",
        email: "test@example.com",
        initials: "TU",
      },
      roles: ["Manager"],
      permissions: [],
    }),
  ),

  http.post(`${BASE}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.get(`${BASE}/users/me`, () =>
    HttpResponse.json({
      id: "u-001",
      name: "Test User",
      email: "test@example.com",
      initials: "TU",
    }),
  ),

  http.get(`${BASE}/users/me/restaurants`, () =>
    HttpResponse.json([
      { id: "r-001", name: "Acme Bistro — Downtown", role: "Owner" },
      { id: "r-002", name: "Acme Bistro — Marina", role: "Manager" },
    ]),
  ),

  http.post(`${BASE}/staff`, async ({ request }) => {
    const body = (await request.json()) as Partial<{
      name: string;
      email: string;
      roles: string[];
      restaurantIds: string[];
    }>;
    // Phase 1: server-side authorization check (per the
    // staff-management plan §6.2). A non-SuperAdmin trying to
    // grant SuperAdmin gets 403. In dev/test the actor's roles
    // come from the X-Test-Actor-Roles header (MSW-only); when
    // absent we treat it as SuperAdmin so the default Vitest flow
    // succeeds.
    const actorRolesHeader = request.headers.get("x-test-actor-roles") ?? "SuperAdmin";
    const actorRoles = actorRolesHeader.split(",").map((r) => r.trim());
    if (body.roles?.includes("SuperAdmin") && !actorRoles.includes("SuperAdmin")) {
      return HttpResponse.json(
        { code: "STAFF_GRANT_FORBIDDEN", message: "Only SuperAdmin can grant SuperAdmin." },
        { status: 403 },
      );
    }
    return HttpResponse.json({
      id: "staff-new",
      name: body.name ?? "",
      email: body.email ?? "",
      roles: body.roles ?? [],
      restaurantIds: body.restaurantIds ?? [],
      active: true,
    });
  }),

  http.get(`${BASE}/staff`, () =>
    HttpResponse.json([
      {
        id: "s-001",
        name: "Maya Okafor",
        email: "maya@acme.co",
        roles: ["Manager"],
        restaurantIds: ["r-001"],
        active: true,
      },
      {
        id: "s-002",
        name: "Diego Castro",
        email: "diego@acme.co",
        roles: ["Waiter"],
        restaurantIds: ["r-001"],
        active: true,
      },
    ]),
  ),

  http.get(`${BASE}/staff/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      name: "Maya Okafor",
      email: "maya@acme.co",
      roles: ["Manager"],
      restaurantIds: ["r-001"],
      active: true,
    }),
  ),
];
