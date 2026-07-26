'use client';

import * as React from 'react';
import { CheckIcon } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Checkbox — accessible boolean control built on Radix.
 *
 * Contract:
 *   - Always pair with a `<Label htmlFor>` (or a `FormLabel`).
 *   - Unchecked: `border-strong` (`var(--color-border-strong)`),
 *     `surface-overlay` background.
 *   - Checked: `primary` border + background, `primary-foreground` tick.
 *   - Focus-visible: 2px primary ring with 2px offset.
 *   - `aria-invalid` rings danger; the same flag drives the
 *     `aria-describedby` wiring in `FormControl`.
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-4 shrink-0 rounded-[4px] border border-input bg-surface-overlay shadow-xs',
        'transition-colors outline-none',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
