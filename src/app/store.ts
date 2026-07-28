/**
 * store — the single Redux store for the Orderly Web app.
 *
 * `configureStore` wires:
 *   - one reducer per RTK Query slice (`identityApi`, `catalogApi`,
 *     `ordersApi`, `kitchenApi`, `notificationsApi`)
 *   - the slice reducers wired by `sessionSlice` (Phase 3)
 *   - one middleware per slice (RTK Query cache + invalidation)
 *
 * The session slice lands in Phase 3; until then the auth predicate
 * is the placeholder in `useAuthPredicate.ts`. The store still
 * exists so feature code can `useAppSelector(state => state.…)`
 * without churn when Phase 3 lands.
 */

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { identityApi } from "./api/identity";
import { catalogApi } from "./api/catalog";
import { ordersApi } from "./api/orders";
import { kitchenApi } from "./api/kitchen";
import { notificationsApi } from "./api/notifications";
import sessionReducer from "./session/sessionSlice";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    [identityApi.reducerPath]: identityApi.reducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [kitchenApi.reducerPath]: kitchenApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      identityApi.middleware,
      catalogApi.middleware,
      ordersApi.middleware,
      kitchenApi.middleware,
      notificationsApi.middleware,
    ),
});

// Enables refetchOnFocus / refetchOnReconnect behaviors in RTK Query.
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
