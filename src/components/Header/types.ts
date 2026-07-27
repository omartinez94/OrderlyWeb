/**
 * Shared types for the Header component and its slots.
 * Mirrors the shape of values the runtime will eventually source from
 * Redux, RTK Query, and the SignalR /notifications hub. The Header is
 * built as a controlled component today (props in, callbacks out) so
 * the wiring layer is a follow-up.
 */

export type Zone = "admin" | "kitchen" | "restaurant";

export type RestaurantRole = "Owner" | "Manager" | "Staff";

export interface Restaurant {
  id: string;
  name: string;
  role: RestaurantRole;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  /** ISO timestamp. Rendered in mono as a measurement. */
  timestamp: string;
  read: boolean;
}

/** Count of orders in progress, scoped by zone.
 * - restaurant zone: acknowledged + preparing + plating across all tables
 * - kitchen zone: preparing + plating + ready (in-kitchen lens)
 * - admin zone: not surfaced (component hides the badge)
 */
export interface OpsCount {
  inProgress: number;
}
