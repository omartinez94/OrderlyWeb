import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { OrderStatusBadge } from "./OrderStatusBadge";

describe("OrderStatusBadge", () => {
  it("renders 5-stop service hues with proper status role and labels in English", () => {
    const { rerender } = renderWithI18n(<OrderStatusBadge status="Pending" />, "en");
    expect(screen.getByRole("status")).toHaveTextContent("New");

    rerender(<OrderStatusBadge status="Confirmed" />);
    expect(screen.getByRole("status")).toHaveTextContent("Confirmed");

    rerender(<OrderStatusBadge status="Preparing" />);
    expect(screen.getByRole("status")).toHaveTextContent("Preparing");

    rerender(<OrderStatusBadge status="Ready" />);
    expect(screen.getByRole("status")).toHaveTextContent("Ready");

    rerender(<OrderStatusBadge status="Delivered" />);
    expect(screen.getByRole("status")).toHaveTextContent("Delivered");

    rerender(<OrderStatusBadge status="Cancelled" />);
    expect(screen.getByRole("status")).toHaveTextContent("Cancelled");
  });

  it("renders translated status labels in Spanish", () => {
    renderWithI18n(<OrderStatusBadge status="Preparing" />, "es");
    expect(screen.getByRole("status")).toHaveTextContent("En preparación");
  });

  it("passes accessibility audit with zero axe violations", async () => {
    const { container } = renderWithI18n(<OrderStatusBadge status="Ready" />, "en");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
