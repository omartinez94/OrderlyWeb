/**
 * QueuePage — `/site/restaurant/queue`. Placeholder until the
 * Walk-in Queue module ships.
 */

import { ZoneSplash } from "../../../../components/Layout/ZoneSplash";

export function QueuePage() {
  return (
    <ZoneSplash
      zone="restaurant"
      title="Walk-in queue"
      subtitle="Live waitlist. Seat, notify, or remove guests."
    />
  );
}
