import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { axe } from "jest-axe";
import { store } from "../../../../app/store";
import { renderWithI18n } from "../../../../test/i18n-wrapper";
import { FeedbackPage } from "./FeedbackPage";

describe("FeedbackPage", () => {
  it("renders feedback portal, CSAT gauge, review cards from MSW, and passes axe check", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/feedback?restaurantId=r-001"]}>
          <FeedbackPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    // Initial heading
    expect(
      screen.getByRole("heading", { name: "Customer Feedback & Rewards" }),
    ).toBeInTheDocument();

    // Sentiment Gauge CSAT
    expect(
      screen.getByRole("heading", { name: "Overall Guest Satisfaction (CSAT)" }),
    ).toBeInTheDocument();

    // Wait for MSW feedback items to load
    await waitFor(() => {
      expect(screen.getByText(/#ord-891/i)).toBeInTheDocument();
      expect(screen.getByText(/#ord-885/i)).toBeInTheDocument();
      expect(screen.getByText(/#ord-815/i)).toBeInTheDocument();
    });

    // Check reward vouchers
    expect(screen.getByText("LOYALTY-15-X9Y2")).toBeInTheDocument();
    expect(screen.getByText("SWEET-TREAT-4K7L")).toBeInTheDocument();

    // Check accessibility
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("filters feedback reviews by star rating", async () => {
    const user = userEvent.setup();

    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/feedback?restaurantId=r-001"]}>
          <FeedbackPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText(/#ord-891/i)).toBeInTheDocument();
      expect(screen.getByText(/#ord-815/i)).toBeInTheDocument();
    });

    // Click "5 Stars" filter
    const fiveStarsRadio = screen.getByRole("radio", { name: /^5 Stars/i });
    await user.click(fiveStarsRadio);

    // 5-star reviews should remain, 1-star review should be hidden
    expect(screen.getByText(/#ord-891/i)).toBeInTheDocument();
    expect(screen.getByText(/#ord-885/i)).toBeInTheDocument();
    expect(screen.queryByText(/#ord-815/i)).not.toBeInTheDocument();
  });

  it("filters feedback reviews by voucher status", async () => {
    const user = userEvent.setup();

    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/feedback?restaurantId=r-001"]}>
          <FeedbackPage />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText(/#ord-891/i)).toBeInTheDocument();
      expect(screen.getByText(/#ord-885/i)).toBeInTheDocument();
    });

    // ord-891 has rewardRedeemed = true; ord-885 has rewardRedeemed = false
    const redeemedRadio = screen.getByRole("radio", { name: "Redeemed" });
    await user.click(redeemedRadio);

    expect(screen.getByText(/#ord-891/i)).toBeInTheDocument();
    expect(screen.queryByText(/#ord-885/i)).not.toBeInTheDocument();
  });

  it("renders correctly in Spanish locale", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/site/restaurant/feedback?restaurantId=r-001"]}>
          <FeedbackPage />
        </MemoryRouter>
      </Provider>,
      "es",
    );

    expect(
      screen.getByRole("heading", { name: "Opinión del Cliente y Recompensas" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Satisfacción General del Comensal (CSAT)" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/#ord-891/i)).toBeInTheDocument();
    });
  });
});
