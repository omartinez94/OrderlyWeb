import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { TicketCard, type TicketData } from "./TicketCard";

const sampleTicket: TicketData = {
  id: "ORD-1001",
  table: "Table 4",
  items: ["1x Margherita Pizza", "2x Sparkling Water"],
  status: "preparing",
  station: "Station 1",
  elapsed: 120,
  receivedAt: new Date(Date.now() - 120_000).toISOString(),
};

describe("TicketCard", () => {
  it("renders ticket card details and slot number badge", async () => {
    const { container } = renderWithI18n(
      <TicketCard ticket={sampleTicket} slotNumber={1} isSelected={false} />,
      "en",
    );

    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    expect(screen.getByText("Table 4")).toBeInTheDocument();
    expect(screen.getByText("Station 1")).toBeInTheDocument();
    expect(screen.getByText("1x Margherita Pizza")).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders hotkey action indicators when selected", () => {
    renderWithI18n(<TicketCard ticket={sampleTicket} slotNumber={2} isSelected={true} />, "en");

    expect(screen.getByText(/\[ENTER: Bump\]/i)).toBeInTheDocument();
    expect(screen.getByText(/\[R: Recall\]/i)).toBeInTheDocument();
  });

  it("calls onBump and onRecall when action buttons are clicked", async () => {
    const user = userEvent.setup();
    const onBump = vi.fn();
    const onRecall = vi.fn();

    renderWithI18n(
      <TicketCard
        ticket={sampleTicket}
        slotNumber={1}
        isSelected={true}
        onBump={onBump}
        onRecall={onRecall}
      />,
      "en",
    );

    const bumpBtn = screen.getByRole("button", { name: /Bump ticket ORD-1001/i });
    await user.click(bumpBtn);
    expect(onBump).toHaveBeenCalled();

    const recallBtn = screen.getByRole("button", { name: /Recall ticket ORD-1001/i });
    await user.click(recallBtn);
    expect(onRecall).toHaveBeenCalled();
  });
});
