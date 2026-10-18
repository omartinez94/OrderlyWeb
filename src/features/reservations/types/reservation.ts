import type { ReservationDto, ReservationStatus } from "../../../types/catalog";

export type { ReservationDto, ReservationStatus };

export type MealPeriod = "all" | "lunch" | "dinner";

export interface CreateReservationFormData {
  guestName: string;
  partySize: number;
  reservationTime: string;
  contactPhone?: string;
  specialRequests?: string;
  tableNumber?: string;
  tableId?: string;
}
