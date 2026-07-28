/**
 * StaffForm tests — validation, submit, and a11y.
 *
 * Seeds the session with SuperAdmin so `useGrantableRoles` exposes
 * every role checkbox.
 */

import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { configureStore } from "@reduxjs/toolkit";
import sessionReducer, { setCredentials } from "../../app/session/sessionSlice";
import { StaffForm } from "./StaffForm";

function makeStore() {
  const store = configureStore({ reducer: { session: sessionReducer } });
  store.dispatch(
    setCredentials({
      accessToken: "test-token",
      expiresAt: Date.now() + 60_000,
      user: { id: "u-1", name: "Admin", email: "admin@acme.co", initials: "AD" },
      roles: ["SuperAdmin"],
      permissions: [],
    }),
  );
  return store;
}

function renderForm() {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <StaffForm />
      </MemoryRouter>
    </Provider>,
  );
}

describe("StaffForm", () => {
  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    const { container } = renderForm();

    await user.click(screen.getByRole("button", { name: /invite/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/valid email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/pick at least one role/i)).toBeInTheDocument();
      expect(screen.getByText(/assign at least one restaurant/i)).toBeInTheDocument();
    });

    const a11y = await axe(container);
    expect(a11y).toHaveNoViolations();
  });

  it("submits when all required fields are filled", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/full name/i), "Maya Okafor");
    await user.type(screen.getByLabelText(/work email/i), "maya@acme.co");
    await user.click(screen.getByLabelText("Manager"));
    await user.click(
      screen.getByRole("checkbox", {
        name: `Manager at ${"Acme Bistro — Downtown"}`,
      }),
    );
    await user.click(screen.getByRole("button", { name: /invite/i }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
