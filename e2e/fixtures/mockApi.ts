import type { Page } from "@playwright/test";

export const mockOrder = {
  id: "ord-mock-1",
  customerId: "c-001",
  orderNumber: "ORD-2026-0001",
  restaurantId: "r-001",
  currency: "USD",
  subtotal: 14.0,
  taxRate: 0.08,
  taxAmount: 1.12,
  discountAmount: 0,
  discountCode: "",
  totalAmount: 15.12,
  status: "Preparing",
  orderType: "DineIn",
  billingAddress: {
    street: "123 Main St",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    country: "US",
  },
  deliveryAddress: {
    street: "123 Main St",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    country: "US",
  },
  deliveryNotes: "",
  deliveryStatus: null,
  payment: {
    method: "CreditCard",
    brand: "Visa",
    lastFour: "4242",
  },
  estimatedPrepTimeMinutes: 20,
  actualPrepTimeMinutes: 15,
  isModified: false,
  requiresAdminApproval: false,
  tableId: "t-1",
  notes: "Table 1 Priority",
  orderItems: [
    {
      id: "i-1",
      orderId: "ord-mock-1",
      menuItemId: "m-1",
      menuItemName: "Margherita",
      menuItemDescription: "Classic tomato and mozzarella pizza",
      menuItemImageUrl: "",
      quantity: 1,
      unitPrice: 14.0,
      basePrice: 14.0,
      totalPrice: 14.0,
      seatNumber: 1,
      specialInstructions: "",
      customizations: [],
      selectedVariations: [],
      prepStatus: "Preparing",
      createdAt: "2026-10-20T10:00:00Z",
      prepStartedAt: "2026-10-20T10:05:00Z",
      prepCompletedAt: null,
    },
  ],
  activities: [
    {
      id: "act-1",
      activityType: "OrderCreated",
      actorUserId: "u-001",
      occurredAt: "2026-10-20T10:00:00Z",
      correlationId: "corr-1",
      notes: null,
      metadata: null,
    },
  ],
};

export const mockKitchenTicket = {
  id: "t-001",
  restaurantId: "r-001",
  customerId: "c-001",
  orderNumber: "ORD-2026-0001",
  status: "InProgress",
  receivedAt: "2026-10-20T10:00:00Z",
  startedAt: "2026-10-20T10:02:00Z",
  readyAt: null,
  bumpedAt: null,
  cancelledAt: null,
  cancellationReason: null,
  confirmedByUserId: "u-001",
  cancelledByUserId: null,
  notes: "Table 1 Priority",
  estimatedPrepTimeMinutes: 15,
  items: [
    {
      id: "ti-001",
      orderItemId: "i-1",
      menuItemId: "m-1",
      menuItemName: "Margherita Pizza",
      quantity: 1,
      unitPrice: 1400,
      selectedVariations: [],
      customizations: [],
      specialInstructions: null,
      seatNumber: 1,
      status: "Preparing",
      startedAt: "2026-10-20T10:02:00Z",
      readyAt: null,
      stationId: "st-pizza",
    },
  ],
};

export const mockTablesList = [
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
];

export const mockMenuData = {
  categories: [
    { id: "c-pizza", name: "Pizza", displayOrder: 1 },
    { id: "c-pasta", name: "Pasta", displayOrder: 2 },
    { id: "c-drinks", name: "Beverages", displayOrder: 3 },
  ],
  items: [
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
      id: "m-3",
      restaurantId: "r-001",
      categoryId: "c-pasta",
      name: "Rigatoni Carbonara",
      priceCents: 1800,
      status: "available",
      description: "Guanciale, pecorino romano, egg yolk",
    },
  ],
};

