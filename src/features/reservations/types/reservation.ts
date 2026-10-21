import { ReservationStatus, type ReservationDto } from "../../../types/catalog";

export { ReservationStatus };
export type { ReservationDto };

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
