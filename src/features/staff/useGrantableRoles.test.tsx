/**
 * useGrantableRoles tests — Phase 1 deliverable.
 *
 * Verifies the role matrix:
 *   - SuperAdmin sees all 8 roles.
 *   - RestaurantAdmin sees 6 (Manager / KitchenManager /
 *     KitchenStaff / Waiter / Cashier / Host).
 *   - Manager and below see none.
 */

import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { useGrantableRoles } from "./useGrantableRoles";
import { configureStore } from "@reduxjs/toolkit";
import sessionReducer, {
  setCredentials,
  type CredentialsPayload,
} from "../../app/session/sessionSlice";
import type { Role } from "../../types/auth";

function makeStore(roles: readonly Role[]) {
  const store = configureStore({
    reducer: {
      session: sessionReducer,
    },
  });
  const payload: CredentialsPayload = {
    accessToken: "test-token",
    expiresAt: Date.now() + 60_000,
    user: { id: "u-1", name: "Test User", email: "test@acme.co", initials: "TU" },
    roles,
    permissions: [],
  };
  store.dispatch(setCredentials(payload));
  return store;
}

function renderWithRoles(roles: readonly Role[]) {
  const store = makeStore(roles);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return renderHook(() => useGrantableRoles(), { wrapper });
}

describe("useGrantableRoles", () => {
  it("SuperAdmin can grant every role", () => {
    const { result } = renderWithRoles(["SuperAdmin"]);
    expect(result.current).toEqual([
      "SuperAdmin",
      "RestaurantAdmin",
      "Manager",
      "KitchenManager",
      "KitchenStaff",
      "Waiter",
      "Cashier",
      "Host",
    ]);
  });

  it("RestaurantAdmin can grant Manager / KitchenManager / KitchenStaff / Waiter / Cashier / Host", () => {
    const { result } = renderWithRoles(["RestaurantAdmin"]);
    expect(result.current).toEqual([
      "Manager",
      "KitchenManager",
      "KitchenStaff",
      "Waiter",
      "Cashier",
      "Host",
    ]);
    expect(result.current).not.toContain("SuperAdmin");
    expect(result.current).not.toContain("RestaurantAdmin");
  });

  it("Manager cannot grant any role", () => {
    const { result } = renderWithRoles(["Manager"]);
    expect(result.current).toEqual([]);
  });

  it("Waiter cannot grant any role", () => {
    const { result } = renderWithRoles(["Waiter"]);
    expect(result.current).toEqual([]);
  });
});
