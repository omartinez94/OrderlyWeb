import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { MemoryRouter } from "react-router";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { AdminRolesPage } from "./AdminRolesPage";

describe("AdminRolesPage", () => {
  it("renders header and role permission matrix", () => {
    renderWithI18n(
      <MemoryRouter>
        <AdminRolesPage />
      </MemoryRouter>,
      "en",
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Roles and permissions");
    expect(screen.getByText("Super Admin")).toBeInTheDocument();
  });

  it("passes a11y audit", async () => {
    const { container } = renderWithI18n(
      <MemoryRouter>
        <AdminRolesPage />
      </MemoryRouter>,
      "en",
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
