import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { axe } from "jest-axe";
import { Provider } from "react-redux";
import { store } from "../../../app/store";
import { server } from "../../../test/server";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { KdsTicketGrid } from "./KdsTicketGrid";
import type { TicketData } from "./TicketCard";
import { OrderStatus } from "../../../types/order";
import {
  KitchenTicketStatus,
  KitchenItemStatus,
  type KitchenTicketDto,
} from "../../../types/kitchen";

const makeTickets = (count: number): TicketData[] =>
  Array.from({ length: count }, (_, idx) => ({
    id: `ORD-200${idx + 1}`,
    table: `Table ${idx + 1}`,
    items: [`1x Item ${idx + 1}`],
    status: OrderStatus.Preparing,
    station: "Line 1",
    elapsed: 60,
    receivedAt: new Date(Date.now() - 60_000).toISOString(),
  }));

describe("KdsTicketGrid", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
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

  it("starts pending items before marking them ready when advancing an in-progress ticket", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];

    server.use(
      http.post(
        "http://localhost:6004/kitchen-api/v1/kitchen/tickets/:id/items/:itemId/start",
        ({ params }) => {
          calls.push(`start:${params.itemId}`);
          return new HttpResponse(null, { status: 204 });
        },
      ),
      http.post(
        "http://localhost:6004/kitchen-api/v1/kitchen/tickets/:id/items/:itemId/ready",
        ({ params }) => {
          calls.push(`ready:${params.itemId}`);
          return new HttpResponse(null, { status: 204 });
        },
      ),
      http.post("http://localhost:6004/kitchen-api/v1/kitchen/tickets/:id/mark-ready", () => {
        calls.push("ticket:mark-ready");
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const ticketWithPendingItem: KitchenTicketDto = {
      id: "ticket-pending-1",
      restaurantId: "r-1",
      customerId: "c-1",
      orderNumber: "ORD-9999",
      status: KitchenTicketStatus.InProgress,
      receivedAt: new Date().toISOString(),
      notes: "",
      estimatedPrepTimeMinutes: 15,
      items: [
        {
          id: "item-p-1",
          orderItemId: "oi-1",
          menuItemId: "mi-1",
          menuItemName: "Burger",
          quantity: 1,
          unitPrice: 10,
          selectedVariations: [],
          customizations: [],
          status: KitchenItemStatus.Pending,
        },
      ],
    };

    renderWithI18n(
      <Provider store={store}>
        <KdsTicketGrid tickets={[ticketWithPendingItem]} />
      </Provider>,
      "en",
    );

    const markReadyBtn = screen.getByRole("button", { name: /Mark Ready/i });
    await user.click(markReadyBtn);

    await waitFor(() => {
      expect(calls).toEqual(["start:item-p-1", "ready:item-p-1", "ticket:mark-ready"]);
    });
  });

  it("guards against recalling tickets that are still active on the display", async () => {
    const calls: string[] = [];

    server.use(
      http.post("http://localhost:6004/kitchen-api/v1/kitchen/tickets/:id/recall", ({ params }) => {
        calls.push(`recall:${params.id}`);
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const readyTicket: TicketData = {
      id: "ticket-ready-1",
      table: "Table 1",
      items: ["1x Burger"],
      status: OrderStatus.Ready,
      station: "Line 1",
      elapsed: 60,
    };

    renderWithI18n(
      <Provider store={store}>
        <KdsTicketGrid tickets={[readyTicket]} />
      </Provider>,
      "en",
    );

    // Recall Last button should initially be disabled because no ticket was bumped
    const recallBtn = screen.getByRole("button", { name: /Recall last bumped ticket/i });
    expect(recallBtn).toBeDisabled();

    // Triggering KeyR shortcut directly should not call recall on active ticket
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyR", key: "r" }));
    });

    expect(calls).toHaveLength(0);
  });

  it("allows recall only after a ticket has actually been bumped", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];

    server.use(
      http.post("http://localhost:6004/kitchen-api/v1/kitchen/tickets/:id/bump", ({ params }) => {
        calls.push(`bump:${params.id}`);
        return new HttpResponse(null, { status: 204 });
      }),
      http.post("http://localhost:6004/kitchen-api/v1/kitchen/tickets/:id/recall", ({ params }) => {
        calls.push(`recall:${params.id}`);
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const readyTicket: TicketData = {
      id: "ticket-ready-2",
      table: "Table 2",
      items: ["1x Fries"],
      status: OrderStatus.Ready,
      station: "Line 1",
      elapsed: 30,
    };

    const { rerender } = renderWithI18n(
      <Provider store={store}>
        <KdsTicketGrid tickets={[readyTicket]} />
      </Provider>,
      "en",
    );

    const bumpBtn = screen.getByRole("button", { name: /Bump ticket ticket-ready-2/i });
    await user.click(bumpBtn);

    await waitFor(() => {
      expect(calls).toEqual(["bump:ticket-ready-2"]);
    });

    // Once bumped, server returns empty queue
    rerender(
      <Provider store={store}>
        <KdsTicketGrid tickets={[]} />
      </Provider>,
    );

    const recallBtn = screen.getByRole("button", { name: /Recall last bumped ticket/i });
    expect(recallBtn).not.toBeDisabled();
    await user.click(recallBtn);

    await waitFor(() => {
      expect(calls).toEqual(["bump:ticket-ready-2", "recall:ticket-ready-2"]);
    });
  });
});
