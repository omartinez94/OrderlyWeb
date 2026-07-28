import { describe, expect, it } from "vitest";
import { defaultZoneForRoles, canAccessZone } from "./defaultZone";
import { PATH } from "../router/pathNames";

describe("defaultZoneForRoles", () => {
  it("returns /site/admin for SuperAdmin", () => {
    expect(defaultZoneForRoles(["SuperAdmin"])).toBe(PATH.ADMIN);
  });

  it("returns /site/kitchen for KitchenStaff", () => {
    expect(defaultZoneForRoles(["KitchenStaff"])).toBe(PATH.KITCHEN);
  });

  it("returns /site/kitchen for KitchenManager", () => {
    expect(defaultZoneForRoles(["KitchenManager"])).toBe(PATH.KITCHEN);
  });

  it("returns /site/restaurant for Waiter", () => {
    expect(defaultZoneForRoles(["Waiter"])).toBe(PATH.RESTAURANT);
  });

  it("returns /site/restaurant for Manager", () => {
    expect(defaultZoneForRoles(["Manager"])).toBe(PATH.RESTAURANT);
  });

  it("returns /site/restaurant for RestaurantAdmin", () => {
    expect(defaultZoneForRoles(["RestaurantAdmin"])).toBe(PATH.RESTAURANT);
  });

  it("returns /site/restaurant for Cashier", () => {
    expect(defaultZoneForRoles(["Cashier"])).toBe(PATH.RESTAURANT);
  });

  it("returns /site/restaurant for Host", () => {
    expect(defaultZoneForRoles(["Host"])).toBe(PATH.RESTAURANT);
  });

  it("returns /site/admin when SuperAdmin coexists with KitchenManager", () => {
    // Higher-privilege zone wins.
    expect(defaultZoneForRoles(["SuperAdmin", "KitchenManager"])).toBe(PATH.ADMIN);
  });

  it("returns /site/kitchen when KitchenManager coexists with Manager", () => {
    // Order: SuperAdmin > KitchenManager > RestaurantAdmin/Manager/Waiter/Cashier/Host
    expect(defaultZoneForRoles(["KitchenManager", "Manager"])).toBe(PATH.KITCHEN);
  });

  it("returns null when no roles resolve", () => {
    expect(defaultZoneForRoles([])).toBeNull();
  });
});

describe("canAccessZone", () => {
  it("SuperAdmin can access admin", () => {
    expect(canAccessZone("admin", ["SuperAdmin"])).toBe(true);
  });

  it("KitchenStaff cannot access admin", () => {
    expect(canAccessZone("admin", ["KitchenStaff"])).toBe(false);
  });

  it("KitchenManager can access kitchen", () => {
    expect(canAccessZone("kitchen", ["KitchenManager"])).toBe(true);
  });

  it("Waiter cannot access kitchen", () => {
    expect(canAccessZone("kitchen", ["Waiter"])).toBe(false);
  });

  it("Manager can access restaurant", () => {
    expect(canAccessZone("restaurant", ["Manager"])).toBe(true);
  });

  it("SuperAdmin can access restaurant", () => {
    expect(canAccessZone("restaurant", ["SuperAdmin"])).toBe(true);
  });
});
