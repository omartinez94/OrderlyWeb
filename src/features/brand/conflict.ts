/**
 * isBrandConflict — error shape detector for Brand CRM operations.
 *
 * Returned with status 409:
 *   - BRAND_DUPLICATE_SLUG: slug already registered by another brand.
 *   - BRAND_HAS_ACTIVE_RESTAURANTS: cannot archive brand because it has active restaurants.
 */

export interface BrandConflict {
  status: 409;
  code: "BRAND_DUPLICATE_SLUG" | "BRAND_HAS_ACTIVE_RESTAURANTS";
  message: string;
}

function hasStatus(err: unknown): err is { status: number; data?: unknown } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  );
}

export function isBrandConflict(err: unknown): err is BrandConflict {
  if (!hasStatus(err) || err.status !== 409) return false;
  const data = err.data as Record<string, unknown> | undefined;
  if (!data) return false;
  return data.code === "BRAND_DUPLICATE_SLUG" || data.code === "BRAND_HAS_ACTIVE_RESTAURANTS";
}
