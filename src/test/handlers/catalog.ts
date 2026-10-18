/**
 * MSW handlers for the Catalog Service (Restaurants, Tables, MergedTables, Menu, Reservations, Queue).
 */

import { http, HttpResponse } from "msw";
import type { Table, ReservationDto, QueuePartyDto } from "../../types/catalog";

const BASE = "http://localhost:6004/catalog-api";

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
};

export const resetMockMenuItems = resetMockCatalogState;

export const catalogHandlers = [
  http.get(`${BASE}/restaurants`, () =>
    HttpResponse.json([
      {
        id: "r-001",
        name: "Acme Bistro — Downtown",
        cuisine: "Italian",
        city: "Brooklyn",
        country: "US",
        active: true,
      },
      {
        id: "r-002",
        name: "Acme Bistro — Marina",
        cuisine: "Italian",
        city: "San Francisco",
        country: "US",
        active: true,
      },
    ]),
  ),

  http.get(`${BASE}/restaurants/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      name: "Acme Bistro — Downtown",
      cuisine: "Italian",
      city: "Brooklyn",
      country: "US",
      active: true,
    }),
  ),

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
];
