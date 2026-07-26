import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Card — the base library's primary content surface.
 *
 * Variants:
 *   default   Tilled Teal card-ground (`surface-elevated`), no border,
 *             no shadow — the Orderly default content surface.
 *   bordered  Adds a 1px `border-strong` ring for emphasized cards.
 *   glass     Uses the existing `.glass` utility (frosted surface
 *             for use over gradients or busy images).
 *   muted     Uses `surface` (the page background) so the card
 *             recedes — useful for grouping related items without
 *             a visible lift.
 *
 * Contract (per the Flat-By-Default Rule in DESIGN.md):
 *   - No `box-shadow` on any default variant. The brand glow is
 *     reserved for status surfaces (StatusPill, the KDS in-progress
 *     emphasis).
 *   - Title + description convention: `CardTitle` is `text-primary`
 *     + `font-bold`, `CardDescription` is `text-ink-muted`. These
 *     defaults match the existing `bg-surface-elevated` order cards
 *     in the design-system showcase.
 *   - The compound pieces (Header, Title, Description, Action,
 *     Content, Footer) are layout primitives; the visual hierarchy
 *     is owned by the consumer.
 */
const cardVariants = cva(
  'flex flex-col gap-6 rounded-xl py-6 text-card-foreground',
  {
    variants: {
      variant: {
        default: 'bg-card',
        bordered: 'bg-card border border-border-strong',
        glass: 'glass',
        muted: 'bg-surface',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CardProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6',
        'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        '[.border-b]:pb-6',
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-display text-xl font-bold leading-tight text-primary] text-primary',
        className
      )}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-ink-muted', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center px-6',
        '[.border-t]:pt-6',
        className
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
};
