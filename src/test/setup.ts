import "@testing-library/jest-dom/vitest";
import { toHaveNoViolations } from "jest-axe";

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
