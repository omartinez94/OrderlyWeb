/**
 * MSW server — the shared `setupServer` instance that the test
 * setup (Vitest) boots once per file.
 *
 *   - `beforeAll(() => server.listen({ onUnhandledRequest: "error" }))`
 *   - `afterEach(() => server.resetHandlers(...handlers))`
 *   - `afterAll(() => server.close())`
 *
 * Each test file imports `server` from this module and the
 * `start/listen/reset/close` calls live in `src/test/setup.ts` for
 * Vitest. Playwright uses the same handlers but its own worker
 * lifecycle.
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
