import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { routes } from "./router";

function renderWithRoute(initialEntry: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return render(<RouterProvider router={router} />);
}

describe("router", () => {
  afterEach(() => cleanup());

  describe("/home", () => {
    it("renders the marketing home", async () => {
      renderWithRoute("/home");
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: /One tool for the kitchen/i }),
        ).toBeInTheDocument();
      });
    });
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
        expect(screen.getByRole("heading", { name: "Admin dashboard" })).toBeInTheDocument();
      });
    });

    it("renders the staff list for /site/admin/staff", async () => {
      renderWithRoute("/site/admin/staff");
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
        expect(screen.getByRole("heading", { name: "Admin dashboard" })).toBeInTheDocument();
      });
    });
  });
});
