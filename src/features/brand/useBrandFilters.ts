/**
 * useBrandFilters — URL-backed filter state for the brand list (?q=, ?active=).
 * Mirrors useStaffFilters.
 */

import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { QUERY_PARAM } from "../../router/pathNames";

export interface BrandFilters {
  query: string;
  active: boolean | undefined;
  setQuery: (q: string) => void;
  setActive: (active: boolean | undefined) => void;
}

export function useBrandFilters(): BrandFilters {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get(QUERY_PARAM.QUERY) ?? "";
  const activeRaw = searchParams.get("active");
  const active = activeRaw === "true" ? true : activeRaw === "false" ? false : undefined;

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === undefined || value === "") next.delete(key);
          else next.set(key, value);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setQuery = useCallback(
    (q: string) => {
      setParam(QUERY_PARAM.QUERY, q);
    },
    [setParam],
  );

  const setActive = useCallback(
    (isActive: boolean | undefined) => {
      setParam("active", isActive !== undefined ? String(isActive) : undefined);
    },
    [setParam],
  );

  return {
    query,
    active,
    setQuery,
    setActive,
  };
}
