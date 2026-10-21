/**
 * MSW handlers for the Catalog Service (Restaurants, Tables, MergedTables, Menu, Reservations, Queue).
 */

import { http, HttpResponse } from "msw";
import type {
  Table,
  ReservationDto,
  QueuePartyDto,
  CatalogBrand,
  AdminAuditEntry,
  AdminRestaurantDetail,
  AdminSettings,
} from "../../types/catalog";
import type { GetMenuItemAnalyticsResponse } from "../../types/analytics";
import type { CustomerFeedbackDto } from "../../types/feedback";

const BASE = "http://localhost:6004/catalog-api";

export let mockBrands: CatalogBrand[] = [
  {
    id: "b-001",
    name: "Acme Hospitality Group",
    slug: "acme-hospitality",
    description: "Premier dining and casual bistro experiences across the East Coast.",
    logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=128&q=80",
    contactEmail: "contact@acme.com",
    contactPhone: "+1 (555) 019-2834",
    cuisineType: "Italian",
    websiteUrl: "https://acme-hospitality.example.com",
    active: true,
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-06-20T12:00:00Z",
  },
  {
    id: "b-002",
    name: "Cantina Del Sol",
    slug: "cantina-del-sol",
    description: "Authentic wood-fired regional Mexican culinary collective.",
    logoUrl: null,
    contactEmail: "hola@cantinadelsol.com",
    contactPhone: "+1 (555) 782-9911",
    cuisineType: "Mexican",
    websiteUrl: "https://cantinadelsol.example.com",
    active: true,
    createdAt: "2026-02-01T10:30:00Z",
    updatedAt: "2026-07-10T14:15:00Z",
  },
  {
    id: "b-003",
    name: "Sakura Omakase",
    slug: "sakura-omakase",
    description: "Traditional Edomae sushi and artisanal Japanese sake lounge.",
    logoUrl: null,
    contactEmail: "reservations@sakuraomakase.com",
    contactPhone: "+1 (555) 431-8890",
    cuisineType: "Japanese",
    websiteUrl: "https://sakuraomakase.example.com",
    active: false,
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-05-18T16:45:00Z",
  },
];

export let mockAdminRestaurants: AdminRestaurantDetail[] = [
  {
    id: "r-001",
    brandId: "b-001",
    name: "Acme Bistro — Downtown",
    cuisine: "Italian",
    city: "Brooklyn",
    country: "US",
    active: true,
    status: "active",
    ownerId: "u-admin",
    address: {
      line1: "123 Main St",
      line2: "Suite 4B",
      city: "Brooklyn",
      region: "NY",
      postalCode: "11201",
      country: "US",
    },
    phone: "+1 (555) 019-2834",
    email: "downtown@acme.com",
    timezone: "America/New_York",
    currency: "USD",
    taxRate: 0.08875,
    estimatedTurnoverMinutes: 90,
    autoConfirmReservations: true,
    autoConfirmOrders: true,
    allowAutoSubstitute: false,
    operatingHours: [
      { dayOfWeek: 0, open: "10:00", close: "22:00" },
      { dayOfWeek: 1, open: "11:00", close: "22:00" },
      { dayOfWeek: 2, open: "11:00", close: "22:00" },
      { dayOfWeek: 3, open: "11:00", close: "22:00" },
      { dayOfWeek: 4, open: "11:00", close: "23:00" },
      { dayOfWeek: 5, open: "11:00", close: "23:00" },
      { dayOfWeek: 6, open: "10:00", close: "23:00" },
    ],
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-06-15T14:30:00Z",
  },
  {
    id: "r-002",
    brandId: "b-001",
    name: "Acme Bistro — Marina",
    cuisine: "Italian",
    city: "San Francisco",
    country: "US",
    active: true,
    status: "active",
    ownerId: "u-admin",
    address: {
      line1: "456 Marina Blvd",
      line2: null,
      city: "San Francisco",
      region: "CA",
      postalCode: "94123",
      country: "US",
    },
    phone: "+1 (555) 782-9911",
    email: "marina@acme.com",
    timezone: "America/Los_Angeles",
    currency: "USD",
    taxRate: 0.085,
    estimatedTurnoverMinutes: 75,
    autoConfirmReservations: false,
    autoConfirmOrders: true,
    allowAutoSubstitute: true,
    operatingHours: [
      { dayOfWeek: 0, open: "11:00", close: "21:00" },
      { dayOfWeek: 1, open: null, close: null },
      { dayOfWeek: 2, open: "11:00", close: "21:00" },
      { dayOfWeek: 3, open: "11:00", close: "21:00" },
      { dayOfWeek: 4, open: "11:00", close: "22:00" },
      { dayOfWeek: 5, open: "11:00", close: "22:00" },
      { dayOfWeek: 6, open: "11:00", close: "22:00" },
    ],
    createdAt: "2026-03-01T11:00:00Z",
    updatedAt: "2026-07-01T09:15:00Z",
  },
];

export let mockAdminSettings: AdminSettings = {
  defaultTimezone: "America/New_York",
  defaultCurrency: "USD",
  defaultTaxRate: 0.08875,
  reservationReminderMinutes: 60,
  maxReservationPartySize: 12,
  enableAutoSubstitute: true,
  emailFromAddress: "noreply@orderly.hospitality.com",
  supportContactUrl: "https://support.orderly.hospitality.com",
  featureFlags: {
    kdsAudioEnabled: true,
    splitBillEnabled: true,
    virtualBumpBarEnabled: true,
    tableMergeEnabled: true,
  },
};

