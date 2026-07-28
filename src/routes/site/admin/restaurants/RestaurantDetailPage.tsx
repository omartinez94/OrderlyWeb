/**
 * RestaurantDetailPage — `/site/admin/restaurants/:id`. Placeholder
 * until the Restaurant Management module ships.
 */

import { ZoneSplash } from "../../../../components/Layout/ZoneSplash";

export function RestaurantDetailPage() {
  return (
    <ZoneSplash
      zone="admin"
      title="Restaurant settings"
      subtitle="General, hours, tables, branding, integrations."
    />
  );
}
