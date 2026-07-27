'use client';

import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Switch — boolean on/off control built on Radix.
 *
 * Contract:
 *   - Pair with a `<Label htmlFor>` (or `FormLabel`).
 *   - Unchecked: `border-strong` track, `surface-overlay` thumb.
 *   - Checked: `primary` track, `primary-foreground` thumb.
 *   - Focus-visible: 2px primary ring with 2px offset.
 *   - Sizes: `default` (32×18) and `sm` (24×14) — touch target on
 *     `default` is comfortable; the slider rail itself stays small
 *     so the visual weight matches a checkbox.
 */
function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default';
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs',
        'transition-colors outline-none',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[size=default]:h-5 data-[size=default]:w-9',
        'data-[size=sm]:h-4 data-[size=sm]:w-7',
        'data-[state=checked]:bg-primary',
        'data-[state=unchecked]:bg-input',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block rounded-full bg-surface-overlay ring-0 transition-transform',
          'group-data-[size=default]/switch:size-4',
          'group-data-[size=sm]/switch:size-3',
          'data-[state=checked]:translate-x-[calc(100%)]',
          'data-[state=unchecked]:translate-x-0.5',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
