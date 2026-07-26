import { useEffect, useRef, type RefObject } from 'react';

/**
 * Selectable focusable elements inside a trap container. The selector
 * mirrors the Radix UI `focusScope` selector so behavior matches the
 * Radix-based overlays in the base library.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

export interface UseFocusTrapOptions {
  /** Restore focus to the previously-focused element on unmount. Default `true`. */
  restoreFocus?: boolean;
  /** Pause the trap (e.g. when the overlay is closed). Default `false`. */
  paused?: boolean;
  /** Auto-focus the first focusable element on mount. Default `false`. */
  autoFocus?: boolean;
}

/**
 * `useFocusTrap` — focus-safe container for in-house overlays.
 *
 * The Radix-based primitives (Dialog, Sheet, Popover, DropdownMenu,
 * AlertDialog) handle focus traps internally, so this hook is the
 * fallback for any plain overlay component the library needs to add
 * outside of Radix. Use it only when no Radix primitive fits.
 *
 * Keyboard contract:
 *   - Tab cycles forward through focusable elements.
 *   - Shift+Tab cycles backward.
 *   - On mount, optionally auto-focuses the first focusable element.
 *   - On unmount, optionally restores focus to the previously-focused element.
 *
 * @example
 *   const ref = useFocusTrap<HTMLDivElement>({ restoreFocus: true });
 *   return <div ref={ref} role="dialog" aria-modal="true">…</div>;
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions = {}
): RefObject<T | null> {
  const { restoreFocus = true, paused = false, autoFocus = false } = options;
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (paused) return;

    const container = ref.current;
    if (!container) return;

    // Local non-null binding so the closures below don't lose narrowing.
    const root: HTMLElement = container;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    function getFocusable(): HTMLElement[] {
      return Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute('aria-hidden'));
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !root.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    if (autoFocus) {
      const focusable = getFocusable();
      focusable[0]?.focus();
    }

    root.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (restoreFocus && previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [restoreFocus, paused, autoFocus]);

  return ref;
}
