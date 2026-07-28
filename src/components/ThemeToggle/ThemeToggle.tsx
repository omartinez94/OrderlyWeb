import "./ThemeToggle.css";
import { useTheme } from "../../hooks/useTheme";
import { MoonIcon, SunIcon } from "../Header/icons";

/**
 * ThemeToggle — flips between light and dark mode.
 *
 * Shows a sun when in dark mode (click to go light) and a moon when in
 * light mode (click to go dark). Icons are sourced from the shared
 * Header icons module (`src/components/Header/icons/`) so a single
 * change updates every usage.
 */
export function ThemeToggle() {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
