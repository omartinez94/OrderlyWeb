/**
 * RestaurantAssignmentGrid — Phase 2 of the staff-management plan.
 *
 * A table-style surface for per-restaurant role grants. Rows =
 * restaurants; columns = the actor's grantable roles; each cell
 * is a checkbox. The component is controlled: the parent owns
 * the `Record<restaurantId, Set<role>>` map and the toggle
 * callbacks.
 *
 * Phase 5 of the foundation plan owns the role list source
 * (`useGrantableRoles`); the grid consumes that list and renders
 * one column per role.
 *
 * Vercel rules:
 *   - `js-set-map-lookups` — `Set<Role>` per restaurant for O(1)
 *     membership checks on toggle.
 *   - `rendering-content-visibility` — the `<tbody>` carries
 *     `content-visibility: auto` for long restaurant lists.
 */

import { useMemo } from "react";
import type { Role } from "../../types/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui";

export interface RestaurantAssignment {
  restaurantId: string;
  /** Roles granted at this restaurant. */
  roles: readonly Role[];
}

export interface RestaurantAssignmentGridProps {
  restaurants: ReadonlyArray<{ id: string; label: string }>;
  grantableRoles: readonly Role[];
  /** Current grants keyed by restaurant id. */
  grants: ReadonlyMap<string, ReadonlySet<Role>>;
  onToggle: (restaurantId: string, role: Role) => void;
}

export function RestaurantAssignmentGrid({
  restaurants,
  grantableRoles,
  grants,
  onToggle,
}: RestaurantAssignmentGridProps) {
  // Memoize the row data so toggling one cell doesn't re-render
  // every row.
  const rows = useMemo(
    () =>
      restaurants.map((r) => ({
        restaurantId: r.id,
        label: r.label,
        roles: grants.get(r.id) ?? new Set<Role>(),
      })),
    [restaurants, grants],
  );

  return (
    <Table className="bg-surface-overlay border-border-subtle rounded-control border">
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Restaurant</TableHead>
          {grantableRoles.map((role) => (
            <TableHead key={role} scope="col" className="text-center">
              {role}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody style={{ contentVisibility: "auto" }}>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={grantableRoles.length + 1}
              className="text-ink-muted font-sans text-sm"
            >
              No restaurants available.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.restaurantId}>
              <TableCell className="text-ink font-sans text-sm font-medium">{row.label}</TableCell>
              {grantableRoles.map((role) => {
                const checked = row.roles.has(role);
                return (
                  <TableCell key={role} className="text-center">
                    <input
                      type="checkbox"
                      aria-label={`${role} at ${row.label}`}
                      checked={checked}
                      onChange={() => onToggle(row.restaurantId, role)}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
