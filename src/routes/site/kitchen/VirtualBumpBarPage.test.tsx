import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { VirtualBumpBarPage } from "./VirtualBumpBarPage";

describe("VirtualBumpBarPage", () => {
  it("renders the standalone popup layout with correct accessibility landmark", async () => {
    const { container } = renderWithI18n(<VirtualBumpBarPage />, "en");

    const mainEl = screen.getByRole("main", { name: "KB9000 Bump Bar Simulator" });
    expect(mainEl).toBeInTheDocument();
    expect(document.title).toContain("KB9000 Bump Bar Simulator");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("updates title and localized content in Spanish", () => {
    renderWithI18n(<VirtualBumpBarPage />, "es");

    const mainEl = screen.getByRole("main", { name: "Simulador Bump Bar KB9000" });
    expect(mainEl).toBeInTheDocument();
    expect(document.title).toContain("Simulador Bump Bar KB9000");
  });
});
