/**
 * ZoneSidebar — a generic, role-aware sidebar shell. Each zone
 * supplies its own items list; the sidebar filters items by the
 * `roles` field on each item against the live auth predicate.
 *
 * The active route is highlighted via `aria-current="page"` for
 * assistive tech. The visual highlight uses the `text-primary`
 * token, no decorative shape.
 *
 * Performance note: the role lookup builds a `Set<Role>` once per
 * render so `item.roles.some((r) => roleSet.has(r))` is O(1) per
 * role rather than O(roles.length). Sidebar items are short lists
 * so this is a small win, but the pattern compounds if zones grow.
 * (Vercel rule `js-set-map-lookups`.)
 */

import { NavLink } from "react-router";
import type { Role } from "../../types/auth";
import { useAuthPredicate } from "../RouteGuards/useAuthPredicate";

export interface SidebarItem {
  to: string;
  label: string;
  /** Optional sub-label rendered below the label. */
  detail?: string;
  /** Roles allowed to see this item. Empty / omitted = visible to all. */
  roles?: readonly Role[];
}

export function ZoneSidebar({ items }: { items: readonly SidebarItem[] }) {
  const predicate = useAuthPredicate();
  const roleSet = new Set<Role>(predicate.roles);
  const visible = items.filter((item) => !item.roles || item.roles.some((r) => roleSet.has(r)));

  return (
    <nav aria-label="Zone navigation" className="bg-surface border-border-subtle border-r">
      <ul className="m-0 flex flex-col gap-1 p-3 font-sans text-sm">
        {visible.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to.split("/").length <= 3}
              className={({ isActive }) =>
                [
                  "block rounded-control px-3 py-2 transition-colors",
                  "hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isActive ? "text-primary font-medium" : "text-ink-muted",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <span className="grid gap-0.5">
                  <span className={isActive ? "text-primary font-medium" : "text-ink"}>
                    {item.label}
                  </span>
                  {item.detail && <span className="text-ink-subtle text-xs">{item.detail}</span>}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
