/**
 * KitchenDashboardPage — `/site/kitchen` index. Placeholder until
 * the KDS (Kitchen Display System) module ships.
 */

import { ZoneSplash } from "../../../components/Layout/ZoneSplash";

export function KitchenDashboardPage() {
  return (
    <ZoneSplash
      zone="kitchen"
      title="Order queue"
      subtitle="Real-time order queue. Mark items ready, bump tickets."
    />
  );
}
