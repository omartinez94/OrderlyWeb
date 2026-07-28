/**
 * RestaurantAssignmentGrid — Phase 2 of the staff-management plan.
 *
 * Renders one row per restaurant, one column per grantable role;
 * toggling a cell flips the underlying Set membership.
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RestaurantAssignmentGrid } from "./RestaurantAssignmentGrid";
import type { Role } from "../../types/auth";

const RESTAURANTS = [
  { id: "r-001", label: "Acme Bistro — Downtown" },
  { id: "r-002", label: "Acme Bistro — Marina" },
];

const ROLES: readonly Role[] = ["Manager", "Waiter", "Host"];

describe("RestaurantAssignmentGrid", () => {
  it("renders a checkbox per restaurant × role", () => {
    render(
      <RestaurantAssignmentGrid
        restaurants={RESTAURANTS}
        grantableRoles={ROLES}
        grants={new Map()}
        onToggle={vi.fn()}
      />,
    );

    for (const r of RESTAURANTS) {
      for (const role of ROLES) {
        expect(screen.getByRole("checkbox", { name: `${role} at ${r.label}` })).toBeInTheDocument();
      }
    }
  });

  it("reflects the initial grants", () => {
    const grants = new Map<string, ReadonlySet<Role>>([["r-001", new Set<Role>(["Manager"])]]);
    render(
      <RestaurantAssignmentGrid
        restaurants={RESTAURANTS}
        grantableRoles={ROLES}
        grants={grants}
        onToggle={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("checkbox", {
        name: `Manager at ${RESTAURANTS[0].label}`,
      }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", {
        name: `Waiter at ${RESTAURANTS[0].label}`,
      }),
    ).not.toBeChecked();
  });

  it("fires onToggle with the right restaurant + role", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(
      <RestaurantAssignmentGrid
        restaurants={RESTAURANTS}
        grantableRoles={ROLES}
        grants={new Map()}
        onToggle={onToggle}
      />,
    );

    await user.click(
      screen.getByRole("checkbox", {
        name: `Manager at ${RESTAURANTS[0].label}`,
      }),
    );
    expect(onToggle).toHaveBeenCalledWith("r-001", "Manager");
  });
});
