import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../test/i18n-wrapper";
import { RolePermissionMatrix } from "./RolePermissionMatrix";
import { ROLE_PERMISSIONS, type Role } from "../../types/auth";

describe("RolePermissionMatrix", () => {
  it("renders table with all 8 roles and permissions", () => {
    renderWithI18n(<RolePermissionMatrix />, "en");

    expect(screen.getByText("Permission")).toBeInTheDocument();

    const roleLabels = [
      "Super Admin",
      "Restaurant Admin",
      "Manager",
      "Kitchen Manager",
      "Kitchen Staff",
      "Waiter",
      "Cashier",
      "Host",
    ];

    roleLabels.forEach((roleLabel) => {
      expect(screen.getByText(roleLabel)).toBeInTheDocument();
    });

    // Check specific permission labels
    expect(screen.getByText("brands:view")).toBeInTheDocument();
    expect(screen.getByText("settings:edit")).toBeInTheDocument();
  });

  it("renders checkmarks for granted permissions according to ROLE_PERMISSIONS", () => {
    renderWithI18n(<RolePermissionMatrix />, "en");

    // SuperAdmin has all 16 permissions
    const superAdminGranted = screen.getAllByLabelText("Granted to SuperAdmin");
    expect(superAdminGranted).toHaveLength(16);

    // KitchenStaff has 0 of the 16 CRM permissions in ROLE_PERMISSIONS
    const kitchenStaffGranted = screen.queryAllByLabelText("Granted to KitchenStaff");
    expect(kitchenStaffGranted).toHaveLength(ROLE_PERMISSIONS.KitchenStaff.length);
  });

  it("passes a11y audit", async () => {
    const { container } = renderWithI18n(<RolePermissionMatrix />, "en");
    expect(await axe(container)).toHaveNoViolations();
  });
});
