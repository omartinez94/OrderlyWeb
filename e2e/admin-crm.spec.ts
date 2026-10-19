import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures/withLocale";

/**
 * Mocks the catalog service API endpoints so E2E tests run reliably
 * without requiring the live .NET microservices backend running on port 6004.
 */
async function setupCatalogMocks(page: Page) {
  await page.route("**/catalog-api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (path.includes("/catalog-api/audit")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "aud-001",
            entityType: "Brand",
            entityId: "b-001",
            action: "update",
            actorId: "usr-1",
            actorName: "Jane Doe",
            timestamp: "2026-10-18T10:00:00Z",
            changes: [
              { field: "name", oldValue: "Acme Group", newValue: "Acme Hospitality Group" },
            ],
          },
        ]),
      });
      return;
    }

    if (path.endsWith("/catalog-api/brands/b-001")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
      return;
    }

    if (path.endsWith("/catalog-api/brands")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
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
        ]),
      });
      return;
    }

    if (path.endsWith("/catalog-api/restaurants/r-001")) {
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
          ownerId: "u-admin",
          address: {
            line1: "123 Main St",
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
          operatingHours: [],
          createdAt: "2026-02-01T10:00:00Z",
        }),
      });
      return;
    }

    if (path.includes("/catalog-api/restaurants")) {
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
            ownerId: "u-admin",
            address: {
              line1: "123 Main St",
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
            operatingHours: [],
            createdAt: "2026-02-01T10:00:00Z",
          },
        ]),
      });
      return;
    }

    if (path.endsWith("/catalog-api/settings")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          defaultTimezone: "UTC",
          defaultCurrency: "USD",
          supportEmail: "support@orderly.io",
          featureFlags: {
            enableCrossBrandReporting: true,
            enableAiMenuOptimization: false,
            enableSmsNotifications: true,
            maintenanceMode: false,
          },
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe("Admin CRM Zone — English", () => {
  test.use({ withLocale: "en" });

  test.beforeEach(async ({ page }) => {
    await setupCatalogMocks(page);
  });

  test("renders Admin Dashboard with KPIs, Brands, and Attention list", async ({ page }) => {
    await page.goto("/site/admin");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Brands under management")).toBeVisible();
    await expect(page.getByText("Recent activity")).toBeVisible();
  });

  test("navigates to Brands and allows viewing Brand Detail and tabs", async ({ page }) => {
    await page.goto("/site/admin/brands");
    await expect(page.getByRole("heading", { name: "Brands" })).toBeVisible();
    await expect(page.getByText("Acme Hospitality Group")).toBeVisible();

    // Click brand to visit detail overview
    await page.getByText("Acme Hospitality Group").click();
    await expect(page.getByRole("heading", { name: "Acme Hospitality Group" })).toBeVisible();

    // Verify tabs are clickable and render corresponding surfaces
    await page.getByRole("tab", { name: "Restaurants" }).click();
    await expect(page.getByRole("heading", { name: "Restaurants" })).toBeVisible();

    await page.getByRole("tab", { name: "Staff" }).click();
    await expect(page.getByText(/Staff list by brand is not yet available/i)).toBeVisible();

    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(page.getByText("Basic information")).toBeVisible();

    await page.getByRole("tab", { name: "Audit" }).click();
    await expect(page.getByRole("heading", { name: /audit log/i })).toBeVisible();
  });

  test("renders Brand creation page", async ({ page }) => {
    await page.goto("/site/admin/brands/new");
    await expect(page.getByRole("heading", { name: "Create brand" })).toBeVisible();
    await expect(page.locator("#brand-name")).toBeVisible();
  });

  test("renders Restaurants list and detail tabs", async ({ page }) => {
    await page.goto("/site/admin/restaurants");
    await expect(page.getByRole("heading", { name: "Restaurants" })).toBeVisible();
    await expect(page.getByText("Acme Bistro — Downtown")).toBeVisible();

    // Click restaurant to view detail
    await page.getByText("Acme Bistro — Downtown").click();
    await expect(page.getByRole("heading", { name: "Acme Bistro — Downtown" })).toBeVisible();

    // Tab navigation
    await page.getByRole("tab", { name: "Settings" }).click();
    await expect(page.getByText("Identity")).toBeVisible();
  });

  test("renders Roles matrix and Global Settings", async ({ page }) => {
    await page.goto("/site/admin/roles");
    await expect(page.getByRole("heading", { name: "Roles and permissions" })).toBeVisible();
    await expect(page.getByText("Super Admin")).toBeVisible();

    await page.goto("/site/admin/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByLabel(/Time zone/i)).toBeVisible();
  });

  test("passes accessibility checks on admin dashboard", async ({ page }) => {
    await page.goto("/site/admin");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toEqual([]);
  });
});

test.describe("Admin CRM Zone — Spanish", () => {
  test.use({ withLocale: "es" });

  test.beforeEach(async ({ page }) => {
    await setupCatalogMocks(page);
  });

  test("renders Admin Dashboard localized in Spanish", async ({ page }) => {
    await page.goto("/site/admin");
    await expect(page.getByRole("heading", { name: "Panel" })).toBeVisible();
    await expect(page.getByText("Marcas bajo gestión")).toBeVisible();
    await expect(page.getByText("Actividad reciente")).toBeVisible();
  });

  test("renders Brands list and localized tabs in Spanish", async ({ page }) => {
    await page.goto("/site/admin/brands");
    await expect(page.getByRole("heading", { name: "Marcas" })).toBeVisible();
    await expect(page.getByText("Acme Hospitality Group")).toBeVisible();

    await page.getByText("Acme Hospitality Group").click();
    await expect(page.getByRole("heading", { name: "Acme Hospitality Group" })).toBeVisible();

    // Spanish tabs
    await page.getByRole("tab", { name: "Restaurantes" }).click();
    await expect(page.getByRole("heading", { name: "Restaurantes" })).toBeVisible();

    await page.getByRole("tab", { name: "Personal" }).click();
    await expect(
      page.getByText(/La lista de personal por marca aún no está disponible/i),
    ).toBeVisible();

    await page.getByRole("tab", { name: "Ajustes" }).click();
    await expect(page.getByText("Información básica")).toBeVisible();

    await page.getByRole("tab", { name: "Auditoría" }).click();
    await expect(page.getByRole("heading", { name: /registro de auditoría/i })).toBeVisible();
  });

  test("renders Roles and Settings in Spanish", async ({ page }) => {
    await page.goto("/site/admin/roles");
    await expect(page.getByRole("heading", { name: "Roles y permisos" })).toBeVisible();

    await page.goto("/site/admin/settings");
    await expect(page.getByRole("heading", { name: "Ajustes" })).toBeVisible();
  });
});
