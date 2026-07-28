/**
 * env — typed accessor for the runtime configuration that comes from
 * Vite's `import.meta.env`.
 *
 * Two variables matter for the data layer:
 *
 *   VITE_API_BASE_URL
 *     Default: "http://localhost:6004"
 *     The YARP API Gateway. Every RTK Query slice appends its service
 *     path prefix (e.g. `fetchBaseQuery({ baseUrl: env.apiBaseUrl + '/identity-api' })`).
 *
 *   VITE_SIGNALR_URL
 *     Default: "http://localhost:6004/kitchen-api"
 *     The kitchen SignalR hub is gateway-fronted. The default carries
 *     the upstream `/kitchen-api` prefix; the SignalR factory appends
 *     only `/hubs/kitchen` (no double-prefix).
 *
 * No secrets live here — the refresh token is an httpOnly cookie set
 * by the Identity Service and is never visible to JS. Per
 * `AGENTS.md` §Security.
 */

const DEFAULT_API_BASE_URL = "http://localhost:6004";
const DEFAULT_SIGNALR_URL = "http://localhost:6004/kitchen-api";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const rawSignalRUrl = import.meta.env.VITE_SIGNALR_URL;

if (import.meta.env.DEV && !rawApiBaseUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    `[env] VITE_API_BASE_URL is not set — falling back to ${DEFAULT_API_BASE_URL}. ` +
      `Copy .env.example to .env.local to silence this.`,
  );
}

export const env = {
  apiBaseUrl: (rawApiBaseUrl as string | undefined) ?? DEFAULT_API_BASE_URL,
  signalrUrl: (rawSignalRUrl as string | undefined) ?? DEFAULT_SIGNALR_URL,
} as const;

export type Env = typeof env;
