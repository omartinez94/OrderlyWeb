export interface AuditConflict {
  code: string;
  message: string;
}

export function isAuditConflict(error: unknown): error is { data: AuditConflict } {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as any).data === "object" &&
    (error as any).data !== null &&
    typeof (error as any).data.code === "string"
  );
}
