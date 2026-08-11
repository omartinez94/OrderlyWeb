import { useEffect, useRef, useState } from "react";

/**
 * Tracks scroll progress of a container element through the viewport.
 *
 * @param offset - Fine-tune when the progress starts/ends.
 *   `start`: fraction of viewport height to delay start (default 0)
 *   `end`: fraction of viewport height to end early (default 0)
 * @returns `{ ref, progress }` — attach `ref` to the container, read `progress` as 0–1.
 *
 * When `prefers-reduced-motion` is active, progress is locked at 0.5
 * so both card faces are partially visible (CSS handles the layout).
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>(
  offset: { start?: number; end?: number } = {},
) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Respect reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setProgress(0.5);
      return;
    }

    const updateProgress = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // The "sticky runway" is the extra height beyond the viewport.
      // A min-h-[200vh] container has 100vh of runway.
      // The sticky inner stays pinned while rect.top goes from 0
      // (section top at viewport top) to -(height - viewportHeight)
      // (section bottom at viewport bottom).
      const runway = rect.height - viewportHeight;

      if (runway <= 0) {
        // Container is shorter than viewport — no sticky phase
        setProgress(0);
        return;
      }

      // rect.top = 0  → sticky just engaged  → progress = 0
      // rect.top = -runway → sticky about to release → progress = 1
      const scrolledIntoSticky = -rect.top;
      const p = Math.min(1, Math.max(0, scrolledIntoSticky / runway));

      setProgress(p);
    };

    const handleScroll = () => {
      if (rafId.current !== null) return;
      rafId.current = requestAnimationFrame(() => {
        updateProgress();
        rafId.current = null;
      });
    };

    // Initial calculation
    updateProgress();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [offset.start, offset.end]);

  return { ref, progress };
}
