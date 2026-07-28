/**
 * MSW handlers for the Catalog Service.
 */

import { http, HttpResponse } from "msw";

const BASE = "http://localhost:6004/catalog-api";

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
      { id: "t-1", restaurantId: "r-001", label: "T1", capacity: 2, section: "Window" },
      { id: "t-2", restaurantId: "r-001", label: "T2", capacity: 4, section: "Patio" },
    ]),
  ),

  http.get(`${BASE}/restaurants/:restaurantId/menu`, () =>
    HttpResponse.json({
      categories: [
        { id: "c-pizza", restaurantId: "r-001", name: "Pizza", position: 1 },
        { id: "c-pasta", restaurantId: "r-001", name: "Pasta", position: 2 },
      ],
      items: [
        {
          id: "m-1",
          restaurantId: "r-001",
          categoryId: "c-pizza",
          name: "Margherita",
          priceCents: 1400,
          status: "available",
        },
      ],
    }),
  ),
];
