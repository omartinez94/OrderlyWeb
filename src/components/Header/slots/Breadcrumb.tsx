import { useCallback } from "react";
import type { Zone } from "../types";
import { useAuthPredicate } from "../../RouteGuards/useAuthPredicate";
import { defaultZoneForRoles, canAccessZone } from "../../../lib/defaultZone";
import { PATH } from "../../../router/pathNames";
import { useNavigateWithTransition } from "../../../hooks/useNavigateWithTransition";

const ZONE_LABEL: Record<Zone, string> = {
  admin: "Admin",
  kitchen: "Kitchen",
  restaurant: "Restaurant",
};

/**
 * Three-segment breadcrumb: `Orderly / {Restaurant} / {Zone}`.
 * - "Orderly" routes to the user's default zone (highest-privilege
 *   zone they can access).
 * - Restaurant segment navigates to the active restaurant's home
 *   zone (restaurant if they can access it; otherwise their default
 *   zone).
 * - Zone segment is a static label (the user is already there).
 *
 * Per the brief: "Orderly" carries MuseoModerno (the brand word);
 * restaurant and zone carry Urbanist. The Two-Family Rule binds the
 * role split.
 *
 * Phase 1 wiring:
 *   - Uses `useNavigateWithTransition()` so navigation does not block
 *     the next user interaction (Vercel `rerender-transitions`).
 *   - Default-zone resolution comes from `defaultZoneForRoles()`,
 *     which `RootRedirect` and `RequireRole` agree on as the
 *     canonical mapping.
 */
export interface BreadcrumbProps {
  zone: Zone;
  restaurantName?: string;
  /** Override the default "go to default zone" behavior on brand click. */
  onBrandClick?: () => void;
  /** Override the default restaurant navigation. */
  onRestaurantClick?: () => void;
}

export function Breadcrumb({
  zone,
  restaurantName,
  onBrandClick,
  onRestaurantClick,
}: BreadcrumbProps) {
  const predicate = useAuthPredicate();
  const navigate = useNavigateWithTransition();

  const handleBrandClick = useCallback(() => {
    if (onBrandClick) {
      onBrandClick();
      return;
    }
    const target = defaultZoneForRoles(predicate.roles) ?? PATH.HOME;
    navigate(target);
  }, [onBrandClick, navigate, predicate.roles]);

  const handleRestaurantClick = useCallback(() => {
    if (onRestaurantClick) {
      onRestaurantClick();
      return;
    }
    // Prefer the restaurant zone if the user can access it; otherwise
    // their default zone; otherwise fall back to the marketing home.
    if (canAccessZone("restaurant", predicate.roles)) {
      navigate(PATH.RESTAURANT);
    } else {
      navigate(defaultZoneForRoles(predicate.roles) ?? PATH.HOME);
    }
  }, [onRestaurantClick, navigate, predicate.roles]);

  return (
    <nav className="ds-breadcrumb" aria-label="Breadcrumb">
      <button type="button" className="ds-breadcrumb__brand" onClick={handleBrandClick}>
        Orderly
      </button>
      <span className="ds-breadcrumb__separator" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        className="ds-breadcrumb__segment"
        onClick={handleRestaurantClick}
        disabled={!onRestaurantClick && !canAccessZone("restaurant", predicate.roles)}
        title={restaurantName}
      >
        {restaurantName ?? "Loading…"}
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
