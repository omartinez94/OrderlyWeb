/**
 * isStaffConflict — type guard for staff-management error shapes.
 *
 * Phase 5 of staff-management. The Identity Service returns 409
 * for two distinct cases:
 *
 *   - `STAFF_VERSION_MISMATCH` — concurrent edit; another admin
 *     saved first. The response carries the latest `current` row
 *     so the client can refetch + diff.
 *   - `STAFF_DUPLICATE_EMAIL` — invite sent to an email that
 *     already has an account; the surface offers "invite as a
 *     new restaurant member instead?".
 *
 * 410 Gone is the third path (expired invitation link, surfaced
 * via `useResendInvitationMutation`).
 */

import type { StaffMember } from "../../app/api/identity";

export interface StaffConflict {
  status: 409;
  code: "STAFF_VERSION_MISMATCH" | "STAFF_DUPLICATE_EMAIL";
  message: string;
  current?: StaffMember;
}

export interface StaffExpired {
  status: 410;
  code: "INVITATION_EXPIRED";
  message: string;
}

export interface StaffForbidden {
  status: 403;
  code: "STAFF_GRANT_FORBIDDEN";
  message: string;
}

export type StaffError = StaffConflict | StaffExpired | StaffForbidden;

function hasStatus(err: unknown): err is { status: number } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  );
}

export function isStaffConflict(err: unknown): err is StaffConflict {
  return hasStatus(err) && err.status === 409;
}

export function isStaffExpired(err: unknown): err is StaffExpired {
  return hasStatus(err) && err.status === 410;
}

export function isStaffForbidden(err: unknown): err is StaffForbidden {
  return hasStatus(err) && err.status === 403;
}

export function isStaffError(err: unknown): err is StaffError {
  return isStaffConflict(err) || isStaffExpired(err) || isStaffForbidden(err);
}
