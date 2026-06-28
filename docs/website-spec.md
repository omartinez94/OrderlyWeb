# Orderly Admin Panel — Website Specification

> **Version:** 1.1
> **Last Updated:** 2026-06-27
> **Status:** Draft

---

## 1. Overview

**Orderly Admin Panel** is a unified, role-based web application for restaurant operators to manage their day-to-day operations. It is the frontend companion to the [Orderly Microservices backend](./architecture/architecture.md).

**Type:** Staff-facing admin panel (internal tool for restaurant employees)
**Target Users:** SuperAdmin, RestaurantAdmin, Manager, KitchenManager, Waiter, KitchenStaff, Host, Cashier
**Not:** A customer-facing portal (reservations, public menus, and customer-facing flows are out of scope for MVP)

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (latest) with TypeScript |
| State & Data Fetching | Redux Toolkit + RTK Query |
| Routing | React Router v6 |
| UI Components | HeadlessUI + TailwindCSS |
| Real-time | SignalR Client (`@microsoft/signalr`) |
| Forms | React Hook Form |
| Charts | Recharts |
| Drag & Drop | React DnD |
| Package Manager | pnpm |
| Build Tool | Vite |

**Auth Tokens:**
- Access token stored in memory (not localStorage) for API calls
- Refresh token stored in httpOnly cookie
- Auto-refresh on access token expiry
- All auth flows go through the backend Identity Service (Port 5007)

---

## 3. MVP Scope

### 3.1 Phase 1 — MVP Modules

| Module | Description |
|---|---|
| **Staff Management** | CRUD for users, role assignment, multi-restaurant access, permissions |
| **Orders** | Create, view, modify, split bills, track status, modification approval workflow |

### 3.2 Future Modules (post-MVP)

- Menu Management, Kitchen Display (KDS), Table & Floor Plan, Reservations, Walk-in Queue, Reports & Analytics, Customer Feedback, Settings

---

## 4. Application Structure

### 4.1 Pages & Routes

The app is organized into three top-level zones, each with its own sidebar navigation:

```
/login                        → Login page (no auth required)
                            
─── /site/admin ──────────────────────────────────────────────────────────────
    Admin-level management: staff, settings, multi-restaurant oversight.
    
    /site/admin                   → Admin dashboard (role summary, quick actions)
    /site/admin/staff             → Staff/user list
    /site/admin/staff/new         → Create staff member
    /site/admin/staff/:id         → Staff detail + role/permission editor
    /site/admin/restaurants       → Restaurant list (SuperAdmin only)
    /site/admin/restaurants/:id   → Restaurant settings
    /site/admin/settings          → Global platform settings (SuperAdmin)

─── /site/kitchen ────────────────────────────────────────────────────────────
    Kitchen Display System — full-screen, high-contrast, optimized for large 
    monitors and touch input in a busy kitchen environment.
    
    /site/kitchen                   → KDS main board (real-time order queue)
    /site/kitchen/order/:id         → Order prep detail (mark items ready)
    /site/kitchen/settings          → KDS config (alert sounds, refresh rate)

─── /site/restaurant ─────────────────────────────────────────────────────────
    Restaurant-level operations: orders, tables, menu, reservations, queue,
    feedback, analytics. Accessible to anyone assigned to that restaurant.
    
    /site/restaurant                → Restaurant dashboard (today's overview)
    /site/restaurant/orders         → Order list with filters
    /site/restaurant/orders/new     → Create new order
    /site/restaurant/orders/:id     → Order detail + modification panel
    /site/restaurant/orders/:id/split-bill  → Bill splitting view
    /site/restaurant/tables         → Table & floor plan management
    /site/restaurant/menu           → Menu management (categories, items, ingredients)
    /site/restaurant/reservations   → Reservations list + calendar view
    /site/restaurant/queue          → Walk-in queue management
    /site/restaurant/feedback       → Customer feedback & rewards
    /site/restaurant/analytics      → Reports & analytics dashboards

─── / ───────────────────────────────────────────────────────────────────────
    Root redirects authenticated users to their default zone based on role:
      - KitchenStaff / KitchenManager → /site/kitchen
      - Waiter / Cashier / Host       → /site/restaurant
      - Manager / RestaurantAdmin     → /site/restaurant
      - SuperAdmin                    → /site/admin
```

