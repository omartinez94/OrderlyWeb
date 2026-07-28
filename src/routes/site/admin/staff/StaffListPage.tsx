/**
 * StaffListPage — `/site/admin/staff`. The Staff Management module
 * lives in `src/features/staff/`; this file is just the route glue.
 */

import { StaffList } from "../../../../features/staff/StaffList";

export function StaffListPage() {
  return <StaffList />;
}
