/**
 * OrderListPage — `/site/restaurant/orders`. Placeholder until
 * the Orders module ships.
 */

import { ZoneSplash } from "../../../../components/Layout/ZoneSplash";

export function OrderListPage() {
  return (
    <ZoneSplash
      zone="restaurant"
      title="Orders"
      subtitle="Live list with status, table, type, and SignalR updates."
    />
  );
}
