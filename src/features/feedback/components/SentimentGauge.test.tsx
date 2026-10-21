import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { SentimentGauge } from "./SentimentGauge";
import type { CustomerFeedbackSummary } from "../../../types/feedback";

const mockSummary: CustomerFeedbackSummary = {
  averageRating: 4.4,
  totalCount: 25,
  starDistribution: {
    5: 14,
    4: 7,
    3: 2,
    2: 1,
    1: 1,
  },
  averageFoodQuality: 4.7,
  averageServiceSpeed: 4.1,
  averageWaiterFriendliness: 4.6,
  totalRewardsIssued: 25,
  totalRewardsRedeemed: 10,
  rewardRedemptionRate: 40.0,
};

describe("SentimentGauge", () => {
  it("renders CSAT summary metrics, star progress bars, redemption rate, and passes axe check", async () => {
    const { container } = renderWithI18n(<SentimentGauge summary={mockSummary} />, "en");

    // Title & overall rating
    expect(
      screen.getByRole("heading", { name: "Overall Guest Satisfaction (CSAT)" }),
    ).toBeInTheDocument();
    expect(screen.getByText("4.4")).toBeInTheDocument();
    expect(screen.getByText("/ 5.0")).toBeInTheDocument();
    expect(screen.getByText("25 verified reviews")).toBeInTheDocument();

    // Category averages
    expect(screen.getByText("Food Quality")).toBeInTheDocument();
    expect(screen.getByText("4.7")).toBeInTheDocument();
    expect(screen.getByText("Service Speed")).toBeInTheDocument();
    expect(screen.getByText("4.1")).toBeInTheDocument();
    expect(screen.getByText("Staff Friendliness")).toBeInTheDocument();
    expect(screen.getByText("4.6")).toBeInTheDocument();

    // Star distribution breakdown
    expect(screen.getByText("Rating Breakdown")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("(56%)")).toBeInTheDocument();

    // Voucher redemption rate
    expect(screen.getByText("Reward Redemption Rate")).toBeInTheDocument();
    expect(screen.getByText("40.0%")).toBeInTheDocument();
    expect(screen.getByText("Vouchers Issued")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("Vouchers Redeemed")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    // Accessibility
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders in Spanish locale", () => {
    renderWithI18n(<SentimentGauge summary={mockSummary} />, "es");

    expect(
      screen.getByRole("heading", { name: "Satisfacción General del Comensal (CSAT)" }),
    ).toBeInTheDocument();
    expect(screen.getByText("25 reseñas verificadas")).toBeInTheDocument();
    expect(screen.getByText("Desglose de Calificaciones")).toBeInTheDocument();
    expect(screen.getByText("Tasa de Redención de Recompensas")).toBeInTheDocument();
  });
});
