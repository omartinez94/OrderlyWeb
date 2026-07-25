import { useCallback, useEffect, useState } from 'react';

/**
 * Theme management for Orderly Web.
 *
 * Three modes:
 *   - 'light'  -> always light
 *   - 'dark'   -> always dark
 *   - 'system' -> follow OS preference (default on first visit)
 *
 * The hook writes the user's choice to localStorage and applies the resolved
 * theme to <html data-theme="...">. When mode is 'system', it listens for
 * OS-level preference changes via matchMedia and re-applies.
 *
 * Usage:
 *   const { mode, resolvedTheme, setMode, toggle } = useTheme();
 *   <ThemeToggle onClick={toggle} />  // simple light/dark flip
 *   <select onChange={(e) => setMode(e.target.value as ThemeMode)}>...    // explicit
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'orderly-theme';

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveMode(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? getSystemTheme() : mode;
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
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
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveMode(readStoredMode()),
  );

  // Apply the resolved theme whenever mode changes.
  useEffect(() => {
    const next = resolveMode(mode);
    setResolvedTheme(next);
    applyTheme(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode]);

  // When the user is on 'system', react to OS-level changes.
  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (): void => {
      const next: ResolvedTheme = mq.matches ? 'dark' : 'light';
      setResolvedTheme(next);
      applyTheme(next);
    };
    mq.addEventListener('change', handler);
    return () => {
      mq.removeEventListener('change', handler);
    };
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
  }, []);

  const toggle = useCallback(() => {
    setModeState((current) => {
      const resolved = resolveMode(current);
      return resolved === 'dark' ? 'light' : 'dark';
    });
  }, []);

  return { mode, resolvedTheme, setMode, toggle };
}
