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

/**
 * Radix `NavigationMenu` mounts its content lazily — the option
 * buttons only land in the DOM after the trigger is clicked.
 *
 * The trigger's accessible name comes from the active translation
 * (`"Language"` in English, `"Idioma"` in Spanish), so the matcher
 * covers both.
 */
async function openLanguageMenu(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  const trigger = screen.getByRole("button", { name: /language|idioma/i });
  await user.click(trigger);
}

afterEach(() => {
  cleanup();
  window.localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  void i18n.changeLanguage("en");
});

describe("LanguageToggle", () => {
  it("renders EN and ES options", async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage("en");
    renderToggle();
    await openLanguageMenu(user);
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Spanish" })).toBeInTheDocument();
  });

  it("uses the active i18n language as the selected toggle", async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage("es");
    renderToggle();
    await openLanguageMenu(user);
    const es = screen.getByRole("button", { name: "Español" });
    // NavigationMenuLink forwards `active` as a boolean `data-active`
    // attribute (present when active, absent otherwise).
    expect(es).toHaveAttribute("data-active");
  });

  it("switches the active language when the user clicks ES", async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage("en");
    renderToggle();
    await openLanguageMenu(user);
    await user.click(screen.getByRole("button", { name: "Spanish" }));
    expect(i18n.language).toBe("es");
  });

  it("persists the active language to localStorage", async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage("en");
    renderToggle();
    await openLanguageMenu(user);
    await user.click(screen.getByRole("button", { name: "Spanish" }));
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("es");
  });

  it("renders the Spanish label when language is Spanish", async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage("es");
    renderToggle();
    await openLanguageMenu(user);
    expect(screen.getByRole("button", { name: "Inglés" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Español" })).toBeInTheDocument();
  });
});
