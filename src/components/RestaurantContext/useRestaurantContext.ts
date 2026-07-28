/**
 * useRestaurantContext — the single reader/writer of the active
 * restaurant ID in URL state.
 *
 * The restaurant ID lives at `?restaurantId=` in the URL so deep
 * links can carry the active context. This hook:
 *   - Reads the value via `useSearchParams`, returning `undefined`
 *     when missing or unparseable.
 *   - Writes through `setSearchParams({ restaurantId }, { replace: true })`
 *     so the URL change does not stack on the back button.
 *   - Strips invalid values silently and toasts a warning so the
 *     user knows the URL was corrected.
 *
 * Why a single hook (and not a context provider):
 *   - URL state is the source of truth. A wrapper context would
 *     shadow it and create divergence.
 *   - Tests can drive the hook through `useSearchParams` directly
 *     without wrapping in a provider.
 *
 * Phase 1 cleanup: the warning toast is fired inside a `useEffect`
 * keyed on `raw` so it does not toast during every render. Without
 * the effect the toast would fire each time the consuming component
 * re-rendered (which happens on every keystroke inside the
 * restaurant switcher's search input, for example).
 */

import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from "../ui/sonner";
import { QUERY_PARAM } from "../../router/pathNames";

export interface RestaurantContextValue {
  restaurantId: string | undefined;
  setRestaurantId: (id: string | undefined) => void;
}

const ALLOWED = /^[a-zA-Z0-9_-]{1,64}$/;

export function useRestaurantContext(): RestaurantContextValue {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(QUERY_PARAM.RESTAURANT_ID);
  const restaurantId = raw && ALLOWED.test(raw) ? raw : undefined;

  const setRestaurantId = useCallback(
    (id: string | undefined) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id === undefined || id === "") {
            next.delete(QUERY_PARAM.RESTAURANT_ID);
          } else {
            next.set(QUERY_PARAM.RESTAURANT_ID, id);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // If the URL had an invalid value, warn once when the bad value
  // appears (not on every render).
  useEffect(() => {
    if (raw && !restaurantId) {
      toast.warning("Invalid restaurantId in URL — cleared.", {
        description: "Restaurant context must be a short identifier.",
      });
    }
  }, [raw, restaurantId]);

  return { restaurantId, setRestaurantId };
}
