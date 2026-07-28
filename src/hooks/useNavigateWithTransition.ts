/**
 * useNavigateWithTransition — wraps `react-router`'s `useNavigate`
 * with `startTransition` so non-urgent route changes (e.g. brand
 * click, restaurant switch) don't block user input.
 *
 * Vercel rule `rerender-transitions` applies to non-urgent updates:
 * navigation that the user explicitly triggers but does not need to
 * block the next interaction. Examples:
 *   - Header brand click: "go to my default zone"
 *   - Restaurant switcher: "open this restaurant"
 *   - Breadcrumb restaurant click: "go to this restaurant's view"
 *
 * Usage:
 *
 *   const navigate = useNavigateWithTransition();
 *   <button onClick={() => navigate("/home")}>Home</button>
 *
 * The first argument is a path string or a number (history delta).
 * Subsequent args mirror `useNavigate`'s `{ replace, state, ... }`.
 */

import { useCallback } from "react";
import { startTransition } from "react";
import { useNavigate, type NavigateOptions, type To } from "react-router";

export type NavigateWithTransition = (to: To, options?: NavigateOptions) => void;
export type NavigateWithTransitionDelta = (delta: number) => void;

export function useNavigateWithTransition(): NavigateWithTransition & NavigateWithTransitionDelta {
  const navigate = useNavigate();
  const navigateWithTransition = useCallback<NavigateWithTransition>(
    (to, options) => {
      startTransition(() => {
        navigate(to, options);
      });
    },
    [navigate],
  );
  const goWithTransition = useCallback<NavigateWithTransitionDelta>(
    (delta) => {
      startTransition(() => {
        navigate(delta);
      });
    },
    [navigate],
  );
  // The returned function handles both `navigate("/path")` and
  // `navigate(-1)` via overload-style dispatch on the first arg.
  return useCallback(
    ((toOrDelta: To | number, options?: NavigateOptions) => {
      if (typeof toOrDelta === "number") {
        goWithTransition(toOrDelta);
      } else {
        navigateWithTransition(toOrDelta, options);
      }
    }) as NavigateWithTransition & NavigateWithTransitionDelta,
    [navigateWithTransition, goWithTransition],
  );
}
