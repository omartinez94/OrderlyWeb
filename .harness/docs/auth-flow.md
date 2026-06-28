# Auth Flow

JWT-based auth for the Orderly Admin Panel. Backend is the source of truth — see
[`docs/backend-architecture/architecture.md`](../backend-architecture/architecture.md) §1 (Identity Service, Port 5007)
for the full backend contract.

## Token model

| Token | Storage | TTL | Set by |
|---|---|---|---|
| Access (JWT) | Redux memory **only** | 15 min | `/api/auth/login` |
| Refresh | httpOnly cookie (browser-managed) | 7 days | `/api/auth/login` |

**Hard rule:** Never persist the access token to `localStorage`, `sessionStorage`,
IndexedDB, or anywhere JS can re-read it on reload. The refresh token is
intentionally unreachable to JS so a stored XSS payload can't escalate.

## Endpoints (Identity Service, via Ocelot gateway :5000)

```
POST   /api/auth/login           → { accessToken, user: { id, email, name, roles, permissions, restaurantId } }
POST   /api/auth/refresh         → { accessToken }  (browser sends httpOnly cookie automatically)
POST   /api/auth/logout          → 204              (revokes refresh token; clears cookie)
GET    /api/auth/me              → user             (rehydrate on page reload; falls back to /refresh)
```

## State machine

```
            ┌──────────┐  login()   ┌──────────────────┐
   idle ──▶ │ /login   │ ─────────▶ │ authenticated    │
            └──────────┘            │  - accessToken   │
                ▲                   │  - user          │
                │                   │  - isAuth=true   │
                │                   └────────┬─────────┘
                │                            │
                │       401 + refresh fails  │ 401 + refresh ok
                │       (or logout())        │ (silent retry)
                │            ▼               │     ▼
                │   ┌────────────────┐  ┌────┴───────────┐
                └── │ unauthenticated│  │ same request,  │
                    │  - clear slice │  │ new accessToken│
                    │  - redirect /  │  └────────────────┘
                    │    login       │
                    └────────────────┘
```

## 401 handling (the critical bit)

`src/lib/apiClient.ts` wraps the RTK Query `baseQuery` (or fetch base):

1. Original request fails with 401.
2. Single-flight refresh: a queued refresh promise ensures one in-flight
   `/api/auth/refresh` call even with N concurrent 401s.
3. On refresh success → store new access token → retry the original request
   with the new token.
4. On refresh failure (refresh token expired or revoked) → dispatch
   `authSlice.logout()` → clear `restaurantSlice` → navigate to `/login`.
5. Do **not** retry on 401 from the refresh endpoint itself (that's a logout).

## Page reload rehydration

On app start (before any route renders):

1. Try `GET /api/auth/me` with credentials (cookie attaches automatically).
2. If it returns 200 → decode user, populate `authSlice`, proceed.
3. If it returns 401 → try `POST /api/auth/refresh` (cookie attaches).
4. If refresh succeeds → set access token, retry `me`, populate.
5. If both fail → unauthenticated; render `/login`.

## Multi-restaurant context

The JWT carries `restaurantId` (the user's *default* restaurant). The full set
of restaurants the user can access is in `UserRestaurants` — fetch via
`GET /api/users/me/restaurants` after login. The active restaurant lives in
`features/restaurant/restaurantSlice.ts`, not in the auth slice; switching
restaurant does not invalidate the access token, but it **does** invalidate
the entire RTK Query cache for restaurant-scoped tags.

## Logout

1. Dispatch optimistic local clear: `authSlice.logout()`, `restaurantSlice.reset()`,
   `purge RTK Query cache`.
2. Fire `POST /api/auth/logout` (best-effort; ignore network errors).
3. Navigate to `/login`. Replace history so back-button doesn't restore the
   authenticated view.

## What backend-integrator owns vs reviews

- **Owns:** the `apiClient.ts` interceptor, `authSlice` shape, refresh flow, the
  rehydration sequence, SignalR connection lifecycle tied to auth state.
- **Reviews:** any new code path that reads or writes auth state, any new
  endpoint that touches tokens, any change to the login redirect logic.

## What code-reviewer gates

- Any new occurrence of `localStorage`, `sessionStorage`, or `document.cookie`
  in non-test code → reject with this doc as the citation.
- Any direct call to a backend service URL (port 5001–5007) in production code
  → reject; everything goes through `VITE_API_BASE_URL` (gateway).
- Any new top-level dep that handles auth/storage → flag for explicit user OK.