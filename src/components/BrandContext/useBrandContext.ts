/**
 * useBrandContext — reads and writes the active brand ID (?brandId=)
 * from/to URL search parameters.
 *
 * Mirrors the precedent set by useRestaurantContext.
 */

import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { QUERY_PARAM } from "../../router/pathNames";

export interface BrandContextValue {
  brandId: string | undefined;
  setBrandId: (id: string | undefined) => void;
}

const ALLOWED = /^[a-zA-Z0-9_-]{1,64}$/;

export function useBrandContext(): BrandContextValue {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = searchParams.get(QUERY_PARAM.BRAND_ID);
  const brandId = raw && ALLOWED.test(raw) ? raw : undefined;

  const setBrandId = useCallback(
    (id: string | undefined) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id === undefined || id === "") {
            next.delete(QUERY_PARAM.BRAND_ID);
          } else {
            next.set(QUERY_PARAM.BRAND_ID, id);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { brandId, setBrandId };
}
