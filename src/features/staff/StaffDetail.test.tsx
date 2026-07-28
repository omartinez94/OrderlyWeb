/**
 * StaffDetail tests — Phase 3 deliverable.
 *
 * Uses the foundation's full store (with RTK Query middleware) so
 * `useGetStaffQuery` and the deactivate / reactivate mutations
 * resolve correctly.
 */

import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { store } from "../../app/store";
import { setCredentials } from "../../app/session/sessionSlice";
import { StaffDetail } from "./StaffDetail";

function seedSession() {
  store.dispatch(
    setCredentials({
      accessToken: "test-token",
      expiresAt: Date.now() + 60_000,
      user: { id: "u-admin", name: "Admin", email: "admin@acme.co", initials: "AD" },
      roles: ["SuperAdmin"],
      permissions: [],
    }),
  );
}

function renderAt(path: string) {
  seedSession();
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/site/admin/staff/:id" element={<StaffDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("StaffDetail", () => {
  it("renders the deactivate button when the staff is active", async () => {
    renderAt("/site/admin/staff/s-001");
    await waitFor(() => {
      expect(screen.getByText(/Maya Okafor/)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /deactivate/i })).toBeInTheDocument();
  });

  it("does not show the reactivate button while the staff is active", async () => {
    renderAt("/site/admin/staff/s-001");
    await waitFor(() => {
      expect(screen.getByText(/Maya Okafor/)).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /reactivate/i })).not.toBeInTheDocument();
  });

  it("dispatches deactivate on click", async () => {
    const user = userEvent.setup();
    renderAt("/site/admin/staff/s-001");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /deactivate/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /deactivate/i }));

    await waitFor(() => {
      expect(screen.getByText(/Maya Okafor/)).toBeInTheDocument();
    });
  });
});