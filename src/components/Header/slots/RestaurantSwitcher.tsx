import { useMemo, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import type { Restaurant } from "../types";

const TYPEAHEAD_THRESHOLD = 6;

/**
 * Restaurant switcher / static label.
 * - Single restaurant → static text label, no button affordance.
 * - 1-5 restaurants → dropdown, no search.
 * - 6+ restaurants → dropdown with typeahead.
 */
export interface RestaurantSwitcherProps {
  restaurants: Restaurant[];
  currentRestaurantId: string;
  onChange?: (id: string) => void;
}

export function RestaurantSwitcher({
  restaurants,
  currentRestaurantId,
  onChange,
}: RestaurantSwitcherProps) {
  const [query, setQuery] = useState("");
  const current = restaurants.find((r) => r.id === currentRestaurantId);

  const filtered = useMemo(() => {
    if (!query.trim()) return restaurants;
    const q = query.trim().toLowerCase();
    return restaurants.filter(
      (r) => r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q),
    );
  }, [restaurants, query]);

  // Single restaurant → static label, no button.
  if (restaurants.length === 1 && current) {
    return (
      <div className="ds-switcher-button" data-single="true">
        <span className="ds-switcher-button__name">{current.name}</span>
        <span className="ds-switcher-button__role">{current.role}</span>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="ds-switcher-button" data-single="true">
        <span className="ds-switcher-button__name" style={{ color: "var(--color-ink-subtle)" }}>
          No restaurant
        </span>
      </div>
    );
  }

  const showSearch = restaurants.length >= TYPEAHEAD_THRESHOLD;

  return (
    <Menu>
      <MenuButton
        className="ds-switcher-button"
        aria-label={`Switch restaurant. Current: ${current.name}`}
      >
        <span className="ds-switcher-button__name">{current.name}</span>
        <span className="ds-switcher-button__role">{current.role}</span>
        <svg
          className="ds-switcher-button__chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </MenuButton>
      <MenuItems className="ds-switcher-menu" anchor="bottom start" transition>
        {showSearch && (
          <input
            type="search"
            className="ds-switcher-menu__search"
            placeholder="Search restaurants…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        )}
        {filtered.length === 0 ? (
          <div className="ds-switcher-menu__empty">No restaurants match “{query}”</div>
        ) : (
          filtered.map((r) => (
            <MenuItem key={r.id}>
              {({ focus }) => (
                <button
                  type="button"
                  className="ds-switcher-menu__item"
                  data-active={r.id === currentRestaurantId || undefined}
                  onClick={() => {
                    onChange?.(r.id);
                    setQuery("");
                  }}
                  style={focus ? { backgroundColor: "var(--color-surface-elevated)" } : undefined}
                >
                  <span className="ds-switcher-menu__item-name">{r.name}</span>
                  <span className="ds-switcher-menu__item-role">{r.role}</span>
                </button>
              )}
            </MenuItem>
          ))
        )}
      </MenuItems>
    </Menu>
  );
}