export const mockAnalyticsData = {
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
  hourlySales: [
    { hour: "11:00", revenue: 420.0, orderCount: 12, topSellingItem: "Margherita" },
    { hour: "12:00", revenue: 890.5, orderCount: 26, topSellingItem: "Rigatoni Carbonara" },
    { hour: "13:00", revenue: 1120.0, orderCount: 34, topSellingItem: "Margherita" },
    { hour: "18:00", revenue: 980.0, orderCount: 29, topSellingItem: "Rigatoni Carbonara" },
    { hour: "19:00", revenue: 1410.0, orderCount: 41, topSellingItem: "Margherita" },
  ],
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
      menuItemId: "m-3",
      name: "Rigatoni Carbonara",
      categoryName: "Pasta",
      unitsSold: 52,
      grossRevenue: 936.0,
      averagePrepTimeMinutes: 16.8,
      estimatedPrepTimeMinutes: 12.0,
      station: "Sauté",
    },
  ],
  stationMetrics: [
    {
      stationId: "st-grill",
      stationName: "Grill",
      ordersPrepared: 83,
      averagePrepTimeMinutes: 10.8,
      targetPrepTimeMinutes: 10.0,
      isDelayed: false,
    },
    {
      stationId: "st-fryer",
      stationName: "Fryer",
      ordersPrepared: 30,
      averagePrepTimeMinutes: 14.5,
      targetPrepTimeMinutes: 9.0,
      isDelayed: true,
    },
    {
      stationId: "st-saute",
      stationName: "Sauté",
      ordersPrepared: 86,
      averagePrepTimeMinutes: 16.1,
      targetPrepTimeMinutes: 12.0,
      isDelayed: true,
    },
    {
      stationId: "st-salad",
      stationName: "Salad",
      ordersPrepared: 28,
      averagePrepTimeMinutes: 6.2,
      targetPrepTimeMinutes: 7.0,
      isDelayed: false,
    },
  ],
};

export const mockFeedbackData = {
  items: [
    {
      id: 1,
      restaurantId: "r-001",
      orderId: "ord-891",
      overallRating: 5,
      foodQualityRating: 5,
      serviceSpeedRating: 5,
      waiterFriendlinessRating: 5,
      comments: "Exquisite hand-made pasta! Marco took exceptional care of our anniversary dinner.",
      submittedAt: "2026-10-18T19:30:00Z",
      rewardType: "PercentageDiscount",
      rewardValue: 15,
      rewardDescription: "15% off your next visit",
      rewardCode: "LOYALTY-15-X9Y2",
      rewardRedeemed: true,
      redeemedAt: "2026-10-19T20:15:00Z",
      redeemedInOrderId: "ord-904",
    },
    {
      id: 2,
      restaurantId: "r-001",
      orderId: "ord-885",
      overallRating: 5,
      foodQualityRating: 5,
      serviceSpeedRating: 4,
      waiterFriendlinessRating: 5,
      comments: "Wood-fired crust had the perfect char. Tiramisu was velvety and light.",
      submittedAt: "2026-10-18T14:15:00Z",
      rewardType: "ComplimentaryDessert",
      rewardValue: null,
      rewardDescription: "Complimentary Artisanal Dessert",
      rewardCode: "SWEET-TREAT-4K7L",
      rewardRedeemed: false,
      redeemedAt: null,
      redeemedInOrderId: null,
    },
    {
      id: 3,
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
      id: 4,
      restaurantId: "r-001",
      orderId: "ord-815",
      overallRating: 1,
      foodQualityRating: 2,
      serviceSpeedRating: 1,
      waiterFriendlinessRating: 2,
      comments: "Disappointing wait times during Friday rush. Entrees were barely warm.",
      submittedAt: "2026-10-14T21:00:00Z",
      rewardType: "FixedAmount",
      rewardValue: 20,
      rewardDescription: "$20 VIP recovery voucher",
      rewardCode: "RECOVER-20-VIP",
      rewardRedeemed: false,
      redeemedAt: null,
      redeemedInOrderId: null,
    },
  ],
  totalCount: 4,
  pageIndex: 0,
  pageSize: 50,
};

/**
 * Installs comprehensive network routes for mock backend services:
 * Identity.API, Catalog.API, Ordering.API, Kitchen.API, Basket.API
 */
