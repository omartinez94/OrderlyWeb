/**
 * StaffDetailPage — `/site/admin/staff/:id`. Delegates to the
 * `StaffDetail` feature component.
 */

import { StaffDetail } from "../../../../features/staff/StaffDetail";

export function StaffDetailPage() {
  return <StaffDetail />;
}
