/**
 * Catalog domain types matching Catalog.API contracts.
 */

export interface CatalogRestaurant {
  id: string;
  name: string;
  cuisine: string;
  city: string;
  country: string;
  active: boolean;
}

export type CuisineType = "Italian" | "Mexican" | "Japanese" | "American" | "Other";

export interface CatalogBrand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  contactEmail: string;
  contactPhone: string | null;
  cuisineType: CuisineType;
  websiteUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const RestaurantStatus = {
  Active: "active",
  Inactive: "inactive",
  Archived: "archived",
} as const;

export type RestaurantStatus = (typeof RestaurantStatus)[keyof typeof RestaurantStatus];

export interface OperatingHoursDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  open: string | null;
  close: string | null;
}

export interface AdminRestaurantAddress {
  line1: string;
  line2?: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface AdminRestaurantDetail extends CatalogRestaurant {
  brandId: string;
  ownerId: string | null;
  address: AdminRestaurantAddress;
  phone: string | null;
  email: string | null;
  timezone: string;
  currency: string;
  taxRate: number;
  operatingHours: OperatingHoursDay[];
  estimatedTurnoverMinutes: number;
  autoConfirmReservations: boolean;
  autoConfirmOrders: boolean;
  allowAutoSubstitute: boolean;
  status: RestaurantStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettings {
  defaultTimezone: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  reservationReminderMinutes: number;
  maxReservationPartySize: number;
  enableAutoSubstitute: boolean;
  emailFromAddress: string;
  supportContactUrl: string;
  featureFlags: Record<string, boolean>;
}

export const TableStatus = {
  Available: "Available",
  Occupied: "Occupied",
  Reserved: "Reserved",
  NeedsCleaning: "Needs Cleaning",
} as const;

export type TableStatus = (typeof TableStatus)[keyof typeof TableStatus];

export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: string;
  label?: string; // fallback/alias
  capacity: number;
  positionX?: number;
  positionY?: number;
  shape?: string;
  status?: TableStatus;
  currentOrderId?: string | null;
  section?: string;
}

export interface MergedTableDto {
  id: string;
  parentTableId: string;
  childTableId: string;
  isActive: boolean;
  mergedAt: string;
  splitAt?: string | null;
}

export const ReservationStatus = {
  Pending: "pending",
  Confirmed: "confirmed",
  Seated: "seated",
  Cancelled: "cancelled",
} as const;

export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export interface ReservationDto {
  id: string;
  restaurantId: string;
  guestName: string;
  partySize: number;
  reservationTime: string;
  tableNumber?: string | null;
  tableId?: string | null;
  status: ReservationStatus;
  specialRequests?: string | null;
  contactPhone?: string | null;
  createdAt: string;
}

export const QueuePartyStatus = {
  Waiting: "waiting",
  Notified: "notified",
  Seated: "seated",
  Cancelled: "cancelled",
} as const;

export type QueuePartyStatus = (typeof QueuePartyStatus)[keyof typeof QueuePartyStatus];

export interface QueuePartyDto {
  id: string;
  restaurantId: string;
  guestName: string;
  partySize: number;
  phone: string;
  quotedWaitMinutes: number;
  createdAt: string;
  status: QueuePartyStatus;
  notifiedAt?: string | null;
  seatedAt?: string | null;
  allocatedTableId?: string | null;
  allocatedTableNumber?: string | null;
}

export const MenuItemStatus = {
  Available: "available",
  SoldOut: "sold_out",
  Hidden: "hidden",
} as const;

export type MenuItemStatus = (typeof MenuItemStatus)[keyof typeof MenuItemStatus];

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  priceCents: number;
  status: MenuItemStatus;
  description?: string;
  imageUrl?: string;
  ingredientWarning?: string;
  autoSubstituted?: boolean;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  position: number;
}

export type AuditEntityType = "brand" | "restaurant" | "staff";

export interface AdminAuditEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  actorId: string;
  actorName: string;
  action: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  timestamp: string;
  reason?: string;
}