> **Note:** All routes inside the three zones require authentication. Unauthenticated requests redirect to `/login`. Role-based route guards enforce access per the permission table below.

### 4.2 Navigation

Each zone has its own **dedicated sidebar** — the sidebar changes completely when switching zones. A **global top bar** (restaurant switcher + user menu) remains present across all zones.

**Top Bar** (all zones):
- Restaurant name + switcher dropdown (left)
- Zone indicator breadcrumb
- Notifications bell (future)
- User avatar + dropdown: Profile, Logout (right)

**Zone Sidebars:**

| Zone | Sidebar Items |
|---|---|
| `/site/admin` | Dashboard, Staff, Restaurants (SuperAdmin), Settings (SuperAdmin) |
| `/site/kitchen` | Dashboard, Order Queue, Settings |
| `/site/restaurant` | Dashboard, Orders, Tables, Menu, Reservations, Queue, Feedback, Analytics |

### 4.3 Role-Based Zone Access

| Role | `/site/admin` | `/site/kitchen` | `/site/restaurant` |
|---|---|---|---|
| SuperAdmin | ✅ full | — | ✅ |
| RestaurantAdmin | ✅ full | — | ✅ |
| Manager | — | — | ✅ |
| KitchenManager | — | ✅ | ✅ |
| Waiter | — | — | ✅ |
| KitchenStaff | — | ✅ | — |
| Host | — | — | ✅ |
| Cashier | — | — | ✅ |

