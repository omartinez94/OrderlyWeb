import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Badge — small status or count label.
 *
 * Variants:
 *   default       Primary ground, white label.
 *   secondary     Sage Linen High ground, ink label.
 *   destructive   Danger ground, white label.
 *   outline       Transparent ground, border-strong ring, ink label.
 *   ghost         Transparent ground, muted ink label.
 *   link          Primary-colored link, no surface.
 *
 *   service-*     Service-hue variants that follow the StatusPill tint
 *                 rules (12% background tint, full-hue foreground,
 *                 30% border tint). These exist for non-order
 *                 surfaces (e.g. payment status, table status) so
 *                 the same five-stop gradient is reachable outside
 *                 the order domain without the pill chrome.
 *
 *     new          service-deep
 *     acknowledged service-teal
 *     preparing    service-aqua
 *     plating      service-amber
 *     ready        service-tangerine
 *
 *   neutral       Muted-ink ground — for terminal states
 *                 ("served", "completed"). The status-only "served"
 *                 color from StatusPill is not exported as a Badge
 *                 service variant; consumers use `neutral` for that.
 */
const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden',
    'rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
    'transition-colors',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/30',
    '[&>svg]:pointer-events-none [&>svg]:size-3',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-transparent',
        secondary:
          'bg-secondary text-secondary-foreground border-transparent',
        destructive: 'bg-danger text-primary-foreground border-transparent',
        outline:
          'bg-transparent text-ink border border-border-strong',
        ghost: 'bg-transparent text-ink-muted border-transparent',
        link: 'bg-transparent text-primary border-transparent underline-offset-4 [&>a]:underline',

        // Service-hue tints — same rule as StatusPill: 12% bg, 100%
        // foreground, 30% border. The 12% tint is applied via
        // color-mix inline so the rule reads in one place.
        'service-new':
          'border text-service-deep bg-service-deep/[0.12] border-service-deep/30',
        'service-acknowledged':
          'border text-service-teal bg-service-teal/[0.12] border-service-teal/30',
        'service-preparing':
          'border text-service-aqua bg-service-aqua/[0.12] border-service-aqua/30',
        'service-plating':
          'border text-service-amber bg-service-amber/[0.12] border-service-amber/30',
        'service-ready':
          'border text-service-tangerine bg-service-tangerine/[0.12] border-service-tangerine/30',

        neutral: 'bg-surface-elevated text-ink-muted border border-border-subtle',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  /** Render as a child element (e.g. `Link`) while keeping badge styles. */
  asChild?: boolean;
}

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
