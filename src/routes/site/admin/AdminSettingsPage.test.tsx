import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../app/store";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { AdminSettingsPage } from "./AdminSettingsPage";

describe("AdminSettingsPage", () => {
  it("loads and displays settings from API", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <AdminSettingsPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    // Initial loading indicator
    expect(screen.getByText(/loading settings…/i)).toBeInTheDocument();

    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/time zone/i)).toHaveValue("America/New_York");
    });

    expect(screen.getByLabelText(/currency/i)).toHaveValue("USD");
    expect(screen.getByLabelText(/system sender email/i)).toHaveValue(
      "noreply@orderly.hospitality.com",
    );
  });

  it("allows updating settings and submitting form", async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <AdminSettingsPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/time zone/i)).toHaveValue("America/New_York");
    });

    const tzInput = screen.getByLabelText(/time zone/i);
    await user.clear(tzInput);
    await user.type(tzInput, "Europe/London");

    const submitBtn = screen.getByRole("button", { name: /save/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Europe/London")).toBeInTheDocument();
    });
  });

  it("passes a11y audit once loaded", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <AdminSettingsPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/time zone/i)).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
