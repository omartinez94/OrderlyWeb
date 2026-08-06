import { env } from "./env";
import type { Role, Permission } from "../types/auth";

export interface RefreshResponse {
  accessToken: string;
  expiresAt: number;
  user: { id: string; name: string; email: string; initials: string };
  roles: readonly Role[];
  permissions: readonly Permission[];
}

let inFlightRefresh: Promise<RefreshResponse> | null = null;

export async function refreshAccessToken(): Promise<RefreshResponse> {
  if (inFlightRefresh) return inFlightRefresh;

  const promise = (async () => {
    const res = await fetch(`${env.apiBaseUrl}/identity-api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Refresh failed: ${res.status}`);
    }
    return (await res.json()) as RefreshResponse;
  })();

  inFlightRefresh = promise;
  try {
    return await promise;
  } finally {
    inFlightRefresh = null;
  }
}
