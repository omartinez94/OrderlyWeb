import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Input — single-line text input.
 *
 * Contract:
 *   - Always pair with a `<Label htmlFor={id}>` (or a `FormLabel` inside
 *     `<FormField>`).
 *   - Error state is signalled by `aria-invalid`; the message is wired
 *     through `aria-describedby` automatically by `FormControl`.
 *   - Background is `surface-overlay` (white in light, dark in dark) so
 *     the input edge reads against the parent `surface-elevated` card.
 *   - Focus-visible uses 2px ring + 2px offset (`var(--color-primary)`).
 *   - Text size is 16px by default to prevent iOS zoom-on-focus; the
 *     font itself is the body sans (`font-sans`).
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full min-w-0 rounded-md',
        'border border-input bg-surface-overlay text-ink',
        'px-3 py-2 text-base shadow-xs',
        'placeholder:text-ink-subtle',
        'transition-colors outline-none',
        'selection:bg-primary selection:text-primary-foreground',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30',
        'md:text-sm',
        className
      )}
      {...props}
    />
  );
}

export { Input };
