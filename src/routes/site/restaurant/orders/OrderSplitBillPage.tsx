/**
 * OrderSplitBillPage — `/site/restaurant/orders/:id/split-bill`.
 * Placeholder until the bill-splitting view ships.
 */

import { ZoneSplash } from "../../../../components/Layout/ZoneSplash";

export function OrderSplitBillPage() {
  return (
    <ZoneSplash
      zone="restaurant"
      title="Split bill"
      subtitle="Equal-split quick action, drag-and-drop seat assignment, per-bill totals."
    />
  );
}
