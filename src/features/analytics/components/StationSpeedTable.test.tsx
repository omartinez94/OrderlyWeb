import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import type { StationSpeedMetric } from "../../../types/analytics";
import { StationSpeedTable } from "./StationSpeedTable";

const mockStations: StationSpeedMetric[] = [
  {
    station: "Grill",
    orderCount: 83,
    averagePrepTimeMinutes: 10.8,
    targetPrepTimeMinutes: 10.0,
    delayPercentage: 8.0,
    isDelayed: false,
  },
  {
    station: "Salad",
    orderCount: 42,
    averagePrepTimeMinutes: 6.2,
    targetPrepTimeMinutes: 7.0,
    delayPercentage: 0,
    isDelayed: false,
  },
  {
    station: "Fryer",
    orderCount: 38,
    averagePrepTimeMinutes: 14.5,
    targetPrepTimeMinutes: 9.0,
    delayPercentage: 61.1,
    isDelayed: true,
  },
  {
    station: "Sauté",
    orderCount: 86,
    averagePrepTimeMinutes: 16.2,
    targetPrepTimeMinutes: 12.0,
    delayPercentage: 35.0,
    isDelayed: true,
  },
  {
    station: "Expedite",
    orderCount: 142,
    averagePrepTimeMinutes: 3.2,
    targetPrepTimeMinutes: 4.0,
    delayPercentage: 0,
    isDelayed: false,
  },
];

describe("StationSpeedTable", () => {
  it("renders station rows, flags stations exceeding 120% target, and passes axe audit", async () => {
    const { container } = renderWithI18n(<StationSpeedTable stations={mockStations} />, "en");

    // Verify station names rendered
    expect(screen.getByText("Grill")).toBeInTheDocument();
    expect(screen.getByText("Salad")).toBeInTheDocument();
    expect(screen.getByText("Fryer")).toBeInTheDocument();
    expect(screen.getByText("Sauté")).toBeInTheDocument();
    expect(screen.getByText("Expedite")).toBeInTheDocument();

    // Verify bottleneck warning banner is visible
    expect(
      screen.getByText(/Station exceeding 120% target prep time threshold/i),
    ).toBeInTheDocument();

    // Fryer is delayed (+61%)
    expect(screen.getByText("Delayed (+61%)")).toBeInTheDocument();
    // Sauté is delayed (+35%)
    expect(screen.getByText("Delayed (+35%)")).toBeInTheDocument();

    // On-track stations
    const onTrackBadges = screen.getAllByText("On Target");
    expect(onTrackBadges).toHaveLength(3);

    // Accessibility test
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders on-track banner when all stations are within target threshold", async () => {
    const allOnTrackStations: StationSpeedMetric[] = [
      {
        station: "Grill",
        orderCount: 50,
        averagePrepTimeMinutes: 9.5,
        targetPrepTimeMinutes: 10.0,
        delayPercentage: 0,
        isDelayed: false,
      },
      {
        station: "Salad",
        orderCount: 30,
        averagePrepTimeMinutes: 5.5,
        targetPrepTimeMinutes: 7.0,
        delayPercentage: 0,
        isDelayed: false,
      },
    ];

    const { container } = renderWithI18n(<StationSpeedTable stations={allOnTrackStations} />, "en");

    expect(
      screen.getByText("All kitchen stations are operating within target prep time thresholds."),
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders correctly under Spanish locale", async () => {
    const { container } = renderWithI18n(<StationSpeedTable stations={mockStations} />, "es");

    expect(screen.getByText("Estación")).toBeInTheDocument();
    expect(screen.getByText("Pedidos Preparados")).toBeInTheDocument();
    expect(screen.getByText("Tiempo Real Prom.")).toBeInTheDocument();
    expect(screen.getByText("Tiempo Meta")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();

    // Spanish bottleneck warning
    expect(
      screen.getByText(/Estación superando el 120% del umbral de tiempo meta/i),
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
