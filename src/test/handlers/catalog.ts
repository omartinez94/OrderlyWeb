/**
 * MSW handlers for the Catalog Service.
 */

import { http, HttpResponse } from "msw";

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

export const resetMockMenuItems = () => {
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
};

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

  http.get(`${BASE}/restaurants/:restaurantId/tables`, () =>
    HttpResponse.json([
      { id: "t-1", restaurantId: "r-001", tableNumber: "T1", capacity: 2, section: "Window" },
      { id: "t-2", restaurantId: "r-001", tableNumber: "T2", capacity: 4, section: "Patio" },
    ]),
  ),

  http.get(`${BASE}/v1/restaurants/:restaurantId/tables`, () =>
    HttpResponse.json({
      tables: [
        {
          id: "t-1",
          restaurantId: "r-001",
          tableNumber: "T1",
          capacity: 2,
          positionX: 10,
          positionY: 20,
          shape: "square",
          status: "Available",
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
        },
      ],
      totalCount: 2,
    }),
  ),

  http.get(`${BASE}/v1/restaurants/:restaurantId/merged-tables`, () =>
    HttpResponse.json({
      mergedTables: [
        {
          id: "mt-1",
          parentTableId: "t-1",
          childTableId: "t-2",
          isActive: true,
          mergedAt: "2026-07-28T10:00:00Z",
          splitAt: null,
        },
      ],
    }),
  ),

  http.post(`${BASE}/v1/restaurants/:restaurantId/merged-tables`, () =>
    HttpResponse.json({ id: "mt-new-1" }, { status: 201 }),
  ),

  http.delete(
    `${BASE}/v1/restaurants/:restaurantId/merged-tables/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),

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
];
