/**
 * useStaffFilters — URL query-param-backed filter state for the
 * staff list. The active `restaurantId`, `role`, and search query
 * all live in the URL so deep-links survive a refresh and the
 * back button restores the previous filter set.
 *
 * Vercel `js-set-map-lookups` — role filter uses a Set for O(1)
 * membership checks when filtering the rows.
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { Role } from "../../types/auth";

export interface StaffFilters {
  restaurantId: string | undefined;
  role: Role | undefined;
  query: string;
  setRestaurantId: (id: string | undefined) => void;
  setRole: (role: Role | undefined) => void;
  setQuery: (query: string) => void;
  matchesRole: (staffRoles: readonly Role[]) => boolean;
}

const ROLES: readonly Role[] = [
  "SuperAdmin",
  "RestaurantAdmin",
  "Manager",
  "KitchenManager",
  "KitchenStaff",
  "Waiter",
  "Cashier",
  "Host",
];

function isRole(value: string | null): value is Role {
  return value !== null && (ROLES as readonly string[]).includes(value);
}

export function useStaffFilters(): StaffFilters {
  const [searchParams, setSearchParams] = useSearchParams();

  const restaurantId = searchParams.get("restaurantId") ?? undefined;
  const roleRaw = searchParams.get("role");
  const role = isRole(roleRaw) ? roleRaw : undefined;
  const query = searchParams.get("q") ?? "";

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

  const setRestaurantId = useCallback(
    (id: string | undefined) => setParam("restaurantId", id),
    [setParam],
  );
  const setRole = useCallback((next: Role | undefined) => setParam("role", next), [setParam]);
  const setQuery = useCallback((q: string) => setParam("q", q), [setParam]);

  const roleSet = useMemo(() => (role ? new Set([role]) : null), [role]);

  const matchesRole = useCallback(
    (staffRoles: readonly Role[]): boolean => {
      if (!roleSet) return true;
      for (const r of staffRoles) if (roleSet.has(r)) return true;
      return false;
    },
    [roleSet],
  );

  return { restaurantId, role, query, setRestaurantId, setRole, setQuery, matchesRole };
}
