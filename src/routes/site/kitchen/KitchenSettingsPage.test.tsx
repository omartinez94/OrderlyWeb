import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { KitchenSettingsPage } from "./KitchenSettingsPage";

describe("KitchenSettingsPage", () => {
  it("renders KDS settings title and hardware configuration widget in English", async () => {
    const { container } = renderWithI18n(<KitchenSettingsPage />, "en");

    expect(screen.getByRole("heading", { name: "KDS settings" })).toBeInTheDocument();
    expect(
      screen.getByText("Station hardware profiles, bump bar calibration, and audio feedback."),
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders localized settings headings in Spanish", () => {
    renderWithI18n(<KitchenSettingsPage />, "es");

    expect(screen.getByRole("heading", { name: "Configuración KDS" })).toBeInTheDocument();
    expect(
      screen.getByText("Perfiles de hardware, calibración de bump bar y alertas auditivas."),
    ).toBeInTheDocument();
  });
});
