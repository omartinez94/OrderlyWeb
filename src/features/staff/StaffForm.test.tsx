/**
 * StaffForm tests — validation, submit, and a11y.
 */

import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../app/store";
import { StaffForm } from "./StaffForm";

function renderForm() {
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
    await user.click(screen.getByLabelText("Acme Bistro — Downtown"));
    await user.click(screen.getByRole("button", { name: /invite/i }));

    // The createStaff mutation fires MSW (which the Phase 2 handler
    // doesn't cover for POST /identity-api/staff), so we just verify
    // the validation gate passed — no inline alerts remain.
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
