/**
 * Kitchen Service domain & DTO types.
 *
 * Aligned with Kitchen.API (.NET 10 Minimal APIs & Carter).
 */

import type { PaginatedResult } from "./order";

export type KitchenTicketStatus = "New" | "InProgress" | "Ready" | "Bumped" | "Cancelled";

export type KitchenItemStatus = "Pending" | "Preparing" | "Ready";

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
