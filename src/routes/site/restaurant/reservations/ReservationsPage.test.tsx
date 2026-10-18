import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { resetMockCatalogState } from "../../../../test/handlers/catalog";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { ReservationsPage } from "./ReservationsPage";

describe("ReservationsPage", () => {
  beforeEach(() => {
    resetMockCatalogState();
  });

  it("renders reservation list, metrics, and passes accessibility checks", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/reservations"]}>
          <ReservationsPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    expect(
      screen.getByRole("heading", { name: /Table Reservations & Calendar/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Sophia Loren")).toBeInTheDocument();
      expect(screen.getByText("Alessandro Volta")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("opens New Reservation dialog", async () => {
    const user = userEvent.setup();

    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/reservations"]}>
          <ReservationsPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    const newBtn = screen.getByRole("button", { name: /New Reservation/i });
    await user.click(newBtn);

    expect(screen.getByRole("heading", { name: /New Table Reservation/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Guest Name/i)).toBeInTheDocument();
  });
});
