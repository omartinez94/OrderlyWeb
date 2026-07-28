/**
 * StaffList tests — loaded state and query/role filter behavior.
 */

import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { store } from "../../app/store";
import { StaffList } from "./StaffList";

describe("StaffList", () => {
  it("renders rows from the staff query", async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <StaffList />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Maya Okafor/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Diego Castro/)).toBeInTheDocument();
  });

  it("filters rows by role when the user picks one", async () => {
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <StaffList />
        </MemoryRouter>
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Maya Okafor/)).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText(/role/i), "Waiter");

    await waitFor(() => {
      expect(screen.queryByText(/Maya Okafor/)).not.toBeInTheDocument();
      expect(screen.getByText(/Diego Castro/)).toBeInTheDocument();
    });
  });
});
