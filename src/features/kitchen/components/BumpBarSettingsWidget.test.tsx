import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithI18n } from "../../../test/i18n-wrapper";
import { BumpBarSettingsWidget } from "./BumpBarSettingsWidget";
import * as audioModule from "../hardware/audioFeedback";

describe("BumpBarSettingsWidget", () => {
  let playChimeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    playChimeSpy = vi.spyOn(audioModule, "playBumpChime").mockImplementation(() => {});
  });

  it("renders profile options, audio controls, and live test matrix", async () => {
    const { container } = renderWithI18n(<BumpBarSettingsWidget />, "en");

    expect(screen.getByText("Logic Controls KB9000")).toBeInTheDocument();
    expect(screen.getByText("10-Key Numeric Pad")).toBeInTheDocument();
    expect(screen.getByText(/Live scan code key tester/i)).toBeInTheDocument();
    expect(screen.getByText(/Screen wake lock/i)).toBeInTheDocument();
    expect(screen.getByText(/Audio feedback/i)).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("switches profile when preset button is clicked", async () => {
    const user = userEvent.setup();

    renderWithI18n(<BumpBarSettingsWidget />, "en");

    const numpadBtn = screen.getByRole("button", { name: "10-Key Numeric Pad" });
    await user.click(numpadBtn);

    expect(localStorage.getItem("orderly_kds_hardware_profile")).toBe("numpad-auxiliary");
  });

  it("plays test chime when Test Chime button is clicked", async () => {
    const user = userEvent.setup();

    renderWithI18n(<BumpBarSettingsWidget />, "en");

    const testAudioBtn = screen.getByRole("button", { name: /Test Chime/i });
    await user.click(testAudioBtn);

    expect(playChimeSpy).toHaveBeenCalled();
  });

  it("detects keypress and updates live test readout", async () => {
    renderWithI18n(<BumpBarSettingsWidget />, "en");

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Digit1", key: "1" }));
    });

    expect(screen.getByText(/SLOT_1 detected at/i)).toBeInTheDocument();
  });

  it("displays amber degradation banner when wakeLock is denied or unsupported", async () => {
    const user = userEvent.setup();

    renderWithI18n(<BumpBarSettingsWidget />, "en");

    const wakeLockBtn = screen.getByRole("button", { name: /Prevent screen sleep/i });
    await user.click(wakeLockBtn);

    expect(
      screen.getByText(/Screen lock prevention unavailable — display may sleep/i),
    ).toBeInTheDocument();
  });
});
