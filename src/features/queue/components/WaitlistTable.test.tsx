import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { WaitlistTable } from "./WaitlistTable";
import type { QueuePartyDto } from "../types/queue";

const mockQueue: QueuePartyDto[] = [
  {
    id: "q-1",
    restaurantId: "r-001",
    guestName: "Marco Rossi",
    partySize: 2,
    phone: "+1-555-0312",
    quotedWaitMinutes: 15,
    createdAt: new Date().toISOString(),
    status: "waiting",
  },
  {
    id: "q-2",
    restaurantId: "r-001",
    guestName: "Giulia Bianchi",
    partySize: 4,
    phone: "+1-555-0844",
    quotedWaitMinutes: 25,
    createdAt: new Date().toISOString(),
    status: "notified",
  },
];

describe("WaitlistTable", () => {
  it("renders queue entries with guest names, party sizes, and statuses", () => {
    renderWithI18n(
      <WaitlistTable queue={mockQueue} onNotify={vi.fn()} onSeat={vi.fn()} onCancel={vi.fn()} />,
      "en",
    );

    expect(screen.getByText("Marco Rossi")).toBeInTheDocument();
    expect(screen.getByText("Giulia Bianchi")).toBeInTheDocument();
    expect(screen.getAllByText(/Party of/i).length).toBe(2);
    expect(screen.getByText("Waiting")).toBeInTheDocument();
    expect(screen.getByText("SMS Notified")).toBeInTheDocument();
  });

  it("triggers notify and seat actions", async () => {
    const user = userEvent.setup();
    const handleNotify = vi.fn();
    const handleSeat = vi.fn();

    renderWithI18n(
      <WaitlistTable
        queue={mockQueue}
        onNotify={handleNotify}
        onSeat={handleSeat}
        onCancel={vi.fn()}
      />,
      "en",
    );

    const notifyBtn = screen.getByRole("button", { name: /Notify Marco Rossi/i });
    await user.click(notifyBtn);
    expect(handleNotify).toHaveBeenCalledWith(mockQueue[0]);

    const seatBtn = screen.getByRole("button", { name: /Seat Marco Rossi/i });
    await user.click(seatBtn);
    expect(handleSeat).toHaveBeenCalledWith(mockQueue[0]);
  });
});
