import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { OrderTimeline } from "./OrderTimeline";
import type { OrderActivityDto } from "../../../types/order";

const mockActivities: OrderActivityDto[] = [
  {
    id: "act-2",
    activityType: "OrderPreparingStarted",
    actorUserId: "chef-01",
    occurredAt: "2026-07-28T10:15:00Z",
    notes: "Fire station 1",
    correlationId: "corr-102",
  },
  {
    id: "act-1",
    activityType: "OrderCreated",
    actorUserId: "waiter-01",
    occurredAt: "2026-07-28T10:00:00Z",
    correlationId: "corr-101",
  },
  {
    id: "act-3",
    activityType: "OrderReady",
    actorUserId: "chef-01",
    occurredAt: "2026-07-28T10:25:00Z",
    correlationId: "corr-103",
  },
];

describe("OrderTimeline", () => {
  it("renders empty state message when activities array is empty", () => {
    renderWithI18n(<OrderTimeline activities={[]} />, "en");
    expect(screen.getByText("No activity records found.")).toBeInTheDocument();
  });

  it("sorts activities chronologically from oldest to newest", () => {
    renderWithI18n(<OrderTimeline activities={mockActivities} />, "en");

    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles).toHaveLength(3);
    expect(titles[0]).toHaveTextContent("Order Created");
    expect(titles[1]).toHaveTextContent("Preparation Started");
    expect(titles[2]).toHaveTextContent("Order Ready");
  });

  it("displays actor user, notes, and correlation ID stamps", () => {
    renderWithI18n(<OrderTimeline activities={mockActivities} />, "en");

    expect(screen.getByText("waiter-01")).toBeInTheDocument();
    expect(screen.getAllByText("chef-01")).toHaveLength(2);
    expect(screen.getByText("Fire station 1")).toBeInTheDocument();
    expect(screen.getByText("corr-101")).toBeInTheDocument();
  });

  it("renders translated status labels in Spanish", () => {
    renderWithI18n(<OrderTimeline activities={mockActivities} />, "es");

    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles[0]).toHaveTextContent("Pedido creado");
    expect(titles[1]).toHaveTextContent("Preparación iniciada");
    expect(titles[2]).toHaveTextContent("Pedido listo");
  });

  it("passes axe accessibility checks", async () => {
    const { container } = renderWithI18n(<OrderTimeline activities={mockActivities} />, "en");
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
