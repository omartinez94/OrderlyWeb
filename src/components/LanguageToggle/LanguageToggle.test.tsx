import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n, { LANGUAGE_STORAGE_KEY } from "../../lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

function renderToggle() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LanguageToggle />
    </I18nextProvider>,
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  void i18n.changeLanguage("en");
});

describe("LanguageToggle", () => {
  it("renders EN and ES options", async () => {
    await i18n.changeLanguage("en");
    renderToggle();
    expect(screen.getByRole("radio", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Spanish" })).toBeInTheDocument();
  });

  it("uses the active i18n language as the selected toggle", async () => {
    await i18n.changeLanguage("es");
    renderToggle();
    const es = screen.getByRole("radio", { name: "Español" });
    expect(es).toHaveAttribute("data-state", "on");
  });

  it("switches the active language when the user clicks ES", async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage("en");
    renderToggle();
    await user.click(screen.getByRole("radio", { name: "Spanish" }));
    expect(i18n.language).toBe("es");
  });

  it("persists the active language to localStorage", async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage("en");
    renderToggle();
    await user.click(screen.getByRole("radio", { name: "Spanish" }));
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("es");
  });

  it("renders the Spanish aria-label when language is Spanish", async () => {
    await i18n.changeLanguage("es");
    renderToggle();
    expect(screen.getByRole("radio", { name: "Inglés" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Español" })).toBeInTheDocument();
  });
});
