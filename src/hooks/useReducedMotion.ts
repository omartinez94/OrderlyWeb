import { useEffect, useState } from "react";

/**
 * `useReducedMotion` — returns `true` when the user has requested
 * reduced motion via the OS-level `prefers-reduced-motion: reduce`
 * media query.
 *
 * SSR-safe: returns `false` during the initial render (matching the
 * server's environment, where the media query is unavailable) and
 * updates on the client once the media query is inspected.
 *
 * Every motion-dependent primitive in the base component library
 * must consume this hook and disable transitions/animations when
 * it returns `true`.
 *
 * @example
 *   const prefersReducedMotion = useReducedMotion();
 *   <div className={prefersReducedMotion ? '' : 'transition-transform'} />
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    function onChange(event: MediaQueryListEvent) {
      setPrefersReducedMotion(event.matches);
    }

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  return prefersReducedMotion;
}