export let mockAuditEntries: AdminAuditEntry[] = [
  {
    id: "audit-c-1",
    entityType: "brand",
    entityId: "b-001",
    actorId: "u-admin",
    actorName: "Maya Okafor",
    action: "create",
    before: null,
    after: { name: "Acme Hospitality Group", slug: "acme-hospitality" },
    timestamp: "2026-01-15T08:00:00Z",
    reason: "Initial brand creation",
  },
  {
    id: "audit-c-2",
    entityType: "brand",
    entityId: "b-001",
    actorId: "u-admin",
    actorName: "Maya Okafor",
    action: "update",
    before: { contactPhone: null },
    after: { contactPhone: "+1 (555) 019-2834" },
    timestamp: "2026-06-20T12:00:00Z",
  },
  {
    id: "audit-c-3",
    entityType: "brand",
    entityId: "b-003",
    actorId: "u-admin",
    actorName: "Maya Okafor",
    action: "archive",
    before: { active: true },
    after: { active: false },
    timestamp: "2026-05-18T16:45:00Z",
    reason: "Location closed indefinitely",
  },
  {
    id: "audit-c-4",
    entityType: "restaurant",
    entityId: "r-001",
    actorId: "u-admin",
    actorName: "Alex Rivera",
    action: "create",
    before: null,
    after: { name: "Acme Bistro — Downtown" },
    timestamp: "2026-02-10T09:00:00Z",
  },
  {
    id: "audit-s-1",
    entityType: "staff",
    entityId: "s-001",
    actorId: "u-system",
    actorName: "System",
    action: "create",
    before: null,
    after: { name: "Maya Okafor", roles: ["Manager"] },
    timestamp: "2026-03-01T10:00:00Z",
  },
  {
    id: "audit-s-2",
    entityType: "staff",
    entityId: "s-001",
    actorId: "u-admin",
    actorName: "Maya Okafor",
    action: "role-grant",
    before: { roles: [] },
    after: { roles: ["Manager"] },
    timestamp: "2026-03-02T10:00:00Z",
  },
  {
    id: "audit-s-3",
    entityType: "staff",
    entityId: "s-001",
    actorId: "u-admin",
    actorName: "Maya Okafor",
    action: "restaurant-assign",
    before: { restaurantIds: ["r-001"] },
    after: { restaurantIds: ["r-001", "r-002"] },
    timestamp: "2026-03-03T10:00:00Z",
  },
  {
    id: "audit-s-4",
    entityType: "staff",
    entityId: "s-001",
    actorId: "u-admin",
    actorName: "Maya Okafor",
    action: "deactivate",
    before: { active: true },
    after: { active: false },
    timestamp: "2026-03-04T10:00:00Z",
  },
  {
    id: "audit-s-5",
    entityType: "staff",
    entityId: "s-001",
    actorId: "u-admin",
    actorName: "Maya Okafor",
    action: "reactivate",
    before: { active: false },
    after: { active: true },
    timestamp: "2026-03-05T10:00:00Z",
  },
];

export const mockMenuCategories = [
  { id: "c-pizza", restaurantId: "r-001", name: "Pizza", position: 1 },
  { id: "c-pasta", restaurantId: "r-001", name: "Pasta", position: 2 },
  { id: "c-drinks", restaurantId: "r-001", name: "Beverages", position: 3 },
];

export let mockMenuItems = [
  {
    id: "m-1",
    restaurantId: "r-001",
    categoryId: "c-pizza",
    name: "Margherita",
    priceCents: 1400,
    status: "available",
    description: "San Marzano tomatoes, fresh mozzarella, basil",
  },
  {
    id: "m-2",
    restaurantId: "r-001",
    categoryId: "c-pizza",
    name: "Pepperoni Piccante",
    priceCents: 1650,
    status: "sold_out",
    description: "Spicy pepperoni, mozzarella, chili honey",
    ingredientWarning: "Pepperoni low stock",
  },
  {
    id: "m-3",
    restaurantId: "r-001",
    categoryId: "c-pasta",
    name: "Rigatoni Carbonara",
    priceCents: 1800,
    status: "available",
    description: "Guanciale, pecorino romano, egg yolk",
    autoSubstituted: true,
  },
  {
    id: "m-4",
    restaurantId: "r-001",
    categoryId: "c-drinks",
    name: "San Pellegrino",
    priceCents: 450,
    status: "available",
    description: "Sparkling natural mineral water",
  },
];

export let mockTables: Table[] = [
  {
    id: "t-1",
    restaurantId: "r-001",
    tableNumber: "T1",
    capacity: 2,
    positionX: 10,
    positionY: 20,
    shape: "square",
    status: "Available",
    section: "Window",
  },
  {
    id: "t-2",
    restaurantId: "r-001",
    tableNumber: "T2",
    capacity: 4,
    positionX: 30,
    positionY: 20,
    shape: "round",
    status: "Occupied",
    currentOrderId: "ORD-2026-0001",
    section: "Main Floor",
  },
  {
    id: "t-3",
    restaurantId: "r-001",
    tableNumber: "T3",
    capacity: 6,
    positionX: 50,
    positionY: 20,
    shape: "booth",
    status: "Reserved",
    section: "Main Floor",
  },
  {
    id: "t-4",
    restaurantId: "r-001",
    tableNumber: "T4",
    capacity: 4,
    positionX: 70,
    positionY: 20,
    shape: "square",
    status: "Needs Cleaning",
    section: "Patio",
  },
  {
    id: "t-5",
    restaurantId: "r-001",
    tableNumber: "T5",
    capacity: 2,
    positionX: 10,
    positionY: 50,
    shape: "square",
    status: "Available",
    section: "Window",
  },
  {
    id: "t-6",
    restaurantId: "r-001",
    tableNumber: "T6",
    capacity: 8,
    positionX: 30,
    positionY: 50,
    shape: "long",
    status: "Available",
    section: "Patio",
  },
];

export let mockMergedTables = [
  {
    id: "mt-1",
    parentTableId: "t-1",
    childTableId: "t-5",
    isActive: true,
    mergedAt: "2026-07-28T10:00:00Z",
    splitAt: null,
  },
];

export let mockReservations: ReservationDto[] = [
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
    specialRequests: "Quiet booth if possible",
    contactPhone: "+1-555-0245",
    createdAt: "2026-10-18T09:00:00Z",
  },
];

