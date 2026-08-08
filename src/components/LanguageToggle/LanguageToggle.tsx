import "./LanguageToggle.css";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { useLanguage } from "../../hooks/useLanguage";
import type { SupportedLanguage } from "../../lib/i18n";

/**
 * LanguageToggle — globe-icon trigger that opens a Radix
 * `NavigationMenu` listing the supported languages. Uses
 * `viewport={false}` so the language options render in a compact
 * popover beneath the trigger rather than the full-width mega-menu
 * viewport.
 *
 * Accessibility:
 *   - Trigger carries `aria-label` sourced from the active locale
 *     (`common:languageToggle.label`).
 *   - Keyboard navigation handled by Radix (arrow keys rove, Enter
 *     selects, Escape closes and returns focus to the trigger).
 *   - The active option carries `data-active` so it stays visually
 *     marked as the current language.
 *   - A polite live region announces the new language to screen
 *     readers after a change.
 */
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation("common");

  const handleSelect = (next: string): void => {
    if (next === "en" || next === "es") {
      setLanguage(next as SupportedLanguage);
    }
  };

  const triggerLabel = t("languageToggle.label");
  const announce = t("languageToggle.changedTo", {
    lang: language === "es" ? "Español" : "English",
  });

  return (
    <>
      <NavigationMenu viewport={false} className="language-toggle">
        <NavigationMenuList>
          <NavigationMenuItem value="language">
            <NavigationMenuTrigger
              aria-label={triggerLabel}
              title={triggerLabel}
              className="language-toggle__trigger"
            >
              <Globe className="language-toggle__icon" aria-hidden="true" />
            </NavigationMenuTrigger>
            <NavigationMenuContent className="language-toggle__content">
              <ul className="language-toggle__list" role="list">
                <li>
                  <NavigationMenuLink asChild active={language === "en"}>
                    <button
                      type="button"
                      data-testid="language-option-en"
                      onClick={() => handleSelect("en")}
                      className="language-toggle__option"
                    >
                      {t("languageToggle.en")}
                    </button>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild active={language === "es"}>
                    <button
                      type="button"
                      data-testid="language-option-es"
                      onClick={() => handleSelect("es")}
                      className="language-toggle__option"
                    >
                      {t("languageToggle.es")}
                    </button>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {/*
        Polite live region: announces the language switch to assistive
        tech without stealing focus. Always rendered (off-screen via
        CSS) so the same DOM node exists across renders and the
        screen reader picks up the change reliably.
      */}
      <span role="status" aria-live="polite" className="sr-only">
        {announce}
      </span>
    </>
  );
}
