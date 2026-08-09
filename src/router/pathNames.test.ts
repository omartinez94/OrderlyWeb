import { describe, expect, it } from "vitest";
import { PATH, QUERY_PARAM } from "./pathNames";

describe("pathNames", () => {
  it("exposes the canonical admin CRM constants", () => {
    expect(PATH.ADMIN_BRANDS).toBe("/site/admin/brands");
    expect(PATH.ADMIN_BRAND_NEW).toBe("/site/admin/brands/new");
    expect(PATH.ADMIN_BRAND_DETAIL).toBe("/site/admin/brands/:id");
    expect(PATH.ADMIN_BRAND_RESTAURANTS).toBe("/site/admin/brands/:id/restaurants");
    expect(PATH.ADMIN_BRAND_STAFF).toBe("/site/admin/brands/:id/staff");
    expect(PATH.ADMIN_BRAND_SETTINGS).toBe("/site/admin/brands/:id/settings");
    expect(PATH.ADMIN_BRAND_AUDIT).toBe("/site/admin/brands/:id/audit");
    expect(PATH.ADMIN_RESTAURANT_NEW).toBe("/site/admin/restaurants/new");
    expect(PATH.ADMIN_RESTAURANT_STAFF).toBe("/site/admin/restaurants/:id/staff");
    expect(PATH.ADMIN_RESTAURANT_SETTINGS).toBe("/site/admin/restaurants/:id/settings");
    expect(PATH.ADMIN_RESTAURANT_AUDIT).toBe("/site/admin/restaurants/:id/audit");
    expect(PATH.ADMIN_USERS).toBe("/site/admin/users");
    expect(PATH.ADMIN_AUDIT).toBe("/site/admin/audit");
    expect(PATH.ADMIN_ROLES).toBe("/site/admin/roles");
  });

  it("resolves a brand detail path by replacing :id", () => {
    expect(PATH.ADMIN_BRAND_DETAIL.replace(":id", "abc")).toBe("/site/admin/brands/abc");
  });

  it("exposes new query parameter keys", () => {
    expect(QUERY_PARAM.BRAND_ID).toBe("brandId");
    expect(QUERY_PARAM.ROLE).toBe("role");
    expect(QUERY_PARAM.QUERY).toBe("q");
  });
});
