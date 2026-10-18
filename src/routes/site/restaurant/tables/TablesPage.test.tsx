import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { resetMockCatalogState } from "../../../../test/handlers/catalog";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { TablesPage } from "./TablesPage";

describe("TablesPage", () => {
  beforeEach(() => {
    resetMockCatalogState();
  });

  it("renders tables, sections, merged clusters, and passes accessibility checks", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/tables"]}>
          <TablesPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    expect(screen.getByRole("heading", { name: /Tables/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("T1")).toBeInTheDocument();
      expect(screen.getByText("T2")).toBeInTheDocument();
      expect(screen.getByText("T3")).toBeInTheDocument();
    });

    // Check merged cluster
    expect(screen.getByText(/Merged Cluster: T1 \+ T5/i)).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("filters tables by section click", async () => {
    const user = userEvent.setup();

    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/tables"]}>
          <TablesPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("T1")).toBeInTheDocument();
    });

    const windowTab = screen.getByRole("tab", { name: "Window" });
    await user.click(windowTab);

    expect(screen.getByText("T1")).toBeInTheDocument();
    expect(screen.getByText("T5")).toBeInTheDocument();
    expect(screen.queryByText("T2")).not.toBeInTheDocument();
  });

  it("renders correctly in Spanish", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/tables"]}>
          <TablesPage />
        </MemoryRouter>
      </Provider>,
      "es",
    );

    expect(screen.getByRole("heading", { name: /Mesas/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("T1")).toBeInTheDocument();
    });
  });
});
