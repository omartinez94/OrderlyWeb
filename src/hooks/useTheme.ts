import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Theme management for Orderly Web.
 *
 * Three modes:
 *   - 'light'  -> always light
 *   - 'dark'   -> always dark
 *   - 'system' -> follow OS preference (default on first visit)
 *
 * The pre-hydration `<script>` in `index.html` resolves and applies
 * the theme *before* the module bundle paints. This hook then takes
 * over for runtime updates: writes the user's choice to localStorage,
 * applies the resolved theme to `<html data-theme="...">`, and when
 * mode is 'system', listens for OS-level preference changes via
 * matchMedia.
 *
 * Usage:
 *   const { mode, resolvedTheme, setMode, toggle } = useTheme();
 *   <ThemeToggle onClick={toggle} />  // simple light/dark flip
 *   <select onChange={(e) => setMode(e.target.value as ThemeMode)}>...    // explicit
 */

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "orderly-theme";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

// The stored mode is a session-stable value. Reading localStorage on
// every render is wasteful; cache the first read for the lifetime of
// the module. After hydration the value is also reflected via the
// `mode` state, so subsequent reads route through `useState`.
let cachedStoredMode: ThemeMode | undefined;
function readStoredMode(): ThemeMode {
  if (cachedStoredMode !== undefined) return cachedStoredMode;
  if (typeof window === "undefined") {
    cachedStoredMode = "system";
    return cachedStoredMode;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  cachedStoredMode = isThemeMode(stored) ? stored : "system";
  return cachedStoredMode;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveMode(mode: ThemeMode): ResolvedTheme {
  return mode === "system" ? getSystemTheme() : mode;
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolved);
}

function writeStoredMode(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
  cachedStoredMode = mode;
}

export interface UseThemeResult {
  /** User-selected mode (may be 'system'). */
  mode: ThemeMode;
  /** What actually gets applied to <html> — never 'system'. */
  resolvedTheme: ResolvedTheme;
  /** Set the user's preferred mode. Persists to localStorage. */
  setMode: (mode: ThemeMode) => void;
  /** Flip between light and dark (does not touch 'system'). */
  toggle: () => void;
}

export function useTheme(): UseThemeResult {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);

  // Derived during render — no effect, no setState ping-pong.
  const resolvedTheme = useMemo(() => resolveMode(mode), [mode]);

  // Effect's only job: paint the DOM + persist user choice. The
  // resolvedTheme value is already computed above.
  useEffect(() => {
    applyTheme(resolvedTheme);
    writeStoredMode(mode);
  }, [mode, resolvedTheme]);

  // When the user is on 'system', react to OS-level changes.
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (): void => {
      applyTheme(mq.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => {
      mq.removeEventListener("change", handler);
    };
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const toggle = useCallback(() => {
    setModeState((current) => {
      const resolved = resolveMode(current);
      return resolved === "dark" ? "light" : "dark";
    });
  }, []);

  return { mode, resolvedTheme, setMode, toggle };
}
