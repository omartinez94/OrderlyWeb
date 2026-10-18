/**
 * StaffAuditLog — read-only timeline of audit entries for a staff
 * member. Mounted under the action buttons on `StaffDetail`.
 *
 * Thin wrapper around `<EntityAuditLog entityType="staff" entityId={staffId} />`
 * per Phase 3 generic audit consolidation.
 */

import { EntityAuditLog } from "../audit/EntityAuditLog";

export interface StaffAuditLogProps {
  staffId: string;
}

export function StaffAuditLog({ staffId }: StaffAuditLogProps) {
  return <EntityAuditLog entityType="staff" entityId={staffId} />;
}
