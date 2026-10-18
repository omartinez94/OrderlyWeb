import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { store } from "../../app/store";
import { renderWithI18n } from "../../test/i18n-wrapper";
import { EntityAuditLog } from "./EntityAuditLog";
import { axe } from "jest-axe";

describe("EntityAuditLog", () => {
  it("renders audit timeline for brand entity in English", async () => {
    const { container } = renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <EntityAuditLog entityType="brand" entityId="b-001" showEntityBadge />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText("Created")).toBeInTheDocument();
      expect(screen.getByText("Updated")).toBeInTheDocument();
    });

    expect(screen.getByText(/Initial brand creation/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Maya Okafor/i).length).toBeGreaterThan(0);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders empty state when no audit records exist", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <EntityAuditLog entityType="brand" entityId="b-non-existent" />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText(/No activity yet/i)).toBeInTheDocument();
    });
  });

  it("renders in Spanish locale", async () => {
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <EntityAuditLog entityType="brand" entityId="b-001" showEntityBadge />
        </MemoryRouter>
      </Provider>,
      "es",
    );

    await waitFor(() => {
      expect(screen.getByText("Registro de auditoría")).toBeInTheDocument();
    });
  });

  it("supports limit and expansion", async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <Provider store={store}>
        <MemoryRouter>
          <EntityAuditLog entityType="staff" entityId="s-001" limit={2} />
        </MemoryRouter>
      </Provider>,
      "en",
    );

    await waitFor(() => {
      expect(screen.getByText(/View full audit log \(5\)/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/View full audit log \(5\)/i));
    expect(screen.getByText("Collapse")).toBeInTheDocument();
  });
});
