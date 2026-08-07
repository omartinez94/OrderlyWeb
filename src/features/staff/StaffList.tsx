/**
 * StaffList — the table surface for `/site/admin/staff`.
 *
 * Cross-cutting Vercel rules:
 *   - `rendering-content-visibility` — `<tbody>` carries
 *     `content-visibility: auto` so a long table paints without
 *     re-laying-out off-screen rows.
 *   - `rendering-conditional-render` — empty / loading / error
 *     states use ternaries, never `&&`. Keeps the JSX explicit
 *     and avoids the "0 renders" pitfall.
 *   - `async-parallel` — restaurants + staff are fetched in
 *     parallel via RTK Query (no `await`-then-`await`).
 */

import { useMemo } from "react";
import { Link } from "react-router";
import { useListStaffQuery } from "./api";
import { useStaffFilters } from "./useStaffFilters";
import { useRestaurantContext } from "../../components/RestaurantContext/useRestaurantContext";
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui";
import { PATH } from "../../router/pathNames";
import type { StaffMember } from "./api";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const head = parts[0]?.[0] ?? "";
  const tail = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (head + tail).toUpperCase();
}

export function StaffList() {
  const { restaurantId, role, query, setRestaurantId, setRole, setQuery, matchesRole } =
    useStaffFilters();
  const contextRestaurantId = useRestaurantContext().restaurantId;
  // Prefer the URL-bound restaurantId; fall back to the active
  // restaurant context when none is in the URL.
  const effectiveRestaurantId = restaurantId ?? contextRestaurantId ?? "r-001";

  const { data, isLoading, isError } = useListStaffQuery(
    { restaurantId: effectiveRestaurantId },
    { skip: !effectiveRestaurantId },
  );

  const rows = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return (data ?? []).filter((s) => {
      if (role && !matchesRole(s.roles)) return false;
      if (trimmed) {
        return s.name.toLowerCase().includes(trimmed) || s.email.toLowerCase().includes(trimmed);
      }
      return true;
    });
  }, [data, matchesRole, query, role]);

  return (
    <div className="bg-surface text-ink min-h-[calc(100vh-64px)] font-sans antialiased">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-12">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">
              Admin zone
            </p>
            <h1 className="text-primary font-display text-3xl font-bold tracking-tight">Staff</h1>
          </div>
          <Button asChild>
            <Link to={PATH.ADMIN_STAFF_NEW}>Invite staff</Link>
          </Button>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <label className="grid gap-1 font-sans text-xs">
            <span className="text-ink-muted">Restaurant</span>
            <select
              className="border-border-subtle bg-surface-elevated rounded-control h-9 border px-2 text-sm"
              value={effectiveRestaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
            >
              <option value="r-001">Acme Bistro — Downtown</option>
              <option value="r-002">Acme Bistro — Marina</option>
            </select>
          </label>
          <label className="grid gap-1 font-sans text-xs">
            <span className="text-ink-muted">Role</span>
            <select
              className="border-border-subtle bg-surface-elevated rounded-control h-9 border px-2 text-sm"
              value={role ?? ""}
              onChange={(e) => setRole((e.target.value || undefined) as never)}
            >
              <option value="">Any</option>
              <option value="Manager">Manager</option>
              <option value="KitchenManager">KitchenManager</option>
              <option value="Waiter">Waiter</option>
              <option value="Cashier">Cashier</option>
              <option value="Host">Host</option>
            </select>
          </label>
          <label className="grid flex-1 gap-1 font-sans text-xs">
            <span className="text-ink-muted">Search</span>
            <input
              type="search"
              className="border-border-subtle bg-surface-elevated rounded-control h-9 border px-3 text-sm"
              placeholder="Name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <Table className="bg-surface-overlay border-border-subtle rounded-control border">
          <TableCaption className="sr-only">Staff members</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Email</TableHead>
              <TableHead scope="col">Roles</TableHead>
              <TableHead scope="col" className="text-right">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody style={{ contentVisibility: "auto" }}>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-ink-muted font-sans text-sm">
                  Loading staff…
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="text-danger font-sans text-sm">
                  Could not load staff. Try again.
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-ink-muted font-sans text-sm">
                  No staff match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((s: StaffMember) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      to={PATH.ADMIN_STAFF_DETAIL.replace(":id", s.id)}
                      className="text-primary font-medium hover:underline"
                    >
                      {initialsFor(s.name)} · {s.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-ink-muted font-sans text-sm">{s.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.roles.map((r) => (
                        <Badge key={r} variant="secondary">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={s.active ? "default" : "outline"}>
                      {s.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
