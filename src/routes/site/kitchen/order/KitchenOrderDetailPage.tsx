/**
 * KitchenOrderDetailPage — `/site/kitchen/order/:id`. Placeholder
 * until the KDS detail module ships.
 */

import { ZoneSplash } from "../../../../components/Layout/ZoneSplash";

export function KitchenOrderDetailPage() {
  return (
    <ZoneSplash
      zone="kitchen"
      title="Order prep detail"
      subtitle="Items by station. Mark ready per item, bump ticket when complete."
    />
  );
}
