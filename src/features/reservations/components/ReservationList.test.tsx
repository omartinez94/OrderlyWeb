import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { ReservationList } from "./ReservationList";
import type { ReservationDto } from "../types/reservation";

const mockReservations: ReservationDto[] = [
  {
    id: "res-1",
    restaurantId: "r-001",
    guestName: "Sophia Loren",
    partySize: 4,
    reservationTime: "2026-10-18T19:30:00Z",
    tableNumber: "T3",
    tableId: "t-3",
    status: "confirmed",
    specialRequests: "Anniversary table near window",
    contactPhone: "+1-555-0199",
    createdAt: "2026-10-17T12:00:00Z",
  },
  {
    id: "res-2",
    restaurantId: "r-001",
    guestName: "Alessandro Volta",
    partySize: 2,
    reservationTime: "2026-10-18T20:00:00Z",
    tableNumber: null,
    tableId: null,
    status: "pending",
    contactPhone: "+1-555-0245",
    createdAt: "2026-10-18T09:00:00Z",
  },
];

describe("ReservationList", () => {
  it("renders reservations with guest names, times, and actions", () => {
    renderWithI18n(
      <ReservationList
        reservations={mockReservations}
        selectedMealPeriod="all"
        onSelectMealPeriod={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        onCheckIn={vi.fn()}
        onSeat={vi.fn()}
        onCancel={vi.fn()}
      />,
      "en",
    );

    expect(screen.getByText("Sophia Loren")).toBeInTheDocument();
    expect(screen.getByText("Alessandro Volta")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Pending Check-In")).toBeInTheDocument();
    expect(screen.getByText("Anniversary table near window")).toBeInTheDocument();
  });

  it("triggers checkIn and seat callbacks", async () => {
    const user = userEvent.setup();
    const handleCheckIn = vi.fn();
    const handleSeat = vi.fn();

    renderWithI18n(
      <ReservationList
        reservations={mockReservations}
        selectedMealPeriod="all"
        onSelectMealPeriod={vi.fn()}
        searchQuery=""
        onSearchChange={vi.fn()}
        onCheckIn={handleCheckIn}
        onSeat={handleSeat}
        onCancel={vi.fn()}
      />,
      "en",
    );

    const checkInBtn = screen.getByRole("button", { name: /Check In/i });
    await user.click(checkInBtn);
    expect(handleCheckIn).toHaveBeenCalledWith(mockReservations[1]);

    const seatBtn = screen.getByRole("button", { name: /Seat Party/i });
    await user.click(seatBtn);
    expect(handleSeat).toHaveBeenCalledWith(mockReservations[0]);
  });
});
