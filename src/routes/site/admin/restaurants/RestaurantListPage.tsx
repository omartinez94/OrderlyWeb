/**
 * RestaurantListPage — `/site/admin/restaurants`. Placeholder until
 * the Restaurant Management module ships. SuperAdmin only.
 */

import { ZoneSplash } from "../../../../components/Layout/ZoneSplash";

export function RestaurantListPage() {
  return (
    <ZoneSplash
      zone="admin"
      title="Restaurants"
      subtitle="Every restaurant on the platform. Open one to manage staff, hours, and integrations."
    />
  );
}
