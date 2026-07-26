import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Button — the base library's primary interactive primitive.
 *
 * Variants:
 *   default     Tilled Teal ground, white label. The single affirmative
 *               action on a screen — submit, save, send.
 *   accent      Burnt Tangerine ground. Reserved for urgent CTAs (per
 *               the One-Voice Rule, ≤10% of any given screen).
 *   outline     Transparent ground, Linen Edge Strong border, Carbon
 *               Ink label. The secondary action.
 *   ghost       Transparent ground, Muted Ink label. Tertiary action.
 *   secondary   Sage Linen High ground, Carbon Ink label. For surfaces
 *               that need a tonal lift without a brand color.
 *   destructive Smoked Brick ground. Confirm-destructive actions only.
 *   link        Primary-colored link, no surface.
 *
 * Sizes:
 *   sm | default | lg | icon
 *
 * Accessibility:
 *   - Focus-visible ring uses `var(--color-primary)` with 2px offset.
 *   - Disabled uses `aria-disabled` plus `pointer-events-none` so screen
 *     readers announce the disabled state.
 *   - `asChild` is supported via Radix Slot for rendering as a link.
 */
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-md',
    'text-sm font-semibold whitespace-nowrap',
    'transition-colors duration-150',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
    'active:scale-[0.96] cursor-pointer',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        accent: 'bg-accent text-accent-foreground hover:bg-accent-hover',
        outline:
          'border border-border-strong bg-transparent text-ink hover:bg-surface-elevated hover:border-primary hover:text-primary',
        ghost:
          'bg-transparent text-ink-muted hover:bg-surface-elevated hover:text-ink',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 px-3 has-[>svg]:px-2.5',
        lg: 'h-11 px-6 has-[>svg]:px-4',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  /** Render as a child element (e.g. `Link`) while keeping button styles. */
  asChild?: boolean;
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      // Default `type="button"` prevents accidental form submissions when
      // the consumer forgets to set it. The native `<button>` already does
      // this; for `asChild` consumers must set it explicitly.
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
