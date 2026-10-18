import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { resetMockCatalogState } from "../../../../test/handlers/catalog";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { QueuePage } from "./QueuePage";

describe("QueuePage", () => {
  beforeEach(() => {
    resetMockCatalogState();
  });

  it("renders queue list, metrics, and passes accessibility checks", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/queue"]}>
          <QueuePage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    expect(screen.getByRole("heading", { name: /Walk-In Guest Waitlist/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Marco Rossi")).toBeInTheDocument();
      expect(screen.getByText("Giulia Bianchi")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("opens Add Walk-In dialog", async () => {
    const user = userEvent.setup();

    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/queue"]}>
          <QueuePage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    const addBtn = screen.getByRole("button", { name: /Add Walk-In/i });
    await user.click(addBtn);

    expect(screen.getByRole("heading", { name: /Add Walk-In Guest/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Guest Name/i)).toBeInTheDocument();
  });
});