export async function setupAllMocks(page: Page) {
  // Identity auth session refresh mock
  await page.route("**/identity-api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/auth/refresh")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken: "mock-e2e-jwt-token",
          expiresAt: Date.now() + 86400000,
          user: {
            id: "u-001",
            name: "Alex Rivera",
            email: "alex@acme.com",
            initials: "AR",
            isActive: true,
          },
          roles: ["SuperAdmin", "KitchenManager", "Manager"],
          permissions: ["*"],
        }),
      });
      return;
    }
    await route.continue();
  });

  // Catalog service mock
  await page.route("**/catalog-api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.includes("/analytics/menu-items")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAnalyticsData),
      });
      return;
    }

    if (path.includes("/feedback")) {
      const minRating = url.searchParams.get("minRating");
      const maxRating = url.searchParams.get("maxRating");
      const rewardRedeemed = url.searchParams.get("rewardRedeemed");

      let filtered = [...mockFeedbackData.items];
      if (minRating !== null) {
        filtered = filtered.filter((f) => f.overallRating >= Number(minRating));
      }
      if (maxRating !== null) {
        filtered = filtered.filter((f) => f.overallRating <= Number(maxRating));
      }
      if (rewardRedeemed !== null) {
        filtered = filtered.filter((f) => f.rewardRedeemed === (rewardRedeemed === "true"));
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: filtered,
          totalCount: filtered.length,
          pageIndex: 0,
          pageSize: 50,
        }),
      });
      return;
    }

    if (path.includes("/menu")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockMenuData),
      });
      return;
    }

    if (path.includes("/tables")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockTablesList),
      });
      return;
    }

    if (path.endsWith("/restaurants/r-001") || path.endsWith("/v1/restaurants/r-001")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "r-001",
          brandId: "b-001",
          name: "Acme Bistro — Downtown",
          cuisine: "Italian",
          city: "Brooklyn",
          country: "US",
          active: true,
          status: "active",
          currency: "USD",
          taxRate: 0.08,
        }),
      });
      return;
    }

    if (path.includes("/restaurants")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "r-001",
            brandId: "b-001",
            name: "Acme Bistro — Downtown",
            cuisine: "Italian",
            city: "Brooklyn",
            country: "US",
            active: true,
            status: "active",
          },
        ]),
      });
      return;
    }

    await route.continue();
  });

  // Basket API mock
  let activeCartItems = [
    {
      menuItemId: 1,
      quantity: 1,
      unitPrice: 14.0,
      totalPrice: 14.0,
      variations: [],
      customizations: [],
    },
  ];

  await page.route("**/basket-api/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());

    if (url.pathname.includes("/checkout")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Order placed successfully",
        }),
      });
      return;
    }

    if (req.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          basket: {
            userId: "u-001",
            restaurantId: "r-001",
            items: activeCartItems,
            appliedDiscounts: [],
            appliedCoupons: [],
            discountAmount: 0,
            subtotal: 14.0,
            effectiveSubtotal: 14.0,
            total: 15.12,
          },
        }),
      });
      return;
    }

    if (req.method() === "PUT") {
      try {
        const body = (await req.postDataJSON()) as { items?: typeof activeCartItems };
        if (body?.items) {
          activeCartItems = body.items;
        }
      } catch {
        // Fallback
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isCreated: false,
          userId: "u-001",
          restaurantId: "r-001",
        }),
      });
      return;
    }

    if (req.method() === "DELETE") {
      activeCartItems = [];
      await route.fulfill({ status: 204 });
      return;
    }

    await route.continue();
  });

  // Ordering API mock
  await page.route("**/ordering-api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.endsWith("/orders") || path.endsWith("/orders/")) {
      const dynamicOrder = {
        ...mockOrder,
        activities: [
          {
            ...mockOrder.activities[0],
            occurredAt: new Date().toISOString(),
          },
        ],
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          orders: {
            pageIndex: 1,
            pageSize: 50,
            count: 1,
            data: [dynamicOrder],
          },
        }),
      });
      return;
    }

    if (path.includes("/orders/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          order: {
            ...mockOrder,
            activities: [
              {
                ...mockOrder.activities[0],
                occurredAt: new Date().toISOString(),
              },
            ],
          },
        }),
      });
      return;
    }

    await route.continue();
  });

  // Kitchen API mock
  let ticketStatus = "InProgress";

  await page.route("**/kitchen-api/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;

    if (path.includes("/queue")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          pageIndex: 1,
          pageSize: 50,
          count: 1,
          data: [
            {
              ...mockKitchenTicket,
              status: ticketStatus,
            },
          ],
        }),
      });
      return;
    }

    if (path.includes("/bump") || path.includes("/mark-ready")) {
      ticketStatus = "Ready";
      await route.fulfill({ status: 204 });
      return;
    }

    await route.continue();
  });
}
