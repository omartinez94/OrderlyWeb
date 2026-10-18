import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { BrandListPage } from "./BrandListPage";

describe("BrandListPage", () => {
  it("renders brands from catalogApi and passes accessibility checks", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <BrandListPage />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByRole("heading", { name: /^Brands$/i })).toBeInTheDocument();
    expect(await screen.findByText("Acme Hospitality Group")).toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });
});
