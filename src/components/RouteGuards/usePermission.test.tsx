import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { usePermission } from "./usePermission";
import sessionReducer, { setCredentials } from "../../app/session/sessionSlice";
import type { Permission } from "../../types/auth";

function renderWithPermissions(permissions: readonly Permission[]) {
  const store = configureStore({ reducer: { session: sessionReducer } });
  store.dispatch(
    setCredentials({
      accessToken: "t",
      expiresAt: Date.now() + 1000,
      user: { id: "u", name: "U", email: "u@example.com", initials: "U" },
      roles: [],
      permissions,
    }),
  );
  function Probe() {
    const allowed = usePermission("brands:view");
    return <span data-testid="probe">{allowed ? "yes" : "no"}</span>;
  }
  return render(
    <Provider store={store}>
      <Probe />
    </Provider>,
  );
}

describe("usePermission", () => {
  afterEach(() => cleanup());

  it("returns true when the permission is in the predicate", () => {
    renderWithPermissions(["brands:view", "audit:view"]);
    expect(screen.getByTestId("probe").textContent).toBe("yes");
  });

  it("returns false when the permission is not in the predicate", () => {
    renderWithPermissions(["audit:view"]);
    expect(screen.getByTestId("probe").textContent).toBe("no");
  });

  it("returns false for an empty claim set", () => {
    renderWithPermissions([]);
    expect(screen.getByTestId("probe").textContent).toBe("no");
  });
});
