import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * `cn` — single source of truth for class composition.
 *
 * Combines `clsx` (conditional + array + object syntax) with `tailwind-merge`
 * (resolves Tailwind class conflicts so callers can override variants without
 * specificity wars). All shadcn/ui primitives and feature components must
 * use this; importing `clsx` or `tailwind-merge` directly is forbidden.
 *
 * @example
 *   cn('px-4 py-2', isActive && 'bg-primary', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
