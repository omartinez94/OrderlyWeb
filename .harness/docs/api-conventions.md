# API Conventions

How the Orderly Admin Panel frontend integrates with the Orderly Microservices
backend. Source of truth for the wire: [`docs/backend-architecture/architecture.md`](../backend-architecture/architecture.md).
Source of truth for the frontend-side mapping: [`docs/website-spec.md`](../website-spec.md) §7.

## Single base URL — the Ocelot gateway

`VITE_API_BASE_URL` (default `http://localhost:5000`). All RTK Query and
SignalR traffic goes through this. **No direct service calls** in production
code. Direct calls are debugging-only and must not ship.

## Service → frontend responsibility map

| Service | Port | Frontend API module | Notes |
|---|---|---|---|
| API Gateway (Ocelot) | 5000 | (all) | Single entry point |
| Identity | 5007 | `features/auth/authApi.ts` | Login, refresh, logout, users, roles |
| Catalog | 5001 | `features/menu/*`, `features/tables/*` | Restaurants, menu categories/items, tables, floor plan |
| Order | 5004 | `features/orders/ordersApi.ts` | Orders, reservations, queue, modifications, bill split |
| Basket | 5003 | `features/orders/basketApi.ts` | Price calc, checkout → creates order |
| Discount | 5002 | `features/discounts/*` | Promo/reward codes (post-MVP) |
| Kitchen | 5005 | `features/kds/kdsApi.ts` | KDS aggregation (post-MVP; MVP reads Order service) |
| Notification | 5006 | `features/notifications/*` | Push notifications, feedback (post-MVP) |

## RTK Query structure

One root `createApi` with `tagTypes` for each microservice boundary. Avoid
one-API-per-feature — that fragments the cache and makes invalidation fan-out
hard to reason about.

```ts
// src/app/store.ts (sketch)
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,  // includes 401 refresh
  tagTypes: ['User', 'Order', 'Menu', 'Table', 'Reservation', 'Queue', 'Feedback', 'Notification'],
  endpoints: (builder) => ({
    // injected from features/*/<name>Api.ts
  }),
});
```

Each `features/*/<name>Api.ts` calls `api.injectEndpoints({...})` to add its
endpoints. This keeps features cohesive while sharing a single cache.

## Tag-based invalidation

Tag every endpoint with the most specific tag the response carries. Mutations
declare which tags they invalidate:

```ts
getOrder: builder.query<Order, string>({
  query: (id) => `/api/orders/${id}`,
  providesTags: (_r, _e, id) => [{ type: 'Order', id }],
}),
updateOrderStatus: builder.mutation<void, { id: string; status: OrderStatus }>({
  query: ({ id, status }) => ({ url: `/api/orders/${id}/status`, method: 'PUT', body: { status } }),
  invalidatesTags: (_r, _e, { id }) => [{ type: 'Order', id }, 'Order'],
}),
```

## Query params — restaurant context

Anything scoped to a restaurant reads `restaurantId` from
`features/restaurant/restaurantSlice.ts` and injects as a query param:

```ts
getOrders: builder.query<Order[], void>({
  query: () => ({ url: '/api/orders', params: { restaurantId: selectActiveRestaurantId() } }),
  providesTags: ['Order'],
}),
```

Don't ask the user to type the restaurant ID. Don't read it from the URL
unless the user explicitly shared a deep link (in which case the TopBar
switcher stays in sync via the same slice).

## Error model

Backend returns RFC 7807 problem details. Map to a typed `ApiError` shape so
feature code can render predictably:

```ts
interface ApiError {
  status: number;
  code: string;        // backend error code, e.g. 'order_not_modifiable'
  message: string;     // user-safe message
  details?: unknown;   // field-level errors for forms
}
```

Surface validation errors (`details`) to React Hook Form via `setError`.
Surface everything else as a toast and a fallback UI state.

## SignalR

Hubs (URL: `VITE_SIGNALR_URL`, default `http://localhost:5000/hubs`):

| Hub | Path | Used by | Events |
|---|---|---|---|
| Orders | `/hubs/orders` | KDS, Order list, Order detail | `OrderCreated`, `OrderStatusChanged`, `OrderItemModified` |
| Notifications | `/hubs/notifications` | TopBar bell, Notification center | `NotificationReceived` |

Connection lifecycle is owned by `src/lib/signalr.ts`. Feature code never
imports `@microsoft/signalr` directly — it calls a typed wrapper
(`onOrderStatusChanged(handler)`).

Reconnect: exponential backoff (1s, 2s, 4s, 8s, 16s, capped at 30s). Surface
state via a typed `connectionState` (connected / reconnecting / disconnected)
that the TopBar status indicator reads.

## Auth integration

See `.harness/docs/auth-flow.md` for the full flow. Key points for the API
layer:

- `prepareHeaders` reads the access token from `authSlice` (memory only).
- 401 → single-flight refresh → retry → fallback to logout on refresh failure.
- Logout fires `POST /api/auth/logout` (best-effort) before clearing local state.

## What lives in the API layer vs feature code

| Concern | Layer |
|---|---|
| Endpoint definition, tags, base URL | `features/*/<name>Api.ts` |
| 401 refresh, header injection, error mapping | `src/lib/apiClient.ts` |
| DTO types | `src/types/api.d.ts` (or generated) |
| UI rendering, form handling, optimistic UX | feature `components/` |
| Test fixtures / MSW handlers | `src/test/msw/` (tester owns) |

## Don'ts

- Don't add a new `createApi` per feature. Use `injectEndpoints` on the root.
- Don't call services directly. Gateway only.
- Don't add `?` query strings by hand when the backend accepts a structured
  filter DTO — match the contract from `docs/backend-architecture/architecture.md`.
- Don't swallow errors silently. Surface them.
- Don't poll. If a SignalR event covers it, subscribe.