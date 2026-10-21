import { describe, expect, it } from "vitest";
import { normalizeKitchenTicket, normalizeKitchenQueueResponse } from "./kitchen";

describe("kitchenApi normalizers", () => {
  it("normalizes .NET PascalCase responses with integer enum statuses", () => {
    const rawDotNetResponse = {
      PageIndex: 1,
      PageSize: 50,
      Count: 2,
      Data: [
        {
          Id: "55555555-5555-5555-5555-555555555555",
          RestaurantId: "e8045052-d59f-4751-81e6-ff23102efb09",
          CustomerId: "11111111-1111-1111-1111-111111111111",
          OrderNumber: "ORD-0002",
          Status: 0,
          ReceivedAt: "2026-10-16T16:35:27Z",
          StartedAt: null,
          ReadyAt: null,
          BumpedAt: null,
          CancelledAt: null,
          CancellationReason: null,
          ConfirmedByUserId: null,
          CancelledByUserId: null,
          Notes: "VIP table",
          EstimatedPrepTimeMinutes: 5,
          Items: [
            {
              Id: "16c5ff2d-4edb-4091-8934-0cdadf9b0e10",
              OrderItemId: "16c5ff2d-4edb-4091-8934-0cdadf9b0e10",
              MenuItemId: "22222222-2222-2222-2222-222222222222",
              MenuItemName: "Tacos al Pastor",
              Quantity: 3,
              UnitPrice: 10.99,
              SelectedVariations: [],
              Customizations: [],
              SpecialInstructions: null,
              SeatNumber: null,
              Status: 1,
              StartedAt: null,
              ReadyAt: null,
              StationId: "st-grill",
            },
          ],
        },
      ],
    };

    const normalized = normalizeKitchenQueueResponse(rawDotNetResponse);

    expect(normalized.pageIndex).toBe(1);
    expect(normalized.pageSize).toBe(50);
    expect(normalized.count).toBe(2);
    expect(normalized.data).toHaveLength(1);

    const ticket = normalized.data[0];
    expect(ticket.id).toBe("55555555-5555-5555-5555-555555555555");
    expect(ticket.orderNumber).toBe("ORD-0002");
    expect(ticket.status).toBe("New");
    expect(ticket.notes).toBe("VIP table");
    expect(ticket.estimatedPrepTimeMinutes).toBe(5);

    expect(ticket.items).toHaveLength(1);
    expect(ticket.items[0].menuItemName).toBe("Tacos al Pastor");
    expect(ticket.items[0].quantity).toBe(3);
    expect(ticket.items[0].status).toBe("Preparing");
    expect(ticket.items[0].stationId).toBe("st-grill");
  });

  it("handles standard camelCase responses", () => {
    const rawCamel = {
      pageIndex: 1,
      pageSize: 50,
      count: 1,
      data: [
        {
          id: "t-001",
          restaurantId: "r-001",
          customerId: "c-001",
          orderNumber: "ORD-0001",
          status: "Ready",
          receivedAt: "2026-10-16T16:35:27Z",
          notes: "Gluten free",
          estimatedPrepTimeMinutes: 10,
          items: [],
        },
      ],
    };

    const normalized = normalizeKitchenQueueResponse(rawCamel);
    expect(normalized.data[0].id).toBe("t-001");
    expect(normalized.data[0].status).toBe("Ready");
  });

  it("handles null or non-string receivedAt gracefully", () => {
    const raw = {
      Id: "t-nodate",
      ReceivedAt: {}, // NodaTime Instant unconfigured serialization
    };

    const ticket = normalizeKitchenTicket(raw);
    expect(ticket.id).toBe("t-nodate");
    expect(typeof ticket.receivedAt).toBe("string");
    expect(Number.isNaN(new Date(ticket.receivedAt).getTime())).toBe(false);
  });
});
