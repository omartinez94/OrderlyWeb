import type { Zone } from '../types';

const ZONE_LABEL: Record<Zone, string> = {
  admin: 'Admin',
  kitchen: 'Kitchen',
  restaurant: 'Restaurant',
};

/**
 * Three-segment breadcrumb: `Orderly / {Restaurant} / {Zone}`.
 * - "Orderly" is a button → routes to the user's default zone (no-op in demo).
 * - Restaurant segment mirrors the switcher (clickable for consistency).
 * - Zone segment is a static label (the user is already there).
 *
 * Per the brief: "Orderly" carries MuseoModerno (the brand word);
 * restaurant and zone carry Urbanist. The Two-Family Rule binds the
 * role split.
 */
export interface BreadcrumbProps {
  zone: Zone;
  restaurantName?: string;
  onBrandClick?: () => void;
  onRestaurantClick?: () => void;
}

export function Breadcrumb({
  zone,
  restaurantName,
  onBrandClick,
  onRestaurantClick,
}: BreadcrumbProps) {
  return (
    <nav className="ds-breadcrumb" aria-label="Breadcrumb">
      <button type="button" className="ds-breadcrumb__brand" onClick={onBrandClick}>
        Orderly
      </button>
      <span className="ds-breadcrumb__separator" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        className="ds-breadcrumb__segment"
        onClick={onRestaurantClick}
        disabled={!onRestaurantClick}
        title={restaurantName}
      >
        {restaurantName ?? 'Loading…'}
      </button>
      <span className="ds-breadcrumb__separator" aria-hidden="true">
        /
      </span>
      <span className="ds-breadcrumb__segment" data-static="true">
        {ZONE_LABEL[zone]}
      </span>
    </nav>
  );
}
