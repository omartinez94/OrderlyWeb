import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { axe } from "jest-axe";
import { store } from "../../../app/store";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { CatalogItemPicker } from "./CatalogItemPicker";

describe("CatalogItemPicker", () => {
  it("renders catalog items and categories from MSW getMenu handler", async () => {
    const handleSelect = vi.fn();
    const handleModifiers = vi.fn();

    renderWithI18n(
      <Provider store={store}>
        <CatalogItemPicker
          restaurantId="r-001"
          onSelectItem={handleSelect}
          onOpenModifiers={handleModifiers}
        />
      </Provider>,
      "en",
    );

    // Initial category tabs
    expect(screen.getByRole("tab", { name: "All Categories" })).toBeInTheDocument();

    // MSW returns Margherita Pizza in c-pizza
    await waitFor(() => {
      expect(screen.getByText("Margherita")).toBeInTheDocument();
    });

    expect(screen.getByText("Pizza")).toBeInTheDocument();
    expect(screen.getByText("$14.00")).toBeInTheDocument();
  });

  it("calls onSelectItem when Add button is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const handleModifiers = vi.fn();

    renderWithI18n(
      <Provider store={store}>
        <CatalogItemPicker
          restaurantId="r-001"
          onSelectItem={handleSelect}
          onOpenModifiers={handleModifiers}
        />
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("Margherita")).toBeInTheDocument();
    });

    const addBtn = screen.getByRole("button", { name: /add margherita/i });
    await user.click(addBtn);

    expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ name: "Margherita" }));
  });

  it("passes accessibility audit with zero axe violations", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <CatalogItemPicker restaurantId="r-001" onSelectItem={vi.fn()} onOpenModifiers={vi.fn()} />
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("Margherita")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
