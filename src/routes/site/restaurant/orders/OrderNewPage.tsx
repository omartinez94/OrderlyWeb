/**
 * OrderNewPage — `/site/restaurant/orders/new`. Placeholder until
 * the order-creation wizard ships.
 */

import { ZoneSplash } from "../../../../components/Layout/ZoneSplash";

export function OrderNewPage() {
  return (
    <ZoneSplash
      zone="restaurant"
      title="New order"
      subtitle="Four-step wizard: type → table → menu → review."
    />
  );
}
