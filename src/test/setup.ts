import '@testing-library/jest-dom/vitest';
import { toHaveNoViolations } from 'jest-axe';

// jest-axe matcher — surfaces accessibility violations as test failures.
expect.extend(toHaveNoViolations);
