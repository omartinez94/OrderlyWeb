import { describe, expect, it, vi } from "vitest";
import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { store } from "../../../app/store";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { KdsTicketGrid } from "./KdsTicketGrid";
import type { TicketData } from "./TicketCard";

const makeTickets = (count: number): TicketData[] =>
  Array.from({ length: count }, (_, idx) => ({
    id: `ORD-200${idx + 1}`,
    table: `Table ${idx + 1}`,
    items: [`1x Item ${idx + 1}`],
    status: "preparing",
    station: "Line 1",
    elapsed: 60,
    receivedAt: new Date(Date.now() - 60_000).toISOString(),
  }));

describe("KdsTicketGrid", () => {
  it("renders empty state when there are no active tickets", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <KdsTicketGrid tickets={[]} />
      </Provider>,
      "en",
    );

    expect(screen.getByText("No active orders. Great work!")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders up to 8 tickets per page with slot badges #1 to #8", async () => {
    const tickets = makeTickets(8);
    const { container } = renderWithI18n(
      <Provider store={store}>
        <KdsTicketGrid tickets={tickets} />
      </Provider>,
      "en",
    );

    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`#${i}`)).toBeInTheDocument();
      expect(screen.getByText(`ORD-200${i}`)).toBeInTheDocument();
    }
    expect(screen.getByText("Page 1 / 1")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("paginates tickets when more than 8 tickets exist", async () => {
    const user = userEvent.setup();
    const tickets = makeTickets(12);

    renderWithI18n(
      <Provider store={store}>
        <KdsTicketGrid tickets={tickets} />
      </Provider>,
      "en",
    );

    expect(screen.getByText("Page 1 / 2")).toBeInTheDocument();
    expect(screen.getByText("ORD-2001")).toBeInTheDocument();
    expect(screen.queryByText("ORD-2009")).not.toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: /Next Page/i });
    await user.click(nextBtn);

    expect(screen.getByText("Page 2 / 2")).toBeInTheDocument();
    expect(screen.getByText("ORD-2009")).toBeInTheDocument();
    expect(screen.getByText("ORD-20012")).toBeInTheDocument();
  });

  it("selects slot on numeric key press and bumps on Enter", async () => {
    const onBump = vi.fn();
    const tickets = makeTickets(4);

    renderWithI18n(
      <Provider store={store}>
        <KdsTicketGrid tickets={tickets} onBumpOrder={onBump} />
      </Provider>,
      "en",
    );

    // Press key "2" to select slot 2
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Digit2", key: "2" }));
    });

    // Press Enter to bump the focused slot 2 (ORD-2002)
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", key: "Enter" }));
    });

    expect(onBump).toHaveBeenCalledWith("ORD-2002");
  });

  it("navigates slots with arrow keys and bumps on Enter", async () => {
    const onBump = vi.fn();
    const tickets = makeTickets(4);

    renderWithI18n(
      <Provider store={store}>
        <KdsTicketGrid tickets={tickets} onBumpOrder={onBump} />
      </Provider>,
      "en",
    );

    // Press ArrowRight to move from slot 1 to slot 2
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", key: "ArrowRight" }));
    });

    // Press Enter to bump the focused slot 2 (ORD-2002)
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Enter", key: "Enter" }));
    });

    expect(onBump).toHaveBeenCalledWith("ORD-2002");
  });
});
