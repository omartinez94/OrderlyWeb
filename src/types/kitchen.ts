/**
 * Kitchen Service domain & DTO types.
 *
 * Aligned with Kitchen.API (.NET 10 Minimal APIs & Carter).
 */

import type { PaginatedResult } from "./order";

export const KitchenTicketStatus = {
  New: "New",
  InProgress: "InProgress",
  Ready: "Ready",
  Bumped: "Bumped",
  Cancelled: "Cancelled",
} as const;

export type KitchenTicketStatus = (typeof KitchenTicketStatus)[keyof typeof KitchenTicketStatus];

export const KitchenItemStatus = {
  Pending: "Pending",
  Preparing: "Preparing",
  Ready: "Ready",
} as const;

export type KitchenItemStatus = (typeof KitchenItemStatus)[keyof typeof KitchenItemStatus];

export interface KitchenTicketItemDto {
  id: string;
  orderItemId: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  selectedVariations: string[];
  customizations: string[];
  specialInstructions?: string | null;
  seatNumber?: number | null;
  status: KitchenItemStatus;
  startedAt?: string | null;
  readyAt?: string | null;
  stationId?: string | null;
}

export interface KitchenTicketDto {
  id: string;
  restaurantId: string;
  customerId: string;
  orderNumber: string;
  status: KitchenTicketStatus;
  receivedAt: string;
  startedAt?: string | null;
  readyAt?: string | null;
  bumpedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  confirmedByUserId?: string | null;
  cancelledByUserId?: string | null;
  notes: string;
  estimatedPrepTimeMinutes: number;
  items: KitchenTicketItemDto[];
}

export interface KitchenStationDto {
  id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export type KitchenQueueResponse = PaginatedResult<KitchenTicketDto>;