> `/site/admin/staff` is also visible to `Manager` and `RestaurantAdmin` (view-only for Manager). See full permission naming convention in [architecture.md](./architecture/architecture.md#jwt-token-structure)

---

## 5. Module Specifications

### 5.1 Authentication

**Login Flow:**
1. User submits email + password to `/api/auth/login` (Identity Service)
2. Backend returns access token (JWT, 15-min TTL) + sets httpOnly refresh token cookie
3. Frontend decodes JWT, extracts `roles`, `permissions`, `restaurantId`
4. User redirected to `/dashboard`
5. RTK Query attaches access token to all API requests
6. On 401 response, auto-refresh via `/api/auth/refresh`

**Logout:**
- Call `/api/auth/logout` (revoke refresh token)
- Clear in-memory access token
- Clear httpOnly cookie
- Redirect to `/login`

**Session Persistence:**
- Access token lives in memory only (lost on page refresh → auto-refresh)
- Keep user logged in as long as refresh token cookie is valid (7 days)

---

### 5.2 Multi-Restaurant Switching

- Top bar contains a restaurant switcher (dropdown)
- Shows all restaurants the user has access to (from `UserRestaurants` via JWT claims)
- Switching restaurant reloads all RTK Query cache and resets context
- Selected restaurant ID stored in Redux + URL query param (`?restaurantId=xxx`) for shareability
- If user has access to only one restaurant, switcher is hidden (no switching needed)

---

### 5.3 Staff Management Module

**User List (`/staff`):**
- Table with columns: Name, Email, Role, Status (Active/Inactive), Last Login
- Filters: role, status, search by name/email
- Pagination
- Actions: View, Edit, Deactivate (no hard delete per business rules)

**Create Staff (`/staff/new`):**
- Form fields: First Name, Last Name, Email, Phone, Role (dropdown), Restaurant(s) assignment
- Password set by admin (backend generates temp password or admin sets it)
- Validation: email uniqueness, required fields

**Edit Staff (`/staff/:id`):**
- Same form as create, pre-filled
- Role change triggers permission cache invalidation (backend publishes event)
- Can reassign to different restaurants

**Role Assignment:**
- Roles from Identity Service: `SuperAdmin`, `RestaurantAdmin`, `Manager`, `KitchenManager`, `Waiter`, `KitchenStaff`, `Host`, `Cashier`
- Permissions auto-derived from role (not manually assignable in MVP)
- Multi-restaurant assignment for managers/admins

---

### 5.4 Orders Module

**Order List (`/orders`):**
- Real-time updates via SignalR (new orders, status changes)
- Filters: status (multi-select), order type (dine-in/takeout/delivery), table, date range
- Search by order number or customer name
- Columns: Order #, Type, Table, Status, Total, Created, Created By
- Color-coded status badges (matching KDS logic: 🟢 🟡 🔴)
- Sortable columns

**Order Detail (`/orders/:id`):**
- Order header: Order #, Type, Table, Status, Timestamps (created, confirmed, prepared, etc.)
- Order items list: item name, quantity, variations, customizations, seat number, prep status
- Price breakdown: subtotal, tax, discount, total
- Modification log (who changed what, when)
- Actions based on status + user role:
  - Ordering/Pending: Add items, remove items, change quantities
  - Confirmed/Preparing: Modify items (manager+ only)
  - Ready: Request modification (triggers approval flow, reverts to Preparing)
  - Delivered/Completed: No actions

**Create Order (`/orders/new`):**
- Step 1: Select order type (dine-in, takeout, delivery)
- Step 2: Select table (for dine-in) or enter delivery address
- Step 3: Add menu items from restaurant's menu (fetched from Catalog Service)
  - Item card: image, name, price, variations selector
  - Quantity, customizations per item
- Step 4: Review and submit
- Basket state managed in Redux (calls Basket Service for price calculation)

**Bill Splitting (`/orders/:id/split-bill`):**
- Equal split: enter number of ways
- Custom split: enter amount per person
- Visual seat assignment: assign items to seat numbers
- Validation: sum of all bills must equal order total
- Payment status per bill (pending/paid/void)

**Real-time Kitchen Display:**
- SignalR pushes `OrderStatusChanged` events
- Auto-refresh order list on new events
- Sound notification (optional, browser Audio API) for new orders and overdue orders
- Connection status indicator (connected/reconnecting/disconnected)

---

## 6. Layout & Visual Design

### 6.1 Shell Layout

```
┌─────────────────────────────────────────────────────┐
│  Top Bar: [Logo] [Restaurant Switcher] [User Menu]  │
├───────────┬─────────────────────────────────────────┤
│           │                                         │
│  Sidebar  │         Main Content Area               │
│  (nav)    │                                         │
│           │                                         │
└───────────┴─────────────────────────────────────────┘
```

### 6.2 Sidebar

- Collapsible (icon-only mode)
- Items grouped by section with icons
- Active state highlighted
- Role-filtered visibility

### 6.3 Top Bar

- Restaurant name + switcher (left)
- Notifications bell (future)
- User avatar + dropdown: Profile, Logout (right)

### 6.4 Status Color Coding

| Status | Color | Usage |
|---|---|---|
| ordering, pending | Blue | New / unconfirmed |
| confirmed | Orange | Confirmed, waiting for prep |
| preparing | Yellow | In kitchen |
| ready | Green | Ready to serve/deliver |
| delivered | Teal | Sent out |
| completed | Gray | Done |
| cancelled | Red | Cancelled |
| on_hold | Purple | Hold |

### 6.5 Kitchen Time Indicators

| Condition | Color | Meaning |
|---|---|---|
| `orderAge < prepTime × 0.8` | 🟢 Green | On track |
| `prepTime × 0.8 ≤ orderAge < prepTime` | 🟡 Yellow | Approaching deadline |
| `orderAge ≥ prepTime` | 🔴 Red | Overdue |

---

## 7. API Integration

### 7.1 Backend Services & Ports

| Service | Port | Purpose |
|---|---|---|
| Identity Service | 5007 | Auth, users, roles |
| Catalog Service | 5001 | Restaurants, menu, tables |
| Order Service | 5004 | Orders, reservations, queue |
| Basket Service | 5003 | Price calculation (Redis-only) |
| Discount Service | 5002 | Promo/reward codes |
| Kitchen Service | 5005 | KDS data aggregation |
| Notification Service | 5006 | Notifications, feedback |
| API Gateway | 5000 | Single entry point (Ocelot) |

### 7.2 Key Endpoints for MVP

#### Identity Service (Port 5007)
```
POST   /api/auth/login                    Login
POST   /api/auth/refresh                  Refresh token
POST   /api/auth/logout                   Logout
GET    /api/users                         List users (by restaurant)
GET    /api/users/:id                     Get user detail
POST   /api/users                         Create user
PUT    /api/users/:id                     Update user
DELETE /api/users/:id                     Deactivate user
GET    /api/roles                         List available roles
```

#### Catalog Service (Port 5001)
```
GET    /api/restaurants/:id               Get restaurant detail
GET    /api/restaurants/:id/tables        List tables
GET    /api/menu/categories               Get menu categories + items
GET    /api/menu/items/:id                Get menu item detail
```

#### Order Service (Port 5004)
```
GET    /api/orders                        List orders (filterable)
GET    /api/orders/:id                    Get order detail
POST   /api/orders                        Create order
PUT    /api/orders/:id/status             Update order status
PUT    /api/orders/:id/items              Modify order items
POST   /api/orders/:id/split-bill         Split bill
GET    /api/orders/:id/modifications      Get modification log
```

#### Basket Service (Port 5003)
```
GET    /api/basket/:restaurantId          Get current basket
POST   /api/basket/items                  Add item to basket
PUT    /api/basket/items/:id              Update basket item
DELETE /api/basket/items/:id              Remove basket item
POST   /api/basket/checkout               Checkout → creates order
```

### 7.3 SignalR Hubs

```
/hubs/orders          → Kitchen display, order status updates
/hubs/notifications   → Push notifications to staff
```

### 7.4 RTK Query Setup

- Base URL: API Gateway (`http://localhost:5000`)
- All endpoints tagged by service for cache invalidation
- Automatic re-auth on 401 (refresh token flow)
- Restaurant ID injected as query param from Redux state
- Optimistic updates for status changes

---

## 8. File Structure (Frontend)

```
src/
├── app/
│   ├── store.ts                 → Redux store setup
│   └── hooks.ts                 → Typed Redux hooks
├── features/
│   ├── auth/
│   │   ├── authApi.ts           → RTK Query endpoints
│   │   ├── authSlice.ts         → Auth state (tokens in memory)
│   │   └── components/
│   ├── orders/
│   │   ├── ordersApi.ts
│   │   ├── ordersSlice.ts
│   │   └── components/
│   ├── staff/
│   │   ├── staffApi.ts
│   │   ├── staffSlice.ts
│   │   └── components/
│   └── restaurant/
│       ├── restaurantSlice.ts   → Active restaurant context
├── components/
│   ├── Layout/                  → Shell, Sidebar, TopBar
│   ├── ui/                      → Reusable UI (Button, Badge, Table, Modal)
│   └── RealTime/                → SignalR provider, connection status
├── lib/
│   ├── apiClient.ts             → Axios instance with auth interceptor
│   ├── signalr.ts               → SignalR connection setup
│   └── constants.ts
├── pages/                       → Route-level components
├── types/                       → TypeScript interfaces matching backend DTOs
└── utils/                       → Helpers (formatters, validators)
```

---

## 9. Authentication State in Redux

```typescript
interface AuthState {
  accessToken: string | null;  // In memory only — not persisted
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
    restaurantId: string;
  } | null;
  isAuthenticated: boolean;
}
```

- `accessToken` is NOT stored in localStorage/sessionStorage
- On page reload: check for valid session via `/api/auth/me` or attempt refresh
- RTK Query stores tokens in memory via `authSlice`

---

## 10. Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SIGNALR_URL=http://localhost:5000/hubs
VITE_APP_NAME=Orderly Admin
```

---

## 11. Development Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint
pnpm lint
```

---

## 12. Open Questions (to be resolved during implementation)

- [ ] Do we need offline support for the Kitchen Display? (SignalR reconnect + local state)
- [ ] Should the bill split view use drag-drop for seat assignment?
- [ ] Do managers need a bulk action panel (approve multiple modifications at once)?
- [ ] Is there a need for a dark mode / theme toggle?
- [ ] Should we add audit logging UI (view modification history inline in order detail)?
- [ ] Should KDS (`/site/kitchen`) be full-screen only, or should it also have a non-full-screen mode for managers reviewing from the office?
- [ ] Is there a "cross-zone" dashboard for SuperAdmin that shows aggregated stats across all restaurants?