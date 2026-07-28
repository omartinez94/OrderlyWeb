/**
 * RestaurantDashboardPage — `/site/restaurant` index. Placeholder
 * until the Restaurant Dashboard module ships.
 */

import { ZoneSplash } from "../../../components/Layout/ZoneSplash";

export function RestaurantDashboardPage() {
  return (
    <ZoneSplash
      zone="restaurant"
      title="Restaurant dashboard"
      subtitle="Today's revenue, active orders, on-shift staff, alerts."
    />
  );
}
