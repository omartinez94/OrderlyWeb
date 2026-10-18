import { useCallback } from "react";
import { useSearchParams } from "react-router";

export interface RestaurantFilters {
  query: string;
  brandId: string | undefined;
  status: string | undefined;
  setQuery: (q: string) => void;
  setBrandId: (b: string | undefined) => void;
  setStatus: (s: string | undefined) => void;
}

export function useRestaurantFilters(): RestaurantFilters {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const brandId = searchParams.get("brandId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

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

  const setQuery = useCallback((q: string) => setParam("q", q), [setParam]);
  const setBrandId = useCallback((b: string | undefined) => setParam("brandId", b), [setParam]);
  const setStatus = useCallback((s: string | undefined) => setParam("status", s), [setParam]);

  return { query, brandId, status, setQuery, setBrandId, setStatus };
}
