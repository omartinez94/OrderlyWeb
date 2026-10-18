export interface RestaurantConflict {
  code: string;
  message: string;
}

export function isRestaurantConflict(error: unknown): error is { data: RestaurantConflict } {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as any).data === "object" &&
    (error as any).data !== null &&
    typeof (error as any).data.code === "string"
  );
}
