import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router";
import { RequirePermission } from "./RequirePermission";
import sessionReducer, { setCredentials } from "../../app/session/sessionSlice";
import type { Permission } from "../../types/auth";

function renderWithPermissions(permissions: readonly Permission[], children: React.ReactNode) {
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
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RequirePermission perm={"brands:view" satisfies Permission}>{children}</RequirePermission>
      </MemoryRouter>
    </Provider>,
  );
}

describe("RequirePermission", () => {
  afterEach(() => cleanup());

  it("renders children when the permission is granted", () => {
    renderWithPermissions(["brands:view"], <span data-testid="ok">allowed</span>);
    expect(screen.getByTestId("ok").textContent).toBe("allowed");
  });

  it("renders ForbiddenPage when the permission is missing", () => {
    renderWithPermissions(["audit:view"], <span data-testid="ok">allowed</span>);
    expect(screen.getByRole("heading", { name: "Forbidden" })).toBeInTheDocument();
  });
});
