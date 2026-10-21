/**
 * Order domain types matching Ordering microservice contracts.
 *
 * `OrderStatus` is the canonical order lifecycle. The StatusPill
 * component (a UI primitive) maps each status to a service-hue
 * gradient stop and an accessibility label.
 *
 * Backend OrderStatus values (BuildingBlocks.Enums.OrderStatus):
 *   Ordering, Pending, Confirmed, Preparing, Ready, Delivered, Completed, Cancelled, OnHold
 *
 * UI legacy alias lifecycle (per docs/website-spec.md §5.4):
 *   new          -> received, untouched (maps to Pending)
 *   acknowledged -> someone claimed it (maps to Confirmed)
 *   preparing    -> in progress
 *   plating      -> almost done
 *   ready        -> waiting to be served
 *   served       -> terminal state (maps to Delivered / Completed)
 */

export const BackendOrderStatus = {
  Ordering: "Ordering",
  Pending: "Pending",
  Confirmed: "Confirmed",
  Preparing: "Preparing",
  Ready: "Ready",
  Delivered: "Delivered",
  Completed: "Completed",
  Cancelled: "Cancelled",
  OnHold: "OnHold",
} as const;

export type BackendOrderStatus = (typeof BackendOrderStatus)[keyof typeof BackendOrderStatus];

export const OrderStatus = {
  New: "new",
  Acknowledged: "acknowledged",
  Preparing: "preparing",
  Plating: "plating",
  Ready: "ready",
  Served: "served",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderType = {
  DineIn: "DineIn",
  Takeout: "Takeout",
  Delivery: "Delivery",
} as const;

export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const DeliveryStatus = {
  Pending: "Pending",
  Dispatched: "Dispatched",
  Delivered: "Delivered",
} as const;

export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

export const PrepStatus = {
  Pending: "Pending",
  Preparing: "Preparing",
  Ready: "Ready",
} as const;

export type PrepStatus = (typeof PrepStatus)[keyof typeof PrepStatus];

export const PaymentMethod = {
  Cash: "Cash",
  CreditCard: "CreditCard",
  DebitCard: "DebitCard",
  DigitalWallet: "DigitalWallet",
  Other: "Other",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentDto {
  method: PaymentMethod;
  brand: string;
  lastFour: string;
}

export interface KitchenOrderItemCustomization {
  ingredient: string;
  action: string;
}

export interface KitchenOrderItemVariation {
  name: string;
  value: string;
  price: number;
}

export interface OrderItemDto {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  menuItemDescription: string;
  menuItemImageUrl: string;
  quantity: number;
  unitPrice: number;
  basePrice: number;
  totalPrice: number;
  seatNumber: number;
  specialInstructions: string;
  customizations: KitchenOrderItemCustomization[];
  selectedVariations: KitchenOrderItemVariation[];
  prepStatus: PrepStatus;
  createdAt: string;
  prepStartedAt: string | null;
  prepCompletedAt: string | null;
}

export type OrderActivityType =
  | "OrderCreated"
  | "OrderUpdated"
  | "OrderConfirmed"
  | "OrderPreparingStarted"
  | "OrderReady"
  | "OrderDeliveryStarted"
  | "OrderDelivered"
  | "OrderCompleted"
  | "OrderCancelled"
  | "OrderItemPrepStarted"
  | "OrderItemPrepCompleted";

export interface OrderActivityMetadataDto {
  reason?: string | null;
  orderItemId?: string | null;
  orderItemName?: string | null;
  previousOrderStatus?: BackendOrderStatus | null;
  newOrderStatus?: BackendOrderStatus | null;
  previousPrepStatus?: PrepStatus | null;
  newPrepStatus?: PrepStatus | null;
  previousDeliveryStatus?: DeliveryStatus | null;
  newDeliveryStatus?: DeliveryStatus | null;
}

export interface OrderActivityDto {
  id: string;
  activityType: OrderActivityType;
  actorUserId?: string | null;
  occurredAt: string;
  correlationId?: string | null;
  notes?: string | null;
  metadata?: OrderActivityMetadataDto | null;
}

export interface OrderDto {
  id: string;
  customerId: string;
  orderNumber: string;
  restaurantId: string;

  // Financials
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  discountCode: string;
  totalAmount: number;

  // Status & type
  status: BackendOrderStatus;
  orderType: OrderType;

  // Delivery
  billingAddress: AddressDto;
  deliveryAddress: AddressDto;
  deliveryNotes: string;
  deliveryStatus?: DeliveryStatus | null;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;

  // Payment
  payment: PaymentDto;

  // Prep timing
  estimatedPrepTimeMinutes: number;
  actualPrepTimeMinutes: number;

  // Flags
  isModified: boolean;
  requiresAdminApproval: boolean;

  // Optional references
  tableId?: string | null;
  createdByUserId?: string | null;
  approvedByAdminId?: string | null;
  confirmedByUserId?: string | null;
  completedByUserId?: string | null;

  // Lifecycle timestamps
  approvedAt?: string | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
  confirmedAt?: string | null;
  deliveredAt?: string | null;
  preparingStartedAt?: string | null;
  readyAt?: string | null;

  notes: string;
  orderItems: OrderItemDto[];
  activities: OrderActivityDto[];
}

export interface PaginatedResult<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}
