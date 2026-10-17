import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { axe } from "jest-axe";
import { store } from "../../../app/store";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { CancelOrderDialog } from "./CancelOrderDialog";

describe("CancelOrderDialog", () => {
  it("does not render dialog content when open is false", () => {
    renderWithI18n(
      <Provider store={store}>
        <CancelOrderDialog
          orderId="o-001"
          orderNumber="ORD-2026-0001"
          open={false}
          onOpenChange={vi.fn()}
        />
      </Provider>,
      "en",
    );

    expect(screen.queryByText("Cancel Order ORD-2026-0001")).not.toBeInTheDocument();
  });

  it("renders form elements and enforces reason selection", async () => {
    const onOpenChange = vi.fn();
    const { container } = renderWithI18n(
      <Provider store={store}>
        <CancelOrderDialog
          orderId="o-001"
          orderNumber="ORD-2026-0001"
          open={true}
          onOpenChange={onOpenChange}
        />
      </Provider>,
      "en",
    );

    expect(screen.getByText("Cancel Order ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Cancellation Reason *")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: "Confirm Cancellation" });
    expect(submitBtn).toBeDisabled();

    // Axe audit
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("calls onOpenChange(false) when Keep Order button is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithI18n(
      <Provider store={store}>
        <CancelOrderDialog
          orderId="o-001"
          orderNumber="ORD-2026-0001"
          open={true}
          onOpenChange={onOpenChange}
        />
      </Provider>,
      "en",
    );

    const cancelBtn = screen.getByRole("button", { name: "Keep Order" });
    await user.click(cancelBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
