import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { store } from "../../../app/store";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { AdminAuditPage } from "./AdminAuditPage";
import { axe } from "jest-axe";

describe("AdminAuditPage", () => {
  it("renders audit timeline with header and filterable entries", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <AdminAuditPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    expect(screen.getByRole("heading", { name: "Audit" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Initial brand creation/i)).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("filters entries by actor", async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <AdminAuditPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText(/Initial brand creation/i)).toBeInTheDocument();
    });

    const actorInput = screen.getByPlaceholderText(/Search actor/i);
    await user.type(actorInput, "Alex Rivera");

    expect(screen.queryByText(/Initial brand creation/i)).not.toBeInTheDocument();
  });

  it("renders localized text in Spanish", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <AdminAuditPage />
        </MemoryRouter>
      </Provider>,
      "es",
    );

    expect(screen.getByRole("heading", { name: "Auditoría" })).toBeInTheDocument();
  });
});
