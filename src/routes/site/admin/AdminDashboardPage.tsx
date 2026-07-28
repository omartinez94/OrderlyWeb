/**
 * AdminDashboardPage — `/site/admin` index. Placeholder until
 * the Admin Dashboard module ships.
 */

import { ZoneSplash } from "../../../components/Layout/ZoneSplash";

export function AdminDashboardPage() {
  return (
    <ZoneSplash
      zone="admin"
      title="Admin dashboard"
      subtitle="Role summary, pending invitations, restaurants needing attention."
    />
  );
}
