/**
 * conflict.ts tests — Phase 5 deliverable.
 *
 * The helpers are pure type guards over the RTK Query error shape.
 */

import { describe, expect, it } from "vitest";
import { isStaffConflict, isStaffExpired, isStaffForbidden, isStaffError } from "./conflict";

describe("conflict helpers", () => {
  it("isStaffConflict matches 409 errors", () => {
    const err = { status: 409, data: { code: "STAFF_VERSION_MISMATCH" } };
    expect(isStaffConflict(err)).toBe(true);
    expect(isStaffError(err)).toBe(true);
  });

  it("isStaffConflict rejects 4xx other than 409", () => {
    expect(isStaffConflict({ status: 403, data: {} })).toBe(false);
    expect(isStaffConflict({ status: 410, data: {} })).toBe(false);
  });

  it("isStaffConflict rejects non-error shapes", () => {
    expect(isStaffConflict(null)).toBe(false);
    expect(isStaffConflict(undefined)).toBe(false);
    expect(isStaffConflict({})).toBe(false);
  });

  it("isStaffExpired matches 410 errors", () => {
    expect(isStaffExpired({ status: 410, data: { code: "INVITATION_EXPIRED" } })).toBe(true);
  });

  it("isStaffForbidden matches 403 errors", () => {
    expect(isStaffForbidden({ status: 403, data: { code: "STAFF_GRANT_FORBIDDEN" } })).toBe(true);
  });

  it("isStaffError returns true for any of the three", () => {
    expect(isStaffError({ status: 409 })).toBe(true);
    expect(isStaffError({ status: 410 })).toBe(true);
    expect(isStaffError({ status: 403 })).toBe(true);
    expect(isStaffError({ status: 500 })).toBe(false);
  });
});