export let mockQueueParties: QueuePartyDto[] = [
  {
    id: "q-1",
    restaurantId: "r-001",
    guestName: "Marco Rossi",
    partySize: 2,
    phone: "+1-555-0312",
    quotedWaitMinutes: 15,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: "waiting",
  },
  {
    id: "q-2",
    restaurantId: "r-001",
    guestName: "Giulia Bianchi",
    partySize: 4,
    phone: "+1-555-0844",
    quotedWaitMinutes: 25,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: "notified",
    notifiedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

export const resetMockCatalogState = () => {
  mockMenuItems = [
    {
      id: "m-1",
      restaurantId: "r-001",
      categoryId: "c-pizza",
      name: "Margherita",
      priceCents: 1400,
      status: "available",
      description: "San Marzano tomatoes, fresh mozzarella, basil",
    },
    {
      id: "m-2",
      restaurantId: "r-001",
      categoryId: "c-pizza",
      name: "Pepperoni Piccante",
      priceCents: 1650,
      status: "sold_out",
      description: "Spicy pepperoni, mozzarella, chili honey",
      ingredientWarning: "Pepperoni low stock",
    },
    {
      id: "m-3",
      restaurantId: "r-001",
      categoryId: "c-pasta",
      name: "Rigatoni Carbonara",
      priceCents: 1800,
      status: "available",
      description: "Guanciale, pecorino romano, egg yolk",
      autoSubstituted: true,
    },
    {
      id: "m-4",
      restaurantId: "r-001",
      categoryId: "c-drinks",
      name: "San Pellegrino",
      priceCents: 450,
      status: "available",
      description: "Sparkling natural mineral water",
    },
  ];

  mockTables = [
    {
      id: "t-1",
      restaurantId: "r-001",
      tableNumber: "T1",
      capacity: 2,
      positionX: 10,
      positionY: 20,
      shape: "square",
      status: "Available",
      section: "Window",
    },
    {
      id: "t-2",
      restaurantId: "r-001",
      tableNumber: "T2",
      capacity: 4,
      positionX: 30,
      positionY: 20,
      shape: "round",
      status: "Occupied",
      currentOrderId: "ORD-2026-0001",
      section: "Main Floor",
    },
    {
      id: "t-3",
      restaurantId: "r-001",
      tableNumber: "T3",
      capacity: 6,
      positionX: 50,
      positionY: 20,
      shape: "booth",
      status: "Reserved",
      section: "Main Floor",
    },
    {
      id: "t-4",
      restaurantId: "r-001",
      tableNumber: "T4",
      capacity: 4,
      positionX: 70,
      positionY: 20,
      shape: "square",
      status: "Needs Cleaning",
      section: "Patio",
    },
    {
      id: "t-5",
      restaurantId: "r-001",
      tableNumber: "T5",
      capacity: 2,
      positionX: 10,
      positionY: 50,
      shape: "square",
      status: "Available",
      section: "Window",
    },
    {
      id: "t-6",
      restaurantId: "r-001",
      tableNumber: "T6",
      capacity: 8,
      positionX: 30,
      positionY: 50,
      shape: "long",
      status: "Available",
      section: "Patio",
    },
  ];

  mockMergedTables = [
    {
      id: "mt-1",
      parentTableId: "t-1",
      childTableId: "t-5",
      isActive: true,
      mergedAt: "2026-07-28T10:00:00Z",
      splitAt: null,
    },
  ];

  mockBrands = [
    {
      id: "b-001",
      name: "Acme Hospitality Group",
      slug: "acme-hospitality",
      description: "Premier dining and casual bistro experiences across the East Coast.",
      logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=128&q=80",
      contactEmail: "contact@acme.com",
      contactPhone: "+1 (555) 019-2834",
      cuisineType: "Italian",
      websiteUrl: "https://acme-hospitality.example.com",
      active: true,
      createdAt: "2026-01-15T08:00:00Z",
      updatedAt: "2026-06-20T12:00:00Z",
    },
    {
      id: "b-002",
      name: "Cantina Del Sol",
      slug: "cantina-del-sol",
      description: "Authentic wood-fired regional Mexican culinary collective.",
      logoUrl: null,
      contactEmail: "hola@cantinadelsol.com",
      contactPhone: "+1 (555) 782-9911",
      cuisineType: "Mexican",
      websiteUrl: "https://cantinadelsol.example.com",
      active: true,
      createdAt: "2026-02-01T10:30:00Z",
      updatedAt: "2026-07-10T14:15:00Z",
    },
    {
      id: "b-003",
      name: "Sakura Omakase",
      slug: "sakura-omakase",
      description: "Traditional Edomae sushi and artisanal Japanese sake lounge.",
      logoUrl: null,
      contactEmail: "reservations@sakuraomakase.com",
      contactPhone: "+1 (555) 431-8890",
      cuisineType: "Japanese",
      websiteUrl: "https://sakuraomakase.example.com",
      active: false,
      createdAt: "2026-03-10T09:00:00Z",
      updatedAt: "2026-05-18T16:45:00Z",
    },
  ];

  mockAuditEntries = [
    {
      id: "audit-c-1",
      entityType: "brand",
      entityId: "b-001",
      actorId: "u-admin",
      actorName: "Maya Okafor",
      action: "create",
      before: null,
      after: { name: "Acme Hospitality Group", slug: "acme-hospitality" },
      timestamp: "2026-01-15T08:00:00Z",
      reason: "Initial brand creation",
    },
    {
      id: "audit-c-2",
      entityType: "brand",
      entityId: "b-001",
      actorId: "u-admin",
      actorName: "Maya Okafor",
      action: "update",
      before: { contactPhone: null },
      after: { contactPhone: "+1 (555) 019-2834" },
      timestamp: "2026-06-20T12:00:00Z",
    },
    {
      id: "audit-c-3",
      entityType: "brand",
      entityId: "b-003",
      actorId: "u-admin",
      actorName: "Maya Okafor",
      action: "archive",
      before: { active: true },
      after: { active: false },
      timestamp: "2026-05-18T16:45:00Z",
      reason: "Location closed indefinitely",
    },
    {
      id: "audit-c-4",
      entityType: "restaurant",
      entityId: "r-001",
      actorId: "u-admin",
      actorName: "Alex Rivera",
      action: "create",
      before: null,
      after: { name: "Acme Bistro — Downtown" },
      timestamp: "2026-02-10T09:00:00Z",
    },
    {
      id: "audit-s-1",
      entityType: "staff",
      entityId: "s-001",
      actorId: "u-system",
      actorName: "System",
      action: "create",
      before: null,
      after: { name: "Maya Okafor", roles: ["Manager"] },
      timestamp: "2026-03-01T10:00:00Z",
    },
    {
      id: "audit-s-2",
      entityType: "staff",
      entityId: "s-001",
      actorId: "u-admin",
      actorName: "Maya Okafor",
      action: "role-grant",
      before: { roles: [] },
      after: { roles: ["Manager"] },
      timestamp: "2026-03-02T10:00:00Z",
    },
    {
      id: "audit-s-3",
      entityType: "staff",
      entityId: "s-001",
      actorId: "u-admin",
      actorName: "Maya Okafor",
      action: "restaurant-assign",
      before: { restaurantIds: ["r-001"] },
      after: { restaurantIds: ["r-001", "r-002"] },
      timestamp: "2026-03-03T10:00:00Z",
    },
    {
      id: "audit-s-4",
      entityType: "staff",
      entityId: "s-001",
      actorId: "u-admin",
      actorName: "Maya Okafor",
      action: "deactivate",
      before: { active: true },
      after: { active: false },
      timestamp: "2026-03-04T10:00:00Z",
    },
    {
      id: "audit-s-5",
      entityType: "staff",
      entityId: "s-001",
      actorId: "u-admin",
      actorName: "Maya Okafor",
      action: "reactivate",
      before: { active: false },
      after: { active: true },
      timestamp: "2026-03-05T10:00:00Z",
    },
  ];

  mockAdminRestaurants = [
    {
      id: "r-001",
      brandId: "b-001",
      name: "Acme Bistro — Downtown",
      cuisine: "Italian",
      city: "Brooklyn",
      country: "US",
      active: true,
      status: "active",
      ownerId: "u-admin",
      address: {
        line1: "123 Main St",
        line2: "Suite 4B",
        city: "Brooklyn",
        region: "NY",
        postalCode: "11201",
        country: "US",
      },
      phone: "+1 (555) 019-2834",
      email: "downtown@acme.com",
      timezone: "America/New_York",
      currency: "USD",
      taxRate: 0.08875,
      estimatedTurnoverMinutes: 90,
      autoConfirmReservations: true,
      autoConfirmOrders: true,
      allowAutoSubstitute: false,
      operatingHours: [
        { dayOfWeek: 0, open: "10:00", close: "22:00" },
        { dayOfWeek: 1, open: "11:00", close: "22:00" },
        { dayOfWeek: 2, open: "11:00", close: "22:00" },
        { dayOfWeek: 3, open: "11:00", close: "22:00" },
        { dayOfWeek: 4, open: "11:00", close: "23:00" },
        { dayOfWeek: 5, open: "11:00", close: "23:00" },
        { dayOfWeek: 6, open: "10:00", close: "23:00" },
      ],
      createdAt: "2026-02-01T10:00:00Z",
      updatedAt: "2026-06-15T14:30:00Z",
    },
    {
      id: "r-002",
      brandId: "b-001",
      name: "Acme Bistro — Marina",
      cuisine: "Italian",
      city: "San Francisco",
      country: "US",
      active: true,
      status: "active",
      ownerId: "u-admin",
      address: {
        line1: "456 Marina Blvd",
        line2: null,
        city: "San Francisco",
        region: "CA",
        postalCode: "94123",
        country: "US",
      },
      phone: "+1 (555) 782-9911",
      email: "marina@acme.com",
      timezone: "America/Los_Angeles",
      currency: "USD",
      taxRate: 0.085,
      estimatedTurnoverMinutes: 75,
      autoConfirmReservations: false,
      autoConfirmOrders: true,
      allowAutoSubstitute: true,
      operatingHours: [
        { dayOfWeek: 0, open: "11:00", close: "21:00" },
        { dayOfWeek: 1, open: null, close: null },
        { dayOfWeek: 2, open: "11:00", close: "21:00" },
        { dayOfWeek: 3, open: "11:00", close: "21:00" },
        { dayOfWeek: 4, open: "11:00", close: "22:00" },
        { dayOfWeek: 5, open: "11:00", close: "22:00" },
        { dayOfWeek: 6, open: "11:00", close: "22:00" },
      ],
      createdAt: "2026-03-01T11:00:00Z",
      updatedAt: "2026-07-01T09:15:00Z",
    },
  ];

  mockAdminSettings = {
    defaultTimezone: "America/New_York",
    defaultCurrency: "USD",
    defaultTaxRate: 0.08875,
    reservationReminderMinutes: 60,
    maxReservationPartySize: 12,
    enableAutoSubstitute: true,
    emailFromAddress: "noreply@orderly.hospitality.com",
    supportContactUrl: "https://support.orderly.hospitality.com",
    featureFlags: {
      kdsAudioEnabled: true,
      splitBillEnabled: true,
      virtualBumpBarEnabled: true,
      tableMergeEnabled: true,
    },
  };
};

export const resetMockMenuItems = resetMockCatalogState;

const getRestaurantsResolver = () => {
  return HttpResponse.json(
    mockAdminRestaurants.map((r) => ({
      id: r.id,
      brandId: r.brandId,
      name: r.name,
      cuisine: r.cuisine,
      city: r.city,
      country: r.country,
      active: r.active,
    })),
  );
};

const getRestaurantByIdResolver = ({ params }: { params: any }) => {
  const found = mockAdminRestaurants.find((r) => r.id === params.id);
  if (!found) {
    return new HttpResponse(null, { status: 404 });
  }
  return HttpResponse.json(found);
};

const postRestaurantResolver = async ({ request }: { request: Request }) => {
  const body = (await request.json()) as any;
  const newRestaurant: AdminRestaurantDetail = {
    id: `r-${Date.now()}`,
    brandId: body.brandId,
    name: body.name,
    cuisine: body.cuisine,
    city: body.address.city,
    country: body.address.country,
    active: body.status !== "archived",
    status: body.status ?? "active",
    ownerId: body.ownerId ?? null,
    address: body.address,
    phone: body.phone ?? null,
    email: body.email ?? null,
    timezone: body.timezone,
    currency: body.currency,
    taxRate: body.taxRate,
    estimatedTurnoverMinutes: body.estimatedTurnoverMinutes ?? 90,
    autoConfirmReservations: body.autoConfirmReservations ?? true,
    autoConfirmOrders: body.autoConfirmOrders ?? true,
    allowAutoSubstitute: body.allowAutoSubstitute ?? false,
    operatingHours: body.operatingHours ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAdminRestaurants.push(newRestaurant);
  return HttpResponse.json(newRestaurant, { status: 201 });
};

const putRestaurantResolver = async ({ params, request }: { params: any; request: Request }) => {
  const body = (await request.json()) as any;
  const index = mockAdminRestaurants.findIndex((r) => r.id === params.id);
  if (index === -1) {
    return new HttpResponse(null, { status: 404 });
  }
  const updated: AdminRestaurantDetail = {
    ...mockAdminRestaurants[index],
    ...body,
    city: body.address?.city ?? mockAdminRestaurants[index].city,
    country: body.address?.country ?? mockAdminRestaurants[index].country,
    active: body.status ? body.status !== "archived" : mockAdminRestaurants[index].active,
    updatedAt: new Date().toISOString(),
  };
  mockAdminRestaurants[index] = updated;
  return HttpResponse.json(updated);
};

export const catalogHandlers = [
  http.get(`${BASE}/restaurants`, getRestaurantsResolver),
  http.get(`${BASE}/v1/restaurants`, getRestaurantsResolver),

  http.get(`${BASE}/restaurants/:id`, getRestaurantByIdResolver),
  http.get(`${BASE}/v1/restaurants/:id`, getRestaurantByIdResolver),

  http.post(`${BASE}/restaurants`, postRestaurantResolver),
  http.post(`${BASE}/v1/restaurants`, postRestaurantResolver),

  http.put(`${BASE}/restaurants/:id`, putRestaurantResolver),
  http.put(`${BASE}/v1/restaurants/:id`, putRestaurantResolver),

  http.post(`${BASE}/restaurants/:id/archive`, ({ params }) => {
    const restaurant = mockAdminRestaurants.find((r) => r.id === params.id);
    if (!restaurant) {
      return new HttpResponse(null, { status: 404 });
    }
    // Block archive if demo simulated staff assignment exists (e.g. if params.id === "r-blocked")
    if (params.id === "r-blocked") {
      return HttpResponse.json(
        {
          code: "RESTAURANT_HAS_ACTIVE_STAFF",
          message: "Cannot archive restaurant with active staff assigned.",
        },
        { status: 409 },
      );
    }
    restaurant.status = "archived";
    restaurant.active = false;
    restaurant.updatedAt = new Date().toISOString();
    return HttpResponse.json({ success: true });
  }),

  http.get(`${BASE}/restaurants/:restaurantId/tables`, () => HttpResponse.json(mockTables)),

  http.get(`${BASE}/v1/restaurants/:restaurantId/tables`, () =>
    HttpResponse.json({
      tables: mockTables,
      totalCount: mockTables.length,
    }),
  ),

  http.put(
    `${BASE}/v1/restaurants/:restaurantId/tables/:id/status`,
    async ({ params, request }) => {
      const body = (await request.json()) as { status?: string };
      const table = mockTables.find((t) => t.id === params.id);
      if (table && body.status) {
        table.status = body.status as any;
      }
      return HttpResponse.json({ success: true });
    },
  ),

  http.get(`${BASE}/v1/restaurants/:restaurantId/merged-tables`, () =>
    HttpResponse.json({
      mergedTables: mockMergedTables,
    }),
  ),

  http.post(`${BASE}/v1/restaurants/:restaurantId/merged-tables`, async ({ request }) => {
    const body = (await request.json()) as { parentTableId: string; childTableId: string };
    const newMerged = {
      id: `mt-${Date.now()}`,
      parentTableId: body.parentTableId,
      childTableId: body.childTableId,
      isActive: true,
      mergedAt: new Date().toISOString(),
      splitAt: null,
    };
    mockMergedTables.push(newMerged);
    return HttpResponse.json({ id: newMerged.id }, { status: 201 });
  }),

  http.delete(`${BASE}/v1/restaurants/:restaurantId/merged-tables/:id`, ({ params }) => {
    mockMergedTables = mockMergedTables.filter((m) => m.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.put(`${BASE}/v1/menu-items/:id`, async ({ params, request }) => {
    const body = (await request.json()) as { isAvailable?: boolean };
    const item = mockMenuItems.find((i) => i.id === params.id);
    if (item && body.isAvailable !== undefined) {
      item.status = body.isAvailable ? "available" : "sold_out";
    }
    return HttpResponse.json({ success: true });
  }),

  http.get(`${BASE}/restaurants/:restaurantId/menu`, () =>
    HttpResponse.json({
      categories: mockMenuCategories,
      items: mockMenuItems,
    }),
  ),

  // Reservations
  http.get(`${BASE}/v1/restaurants/:restaurantId/reservations`, () =>
    HttpResponse.json(mockReservations),
  ),

  http.post(`${BASE}/v1/restaurants/:restaurantId/reservations`, async ({ request, params }) => {
    const body = (await request.json()) as any;
    const newRes: ReservationDto = {
      id: `res-${Date.now()}`,
      restaurantId: params.restaurantId as string,
      guestName: body.guestName,
      partySize: body.partySize,
      reservationTime: body.reservationTime,
      tableNumber: body.tableNumber ?? null,
      tableId: body.tableId ?? null,
      status: "confirmed",
      specialRequests: body.specialRequests ?? null,
      contactPhone: body.contactPhone ?? null,
      createdAt: new Date().toISOString(),
    };
    mockReservations.push(newRes);
    return HttpResponse.json(newRes, { status: 201 });
  }),

  http.put(
    `${BASE}/v1/restaurants/:restaurantId/reservations/:id/status`,
    async ({ params, request }) => {
      const body = (await request.json()) as any;
      const res = mockReservations.find((r) => r.id === params.id);
      if (res) {
        if (body.status) res.status = body.status;
        if (body.tableNumber) res.tableNumber = body.tableNumber;
        if (body.tableId) res.tableId = body.tableId;
      }
      return HttpResponse.json({ success: true });
    },
  ),

  // Queue
  http.get(`${BASE}/v1/restaurants/:restaurantId/queue`, () => HttpResponse.json(mockQueueParties)),

  http.post(`${BASE}/v1/restaurants/:restaurantId/queue`, async ({ request, params }) => {
    const body = (await request.json()) as any;
    const newParty: QueuePartyDto = {
      id: `q-${Date.now()}`,
      restaurantId: params.restaurantId as string,
      guestName: body.guestName,
      partySize: body.partySize,
      phone: body.phone,
      quotedWaitMinutes: body.quotedWaitMinutes || 15,
      createdAt: new Date().toISOString(),
      status: "waiting",
    };
    mockQueueParties.push(newParty);
    return HttpResponse.json(newParty, { status: 201 });
  }),

  http.put(`${BASE}/v1/restaurants/:restaurantId/queue/:id/status`, async ({ params, request }) => {
    const body = (await request.json()) as any;
    const party = mockQueueParties.find((q) => q.id === params.id);
    if (party) {
      if (body.status) party.status = body.status;
      if (body.allocatedTableId) party.allocatedTableId = body.allocatedTableId;
      if (body.allocatedTableNumber) party.allocatedTableNumber = body.allocatedTableNumber;
      if (body.status === "notified") party.notifiedAt = new Date().toISOString();
      if (body.status === "seated") party.seatedAt = new Date().toISOString();
    }
    return HttpResponse.json({ success: true });
  }),

  // Brands CRUD (Phase 2)
  http.get(`${BASE}/brands`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const activeParam = url.searchParams.get("active");

    let result = [...mockBrands];
    if (activeParam !== null) {
      const activeBool = activeParam === "true";
      result = result.filter((b) => b.active === activeBool);
    }
    if (q) {
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q) ||
          b.cuisineType.toLowerCase().includes(q),
      );
    }
    return HttpResponse.json(result);
  }),
  http.get(`${BASE}/v1/brands`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.toLowerCase();
    const activeParam = url.searchParams.get("active");

    let result = [...mockBrands];
    if (activeParam !== null) {
      const activeBool = activeParam === "true";
      result = result.filter((b) => b.active === activeBool);
    }
    if (q) {
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q) ||
          b.cuisineType.toLowerCase().includes(q),
      );
    }
    return HttpResponse.json(result);
  }),

  http.get(`${BASE}/brands/:id`, ({ params }) => {
    const brand = mockBrands.find((b) => b.id === params.id);
    if (!brand) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(brand);
  }),
  http.get(`${BASE}/v1/brands/:id`, ({ params }) => {
    const brand = mockBrands.find((b) => b.id === params.id);
    if (!brand) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(brand);
  }),

  http.post(`${BASE}/brands`, async ({ request }) => {
    const body = (await request.json()) as any;
    // Conflict check for duplicate slug
    if (mockBrands.some((b) => b.slug.toLowerCase() === body.slug.toLowerCase())) {
      return HttpResponse.json(
        {
          code: "BRAND_DUPLICATE_SLUG",
          message: "A brand with this slug already exists.",
        },
        { status: 409 },
      );
    }

    const newBrand: CatalogBrand = {
      id: `b-${Date.now()}`,
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      logoUrl: body.logoUrl ?? null,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone ?? null,
      cuisineType: body.cuisineType,
      websiteUrl: body.websiteUrl ?? null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBrands.push(newBrand);
    return HttpResponse.json(newBrand, { status: 201 });
  }),
  http.post(`${BASE}/v1/brands`, async ({ request }) => {
    const body = (await request.json()) as any;
    if (mockBrands.some((b) => b.slug.toLowerCase() === body.slug.toLowerCase())) {
      return HttpResponse.json(
        {
          code: "BRAND_DUPLICATE_SLUG",
          message: "A brand with this slug already exists.",
        },
        { status: 409 },
      );
    }

    const newBrand: CatalogBrand = {
      id: `b-${Date.now()}`,
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      logoUrl: body.logoUrl ?? null,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone ?? null,
      cuisineType: body.cuisineType,
      websiteUrl: body.websiteUrl ?? null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBrands.push(newBrand);
    return HttpResponse.json(newBrand, { status: 201 });
  }),

  http.put(`${BASE}/brands/:id`, async ({ params, request }) => {
    const body = (await request.json()) as any;
    const index = mockBrands.findIndex((b) => b.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // Check slug uniqueness across other brands
    if (
      mockBrands.some((b) => b.id !== params.id && b.slug.toLowerCase() === body.slug.toLowerCase())
    ) {
      return HttpResponse.json(
        {
          code: "BRAND_DUPLICATE_SLUG",
          message: "A brand with this slug already exists.",
        },
        { status: 409 },
      );
    }

    const updated: CatalogBrand = {
      ...mockBrands[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    mockBrands[index] = updated;
    return HttpResponse.json(updated);
  }),
  http.put(`${BASE}/v1/brands/:id`, async ({ params, request }) => {
    const body = (await request.json()) as any;
    const index = mockBrands.findIndex((b) => b.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    if (
      mockBrands.some((b) => b.id !== params.id && b.slug.toLowerCase() === body.slug.toLowerCase())
    ) {
      return HttpResponse.json(
        {
          code: "BRAND_DUPLICATE_SLUG",
          message: "A brand with this slug already exists.",
        },
        { status: 409 },
      );
    }

    const updated: CatalogBrand = {
      ...mockBrands[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    mockBrands[index] = updated;
    return HttpResponse.json(updated);
  }),

  http.post(`${BASE}/brands/:id/archive`, ({ params }) => {
    const brand = mockBrands.find((b) => b.id === params.id);
    if (!brand) {
      return new HttpResponse(null, { status: 404 });
    }
    brand.active = false;
    brand.updatedAt = new Date().toISOString();
    return HttpResponse.json({ success: true });
  }),
  http.post(`${BASE}/v1/brands/:id/archive`, ({ params }) => {
    const brand = mockBrands.find((b) => b.id === params.id);
    if (!brand) {
      return new HttpResponse(null, { status: 404 });
    }
    brand.active = false;
    brand.updatedAt = new Date().toISOString();
    return HttpResponse.json({ success: true });
  }),

  // Phase 3: Generic Audit Endpoints
  http.get(`${BASE}/audit/:entityType/:entityId`, ({ params }) => {
    const { entityType, entityId } = params;
    const matches = mockAuditEntries.filter(
      (e) =>
        e.entityType.toLowerCase() === String(entityType).toLowerCase() &&
        e.entityId === String(entityId),
    );
    return HttpResponse.json(matches);
  }),

  http.get(`${BASE}/audit`, ({ request }) => {
    const url = new URL(request.url);
    const entityType = url.searchParams.get("entityType");
    const entityId = url.searchParams.get("entityId");
    const actorId = url.searchParams.get("actorId");
    const since = url.searchParams.get("since");
    const until = url.searchParams.get("until");

    let results = [...mockAuditEntries];
    if (entityType) {
      results = results.filter((e) => e.entityType.toLowerCase() === entityType.toLowerCase());
    }
    if (entityId) {
      results = results.filter((e) => e.entityId === entityId);
    }
    if (actorId) {
      results = results.filter((e) => e.actorId === actorId);
    }
    if (since) {
      const sinceDate = new Date(since).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() >= sinceDate);
    }
    if (until) {
      const untilDate = new Date(until).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() <= untilDate);
    }
    return HttpResponse.json(results);
  }),

  // Phase 6: Global Admin Settings Endpoints
  http.get(`${BASE}/settings`, () => {
    return HttpResponse.json(mockAdminSettings);
  }),

  http.put(`${BASE}/settings`, async ({ request }) => {
    const body = (await request.json()) as AdminSettings;
    mockAdminSettings = { ...mockAdminSettings, ...body };
    return HttpResponse.json(mockAdminSettings);
  }),

  // Phase 5: Operations Analytics & Kitchen Speed Telemetry
  http.get(`${BASE}/v1/restaurants/:restaurantId/analytics/menu-items`, ({ params, request }) => {
    const url = new URL(request.url);
    const dateRange = url.searchParams.get("dateRange") ?? "today";
    return HttpResponse.json({
      ...mockAnalyticsResponse,
      restaurantId: params.restaurantId as string,
      dateRange,
    });
  }),
  http.get(`${BASE}/restaurants/:restaurantId/analytics/menu-items`, ({ params, request }) => {
    const url = new URL(request.url);
    const dateRange = url.searchParams.get("dateRange") ?? "today";
    return HttpResponse.json({
      ...mockAnalyticsResponse,
      restaurantId: params.restaurantId as string,
      dateRange,
    });
  }),

  // Phase 5: 3 - Customer Feedback & Reward Portal
  http.get(`${BASE}/v1/restaurants/:restaurantId/feedback`, ({ request }) => {
    const url = new URL(request.url);
    const minRating = url.searchParams.get("minRating");
    const maxRating = url.searchParams.get("maxRating");
    const rewardRedeemed = url.searchParams.get("rewardRedeemed");
    const pageIndex = Number(url.searchParams.get("pageIndex") ?? "0");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "50");

    let items = [...mockCustomerFeedbackList];
    if (minRating !== null) {
      items = items.filter((f) => f.overallRating >= Number(minRating));
    }
    if (maxRating !== null) {
      items = items.filter((f) => f.overallRating <= Number(maxRating));
    }
    if (rewardRedeemed !== null) {
      const isRedeemed = rewardRedeemed === "true";
      items = items.filter((f) => f.rewardRedeemed === isRedeemed);
    }

    const totalCount = items.length;
    const paginatedItems = items.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    return HttpResponse.json({
      items: paginatedItems,
      totalCount,
      pageIndex,
      pageSize,
    });
  }),
  http.get(`${BASE}/restaurants/:restaurantId/feedback`, ({ request }) => {
    const url = new URL(request.url);
    const minRating = url.searchParams.get("minRating");
    const maxRating = url.searchParams.get("maxRating");
    const rewardRedeemed = url.searchParams.get("rewardRedeemed");
    const pageIndex = Number(url.searchParams.get("pageIndex") ?? "0");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "50");

    let items = [...mockCustomerFeedbackList];
    if (minRating !== null) {
      items = items.filter((f) => f.overallRating >= Number(minRating));
    }
    if (maxRating !== null) {
      items = items.filter((f) => f.overallRating <= Number(maxRating));
    }
    if (rewardRedeemed !== null) {
      const isRedeemed = rewardRedeemed === "true";
      items = items.filter((f) => f.rewardRedeemed === isRedeemed);
    }

    const totalCount = items.length;
    const paginatedItems = items.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    return HttpResponse.json({
      items: paginatedItems,
      totalCount,
      pageIndex,
      pageSize,
    });
  }),
];

export let mockCustomerFeedbackList: CustomerFeedbackDto[] = [
  {
    id: 1,
    restaurantId: "r-001",
    orderId: "ord-891",
    overallRating: 5,
    foodQualityRating: 5,
    serviceSpeedRating: 5,
    waiterFriendlinessRating: 5,
    comments:
      "Exquisite hand-made pasta! Marco took exceptional care of our anniversary dinner. Will definitely return.",
    submittedAt: "2026-10-18T19:30:00Z",
    rewardType: "PercentageDiscount",
    rewardValue: 15,
    rewardDescription: "15% off your next visit",
    rewardCode: "LOYALTY-15-X9Y2",
    rewardRedeemed: true,
    redeemedAt: "2026-10-19T20:15:00Z",
    redeemedInOrderId: "ord-924",
  },
  {
    id: 2,
    restaurantId: "r-001",
    orderId: "ord-885",
    overallRating: 5,
    foodQualityRating: 5,
    serviceSpeedRating: 4,
    waiterFriendlinessRating: 5,
    comments:
      "The wood-fired Margherita pizza had the perfect blistered crust. Quick seating via walk-in queue.",
    submittedAt: "2026-10-18T14:15:00Z",
    rewardType: "ComplimentaryItem",
    rewardValue: null,
    rewardDescription: "Free Artisanal Dessert",
    rewardCode: "SWEET-TREAT-4K7L",
    rewardRedeemed: false,
    redeemedAt: null,
    redeemedInOrderId: null,
  },
  {
    id: 3,
    restaurantId: "r-001",
    orderId: "ord-872",
    overallRating: 4,
    foodQualityRating: 5,
    serviceSpeedRating: 3,
    waiterFriendlinessRating: 4,
    comments:
      "Food was sensational, especially the Rigatoni Carbonara. Kitchen was slightly delayed during peak dinner rush.",
    submittedAt: "2026-10-17T20:45:00Z",
    rewardType: "FixedAmount",
    rewardValue: 10,
    rewardDescription: "$10 dining voucher",
    rewardCode: "THANKYOU-10-M3P9",
    rewardRedeemed: false,
    redeemedAt: null,
    redeemedInOrderId: null,
  },
  {
    id: 4,
    restaurantId: "r-001",
    orderId: "ord-860",
    overallRating: 4,
    foodQualityRating: 4,
    serviceSpeedRating: 5,
    waiterFriendlinessRating: 4,
    comments: "Crisp Calamari and fresh salads. Speedy service and very courteous servers.",
    submittedAt: "2026-10-17T13:20:00Z",
    rewardType: "PercentageDiscount",
    rewardValue: 10,
    rewardDescription: "10% off your next visit",
    rewardCode: "SAVE10-A8B2C4",
    rewardRedeemed: true,
    redeemedAt: "2026-10-18T18:00:00Z",
    redeemedInOrderId: "ord-880",
  },
  {
    id: 5,
    restaurantId: "r-001",
    orderId: "ord-844",
    overallRating: 3,
    foodQualityRating: 4,
    serviceSpeedRating: 2,
    waiterFriendlinessRating: 4,
    comments:
      "Our entrees arrived staggered by 10 minutes. Sauté station seemed overwhelmed, but table staff apologized gracefully.",
    submittedAt: "2026-10-16T21:10:00Z",
    rewardType: "FixedAmount",
    rewardValue: 15,
    rewardDescription: "$15 recovery voucher",
    rewardCode: "RECOVER-15-J8N3",
    rewardRedeemed: false,
    redeemedAt: null,
    redeemedInOrderId: null,
  },
  {
    id: 6,
    restaurantId: "r-001",
    orderId: "ord-830",
    overallRating: 2,
    foodQualityRating: 3,
    serviceSpeedRating: 2,
    waiterFriendlinessRating: 3,
    comments:
      "Steak was slightly overcooked and sides arrived lukewarm. Management handled it well and offered a voucher.",
    submittedAt: "2026-10-15T19:50:00Z",
    rewardType: "ComplimentaryItem",
    rewardValue: null,
    rewardDescription: "Complimentary Chef Starter",
    rewardCode: "STARTER-COMP-Z1",
    rewardRedeemed: true,
    redeemedAt: "2026-10-17T12:00:00Z",
    redeemedInOrderId: "ord-858",
  },
  {
    id: 7,
    restaurantId: "r-001",
    orderId: "ord-815",
    overallRating: 1,
    foodQualityRating: 2,
    serviceSpeedRating: 1,
    waiterFriendlinessRating: 2,
    comments:
      "Waited 45 minutes past our reservation time for a table. Food took another 40 minutes.",
    submittedAt: "2026-10-14T20:30:00Z",
    rewardType: "PercentageDiscount",
    rewardValue: 25,
    rewardDescription: "25% VIP Apology Voucher",
    rewardCode: "APOLOGY-25-R4T7",
    rewardRedeemed: false,
    redeemedAt: null,
    redeemedInOrderId: null,
  },
];

export let mockAnalyticsResponse: GetMenuItemAnalyticsResponse = {
  restaurantId: "r-001",
  dateRange: "today",
  summary: {
    grossSales: 4820.5,
    grossSalesDelta: 12.8,
    orderCount: 142,
    orderCountDelta: 8.4,
    averageTicketSize: 33.95,
    averageTicketSizeDelta: 4.1,
    averagePrepTimeMinutes: 14.2,
    targetPrepTimeMinutes: 12.0,
    averagePrepTimeDelta: -6.2,
  },
  items: [
    {
      menuItemId: "m-1",
      name: "Margherita",
      categoryName: "Pizza",
      unitsSold: 45,
      grossRevenue: 630.0,
      averagePrepTimeMinutes: 10.5,
      estimatedPrepTimeMinutes: 10.0,
      station: "Grill",
    },
    {
      menuItemId: "m-2",
      name: "Pepperoni Piccante",
      categoryName: "Pizza",
      unitsSold: 38,
      grossRevenue: 627.0,
      averagePrepTimeMinutes: 11.2,
      estimatedPrepTimeMinutes: 10.0,
      station: "Grill",
    },
    {
      menuItemId: "m-3",
      name: "Rigatoni Carbonara",
      categoryName: "Pasta",
      unitsSold: 52,
      grossRevenue: 936.0,
      averagePrepTimeMinutes: 16.8,
      estimatedPrepTimeMinutes: 12.0,
      station: "Sauté",
    },
    {
      menuItemId: "m-5",
      name: "Tagliatelle Bolognese",
      categoryName: "Pasta",
      unitsSold: 34,
      grossRevenue: 646.0,
      averagePrepTimeMinutes: 15.4,
      estimatedPrepTimeMinutes: 12.0,
      station: "Sauté",
    },
    {
      menuItemId: "m-6",
      name: "Caesar Salad",
      categoryName: "Starters",
      unitsSold: 28,
      grossRevenue: 336.0,
      averagePrepTimeMinutes: 6.2,
      estimatedPrepTimeMinutes: 7.0,
      station: "Salad",
    },
    {
      menuItemId: "m-7",
      name: "Crispy Calamari",
      categoryName: "Starters",
      unitsSold: 30,
      grossRevenue: 450.0,
      averagePrepTimeMinutes: 14.5,
      estimatedPrepTimeMinutes: 9.0,
      station: "Fryer",
    },
    {
      menuItemId: "m-4",
      name: "San Pellegrino",
      categoryName: "Beverages",
      unitsSold: 60,
      grossRevenue: 270.0,
      averagePrepTimeMinutes: 2.1,
      estimatedPrepTimeMinutes: 3.0,
      station: "Expedite",
    },
    {
      menuItemId: "m-8",
      name: "Tiramisu",
      categoryName: "Desserts",
      unitsSold: 25,
      grossRevenue: 225.0,
      averagePrepTimeMinutes: 4.5,
      estimatedPrepTimeMinutes: 5.0,
      station: "Expedite",
    },
  ],
  hourlySales: [
    { hour: "11:00", orderCount: 8, grossSales: 245.0, topItemName: "Margherita" },
    { hour: "12:00", orderCount: 22, grossSales: 748.0, topItemName: "Rigatoni Carbonara" },
    { hour: "13:00", orderCount: 26, grossSales: 890.0, topItemName: "Rigatoni Carbonara" },
    { hour: "14:00", orderCount: 14, grossSales: 460.0, topItemName: "Pepperoni Piccante" },
    { hour: "15:00", orderCount: 6, grossSales: 185.0, topItemName: "San Pellegrino" },
    { hour: "16:00", orderCount: 5, grossSales: 160.0, topItemName: "Caesar Salad" },
    { hour: "17:00", orderCount: 12, grossSales: 410.0, topItemName: "Margherita" },
    { hour: "18:00", orderCount: 25, grossSales: 915.0, topItemName: "Rigatoni Carbonara" },
    { hour: "19:00", orderCount: 30, grossSales: 1120.0, topItemName: "Pepperoni Piccante" },
    { hour: "20:00", orderCount: 24, grossSales: 850.0, topItemName: "Tagliatelle Bolognese" },
    { hour: "21:00", orderCount: 15, grossSales: 520.0, topItemName: "Crispy Calamari" },
    { hour: "22:00", orderCount: 7, grossSales: 210.0, topItemName: "Tiramisu" },
  ],
  stationMetrics: [
    {
      station: "Grill",
      orderCount: 83,
      averagePrepTimeMinutes: 10.8,
      targetPrepTimeMinutes: 10.0,
      delayPercentage: 8.0,
      isDelayed: false,
    },
    {
      station: "Salad",
      orderCount: 42,
      averagePrepTimeMinutes: 6.2,
      targetPrepTimeMinutes: 7.0,
      delayPercentage: 0,
      isDelayed: false,
    },
    {
      station: "Fryer",
      orderCount: 38,
      averagePrepTimeMinutes: 14.5,
      targetPrepTimeMinutes: 9.0,
      delayPercentage: 61.1,
      isDelayed: true,
    },
    {
      station: "Sauté",
      orderCount: 86,
      averagePrepTimeMinutes: 16.2,
      targetPrepTimeMinutes: 12.0,
      delayPercentage: 35.0,
      isDelayed: true,
    },
    {
      station: "Expedite",
      orderCount: 142,
      averagePrepTimeMinutes: 3.2,
      targetPrepTimeMinutes: 4.0,
      delayPercentage: 0,
      isDelayed: false,
    },
  ],
};
