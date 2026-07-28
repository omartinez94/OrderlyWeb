/**
 * KitchenSettingsPage — `/site/kitchen/settings`. Placeholder
 * until the KDS config module ships.
 */

import { ZoneSplash } from "../../../components/Layout/ZoneSplash";

export function KitchenSettingsPage() {
  return (
    <ZoneSplash
      zone="kitchen"
      title="KDS settings"
      subtitle="Alert sounds, refresh rate, screen brightness, dark mode."
    />
  );
}
