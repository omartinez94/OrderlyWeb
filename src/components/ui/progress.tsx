import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Progress — linear progress bar.
 *
 * Contract:
 *   - `value` is 0–100 for determinate. Pass `null` or omit for
 *     indeterminate; the indicator animates instead of locking to
 *     a width.
 *   - `role="progressbar"` is owned by Radix with `aria-valuenow`,
 *     `aria-valuemin`, `aria-valuemax`, and `aria-valuetext`. For
 *     indeterminate, override `aria-valuetext` to "Loading".
 *   - Track is `bg-muted`; indicator is `bg-primary`.
 */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const isIndeterminate = value == null;
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-state={isIndeterminate ? 'indeterminate' : 'determinate'}
      value={value ?? undefined}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-muted',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'h-full bg-primary transition-transform duration-300',
          isIndeterminate && 'origin-left animate-pulse w-1/3'
        )}
        style={
          isIndeterminate
            ? undefined
            : { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
