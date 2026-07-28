import "@testing-library/jest-dom/vitest";
import { toHaveNoViolations } from "jest-axe";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

// jest-axe matcher — surfaces accessibility violations as test failures.
expect.extend(toHaveNoViolations);

// jsdom doesn't implement ResizeObserver. Radix Slider and a handful of
// other primitives depend on it for layout measurement. A no-op stub is
// enough for unit tests — we are not asserting on rendered geometry.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver =
  ResizeObserverStub;

// jsdom doesn't implement scrollIntoView. Radix Select uses it to keep
// the highlighted option in view when the user types or navigates; the
// method is never visible in a real DOM-less test, so a no-op is fine.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}

// jsdom doesn't implement matchMedia. The theme hook calls it during
// initial render; without a stub, every mounted component throws.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// MSW — intercepts every fetch the app makes during Vitest runs.
// On unhandled requests the test fails fast so we know when a
// slice forgot to register a handler.
beforeAll(() =>
  server.listen({
    onUnhandledRequest: "error",
  }),
);
afterEach(() => server.resetHandlers(...server.listHandlers()));
afterAll(() => server.close());
