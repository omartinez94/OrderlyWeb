import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { FeedbackCard } from "./FeedbackCard";
import type { CustomerFeedbackDto } from "../../../types/feedback";

const mockFeedbackRedeemed: CustomerFeedbackDto = {
  id: 1,
  restaurantId: "r-001",
  orderId: "ord-891",
  overallRating: 5,
  foodQualityRating: 5,
  serviceSpeedRating: 5,
  waiterFriendlinessRating: 5,
  comments: "Exquisite hand-made pasta! Marco took exceptional care of our dinner.",
  submittedAt: "2026-10-18T19:30:00Z",
  rewardType: "PercentageDiscount",
  rewardValue: 15,
  rewardDescription: "15% off your next visit",
  rewardCode: "LOYALTY-15-X9Y2",
  rewardRedeemed: true,
  redeemedAt: "2026-10-19T20:15:00Z",
  redeemedInOrderId: "ord-924",
};

const mockFeedbackAvailable: CustomerFeedbackDto = {
  id: 2,
  restaurantId: "r-001",
  orderId: "ord-885",
  overallRating: 4,
  foodQualityRating: 4,
  serviceSpeedRating: 3,
  waiterFriendlinessRating: 5,
  comments: "Delicious pizza with crispy crust. Slightly delayed kitchen.",
  submittedAt: "2026-10-18T14:15:00Z",
  rewardType: "ComplimentaryItem",
  rewardValue: null,
  rewardDescription: "Free Artisanal Dessert",
  rewardCode: "SWEET-TREAT-4K7L",
  rewardRedeemed: false,
  redeemedAt: null,
  redeemedInOrderId: null,
};

describe("FeedbackCard", () => {
  it("renders card content, star rating, breakdown, and passes axe check", async () => {
    const { container } = renderWithI18n(<FeedbackCard feedback={mockFeedbackRedeemed} />, "en");

    // Order ID
    expect(screen.getByText(/#ord-891/i)).toBeInTheDocument();

    // Overall rating
    expect(screen.getByText("5.0")).toBeInTheDocument();

    // Guest comment
    expect(
      screen.getByText(/Exquisite hand-made pasta! Marco took exceptional care/i),
    ).toBeInTheDocument();

    // Rating breakdown labels and values
    expect(screen.getByText("Food Quality")).toBeInTheDocument();
    expect(screen.getByText("Service Speed")).toBeInTheDocument();
    expect(screen.getByText("Staff Friendliness")).toBeInTheDocument();

    // Reward voucher code and description
    expect(screen.getByText("LOYALTY-15-X9Y2")).toBeInTheDocument();
    expect(screen.getByText("15% off your next visit")).toBeInTheDocument();

    // Redeemed status badge
    expect(screen.getByTestId("reward-redeemed-badge")).toHaveTextContent("Redeemed");
    expect(screen.getByText(/Redeemed in order ord-924/i)).toBeInTheDocument();

    // Accessibility
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders available voucher badge when not yet redeemed", () => {
    renderWithI18n(<FeedbackCard feedback={mockFeedbackAvailable} />, "en");

    expect(screen.getByText("SWEET-TREAT-4K7L")).toBeInTheDocument();
    expect(screen.getByText("Free Artisanal Dessert")).toBeInTheDocument();
    expect(screen.getByTestId("reward-available-badge")).toHaveTextContent("Available");
  });

  it("renders in Spanish locale", () => {
    renderWithI18n(<FeedbackCard feedback={mockFeedbackRedeemed} />, "es");

    expect(screen.getByText("Calidad de Alimentos")).toBeInTheDocument();
    expect(screen.getByText("Velocidad de Servicio")).toBeInTheDocument();
    expect(screen.getByText("Amabilidad del Personal")).toBeInTheDocument();
    expect(screen.getByTestId("reward-redeemed-badge")).toHaveTextContent("Redimido");
  });
});
