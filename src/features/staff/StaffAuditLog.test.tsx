/**
 * StaffAuditLog tests — Phase 4 deliverable.
 */

import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { store } from "../../app/store";
import { setCredentials } from "../../app/session/sessionSlice";
import { StaffAuditLog } from "./StaffAuditLog";

describe("StaffAuditLog", () => {
  it("renders the audit entries from MSW", async () => {
    store.dispatch(
      setCredentials({
        accessToken: "test-token",
        expiresAt: Date.now() + 60_000,
        user: { id: "u-admin", name: "Admin", email: "admin@acme.co", initials: "AD" },
        roles: ["SuperAdmin"],
        permissions: [],
      }),
    );

    render(
      <Provider store={store}>
        <MemoryRouter>
          <StaffAuditLog staffId="s-001" />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      // The most recent entry ("reactivate") renders as the
      // action label inside the timeline.
      expect(screen.getByText(/reactivated/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/deactivated/i)).toBeInTheDocument();
    expect(screen.getByText(/assigned to restaurant/i)).toBeInTheDocument();
    expect(screen.getByText(/granted role/i)).toBeInTheDocument();
    expect(screen.getByText(/created/i)).toBeInTheDocument();
  });
});
