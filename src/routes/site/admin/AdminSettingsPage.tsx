/**
 * AdminSettingsPage — `/site/admin/settings`. Placeholder until
 * the platform settings module ships. SuperAdmin only.
 */

import { ZoneSplash } from "../../../components/Layout/ZoneSplash";

export function AdminSettingsPage() {
  return (
    <ZoneSplash
      zone="admin"
      title="Platform settings"
      subtitle="Global identity, roles, permissions, notifications, API, audit."
    />
  );
}
