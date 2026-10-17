import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { VirtualBumpBarPad } from "./VirtualBumpBarPad";
import * as bumpBarChannelModule from "../hardware/bumpBarChannel";

describe("VirtualBumpBarPad", () => {
  let publishSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    publishSpy = vi.spyOn(bumpBarChannelModule, "publishBumpAction").mockImplementation(() => {});
  });

  it("renders the 24-key hardware simulator layout in English", async () => {
    const { container } = renderWithI18n(<VirtualBumpBarPad />, "en");

    expect(screen.getByText("LOGIC CONTROLS KB9000")).toBeInTheDocument();
    expect(screen.getByText("READY")).toBeInTheDocument();
    expect(screen.getByText("IDLE")).toBeInTheDocument();

    // Verify slot keys 1 to 8
    for (let slot = 1; slot <= 8; slot++) {
      expect(
        screen.getByRole("button", { name: new RegExp(`^${slot} \\(${slot}\\)$`) }),
      ).toBeInTheDocument();
    }

    // Verify primary actions
    expect(screen.getByRole("button", { name: /BUMP/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /RECALL/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /PREV/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /NEXT/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /HOLD/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SUMM/i })).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders localized labels in Spanish", () => {
    renderWithI18n(<VirtualBumpBarPad />, "es");

    expect(screen.getByRole("button", { name: /DESPACHAR/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /RECUPERAR/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ANTERIOR/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SIGUIENTE/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /RETENER/i })).toBeInTheDocument();
  });

  it("publishes BUMP_SELECTED and triggers onAction callback when BUMP is clicked", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    renderWithI18n(<VirtualBumpBarPad onAction={onAction} />, "en");

    const bumpBtn = screen.getByRole("button", { name: /BUMP/i });
    await user.click(bumpBtn);

    expect(publishSpy).toHaveBeenCalledWith("BUMP_SELECTED", "virtual-popup");
    expect(onAction).toHaveBeenCalledWith("BUMP_SELECTED");
    expect(screen.getByText(/LAST: BUMP/i)).toBeInTheDocument();
  });

  it("publishes SLOT_1 when slot 1 button is clicked", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    renderWithI18n(<VirtualBumpBarPad onAction={onAction} />, "en");

    const slot1Btn = screen.getByRole("button", { name: /^1 \(1\)$/ });
    await user.click(slot1Btn);

    expect(publishSpy).toHaveBeenCalledWith("SLOT_1", "virtual-popup");
    expect(onAction).toHaveBeenCalledWith("SLOT_1");
    expect(screen.getByText(/LAST: 1/i)).toBeInTheDocument();
  });

  it("publishes RECALL_LAST when RECALL is clicked", async () => {
    const user = userEvent.setup();

    renderWithI18n(<VirtualBumpBarPad />, "en");

    const recallBtn = screen.getByRole("button", { name: /RECALL/i });
    await user.click(recallBtn);

    expect(publishSpy).toHaveBeenCalledWith("RECALL_LAST", "virtual-popup");
    expect(screen.getByText(/LAST: RECALL/i)).toBeInTheDocument();
  });

  it("publishes NEXT_PAGE and PREV_PAGE when navigation buttons are clicked", async () => {
    const user = userEvent.setup();

    renderWithI18n(<VirtualBumpBarPad />, "en");

    await user.click(screen.getByRole("button", { name: /NEXT/i }));
    expect(publishSpy).toHaveBeenCalledWith("NEXT_PAGE", "virtual-popup");

    await user.click(screen.getByRole("button", { name: /PREV/i }));
    expect(publishSpy).toHaveBeenCalledWith("PREV_PAGE", "virtual-popup");
  });
});
