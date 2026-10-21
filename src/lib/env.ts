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

const isTest = import.meta.env.MODE === "test";
const DEFAULT_API_BASE_URL = isTest ? "http://localhost:6004" : "";
const DEFAULT_SIGNALR_URL = isTest ? "http://localhost:6004/kitchen-api" : "/kitchen-api";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const rawSignalRUrl = import.meta.env.VITE_SIGNALR_URL;

export const env = {
  apiBaseUrl: isTest
    ? "http://localhost:6004"
    : (rawApiBaseUrl as string | undefined) || DEFAULT_API_BASE_URL,
  signalrUrl: isTest
    ? "http://localhost:6004/kitchen-api"
    : (rawSignalRUrl as string | undefined) || DEFAULT_SIGNALR_URL,
} as const;

export type Env = typeof env;
