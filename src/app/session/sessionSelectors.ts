/**
 * sessionSelectors — typed selectors over the session slice.
 *
 * `selectPredicate` is the canonical auth predicate the guards
 * consume. It is built with `createSelector` so the returned
 * object reference is stable until `roles` or `isAuthenticated`
 * change. Combined with `shallowEqual` in `useAuthPredicate`,
 * consumers don't re-render on unrelated state changes.
 *
 * Why the predicate is a single object:
 *   - Guards consume both `isAuthenticated` and `roles`. A single
 *     reference means a single shallow comparison covers both.
 *   - The auth predicate is the *one* thing the entire routing
 *     tree reads, so memoization here is the highest-leverage
 *     spot in the app.
 *
 * Vercel rules adopted:
 *   - `rerender-defer-reads` — keep auth state shallow-equal.
 *   - `js-cache-storage` — no `localStorage` reads; slice is in
 *     Redux memory only.
 */

import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { AuthPredicate } from "../../types/auth";
import { defaultZoneForRoles } from "../../lib/defaultZone";

export const selectAccessToken = (state: RootState): string | null => state.session.accessToken;

export const selectSessionStatus = (state: RootState) => state.session.status;

export const selectUser = (state: RootState) => state.session.user;

export const selectRoles = (state: RootState) => state.session.roles;

export const selectPermissions = (state: RootState) => state.session.permissions;

export const selectIsAuthenticated = (state: RootState): boolean =>
  state.session.status === "authenticated";

/**
 * Memoized auth predicate. Reference-stable until `roles` or
 * `isAuthenticated` change.
 */
export const selectPredicate = createSelector(
  [selectRoles, selectIsAuthenticated, selectPermissions],
  (roles, isAuthenticated, permissions): AuthPredicate => ({
    isAuthenticated,
    roles,
    permissions,
  }),
);

/**
 * Default zone for the authenticated user — used by RootRedirect
 * and the breadcrumb brand click. Returns `null` when the user has
 * no matching role (caller falls through to `/home`).
 */
export const selectDefaultZone = createSelector([selectRoles], (roles) =>
  defaultZoneForRoles(roles),
);
