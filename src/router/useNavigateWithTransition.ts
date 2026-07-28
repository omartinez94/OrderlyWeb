/**
 * useNavigateWithTransition — opt-in `useNavigate` wrapper that
 * wraps navigation in React's `useTransition`. Non-urgent navigation
 * (e.g. pagination, sidebar item clicks, restaurant switcher)
 * shouldn't block the user's pending input.
 *
 * Usage:
 *   const navigate = useNavigateWithTransition();
 *   navigate("/admin/staff");
 *
 * Urgent navigation (the sign-out "leave now" flow, the router
 * error redirect) keeps using `useNavigate` directly.
 *
 * Note: React Router v7 does not export `startTransition` as a
 * `react-router` API. We use React's `useTransition` directly — the
 * flag is read by the router internally on the next state update.
 */

import { useTransition } from "react";
import { useNavigate, type NavigateOptions, type To } from "react-router";

export function useNavigateWithTransition() {
  const [, startTransition] = useTransition();
  const navigate = useNavigate();

  return (to: To, options?: NavigateOptions): void => {
    startTransition(() => {
      navigate(to, options);
    });
  };
}
