import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "./router";
import { store } from "../app/store";
import { setCredentials } from "../app/session/sessionSlice";
import { ROLE_PERMISSIONS, type Role } from "../types/auth";

const SEED_ADMIN = {
  accessToken: "test-access-token",
  expiresAt: Date.now() + 15 * 60 * 1000,
  user: { id: "u-001", name: "Super Admin", email: "admin@orderly.com", initials: "SA" },
  roles: ["SuperAdmin", "KitchenManager"] as readonly Role[],
  permissions: ROLE_PERMISSIONS.SuperAdmin,
};

function renderWithRoute(initialEntry: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
}

describe("router", () => {
  beforeEach(() => {
    store.dispatch(setCredentials(SEED_ADMIN));
  });
  afterEach(() => cleanup());

  describe("/home", () => {
    it("renders the marketing home", async () => {
      renderWithRoute("/home");
      await waitFor(
        () => {
          expect(screen.getByRole("heading", { name: /One unified OS/i })).toBeInTheDocument();
        },
        { timeout: 8000 },
      );
    }, 15000);
  });

  describe("unknown paths", () => {
    it("renders the NotFoundPage", async () => {
      renderWithRoute("/this-route-does-not-exist");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Not found" })).toBeInTheDocument();
      });
    });
  });

  describe("/site/admin", () => {
    it("renders the admin dashboard for SuperAdmin", async () => {
      renderWithRoute("/site/admin");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
      });
    });

    it("renders the staff list for /site/admin/staff", async () => {
      renderWithRoute("/site/admin/staff");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Staff" })).toBeInTheDocument();
      });
    });

    it("renders the brand list at /site/admin/brands", async () => {
      renderWithRoute("/site/admin/brands");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Brands" })).toBeInTheDocument();
      });
    });

    it("renders the new-brand page at /site/admin/brands/new", async () => {
      renderWithRoute("/site/admin/brands/new");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Create brand" })).toBeInTheDocument();
      });
    });

    it("renders the brand detail page at /site/admin/brands/:id", async () => {
      renderWithRoute("/site/admin/brands/b-001");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Acme Hospitality Group" })).toBeInTheDocument();
      });
    });

    it("renders the audit splash at /site/admin/audit", async () => {
      renderWithRoute("/site/admin/audit");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Audit" })).toBeInTheDocument();
      });
    });

    it("renders the roles splash at /site/admin/roles", async () => {
      renderWithRoute("/site/admin/roles");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Roles and permissions" })).toBeInTheDocument();
      });
    });

    it("redirects /site/admin/users to /site/admin/staff", async () => {
      renderWithRoute("/site/admin/users");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Staff" })).toBeInTheDocument();
      });
    });
  });

  describe("/site/kitchen", () => {
    it("renders the kitchen order queue", async () => {
      renderWithRoute("/site/kitchen");
      await waitFor(
        () => {
          expect(screen.getByRole("heading", { name: "Order queue" })).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  describe("/site/restaurant", () => {
    it("renders the restaurant dashboard", async () => {
      renderWithRoute("/site/restaurant");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Restaurant dashboard" })).toBeInTheDocument();
      });
    });

    it("renders the order list for /site/restaurant/orders", async () => {
      renderWithRoute("/site/restaurant/orders");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Orders" })).toBeInTheDocument();
      });
    });
  });

  describe("default-zone redirect", () => {
    it("redirects / to /site/admin for SuperAdmin", async () => {
      renderWithRoute("/");
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
      });
    });
  });
});
