import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Card — the base library's primary content surface.
 *
 * Variants form a surface-tier rhythm so the KDS read at 1.5m can
 * scan hierarchy by *tonal step*, not just by type:
 *   default  Elevated card-ground (`bg-card`, Linen Overlay). The
 *            hero card on the page — primary content lives here.
 *   bordered Elevated + 1px `border-strong`. The emphasized card;
 *            the perimeter reads as interactive even at rest.
 *   quiet    No surface, hairline `border-subtle`. The metadata
 *            block — secondary info that should not compete with
 *            primary content. Cheaper than `bordered`.
 *   surface  Recedes to `bg-surface` (the page background). Use for
 *            groups of related items where the grouping itself
 *            matters more than any single item.
 *   glass    Uses the existing `.glass` utility (frosted surface
 *            for use over gradients or busy images).
 *
 * Contract (per the Flat-By-Default Rule in DESIGN.md):
 *   - No `box-shadow` on any variant. The brand glow is reserved
 *     for status surfaces (StatusPill, the KDS in-progress
 *     emphasis).
 *   - Title + description convention: `CardTitle` is `text-primary`
 *     + `font-extrabold` (weight 800) so the hierarchy reads at
 *     KDS distance; `CardDescription` is `text-ink-muted` at the
 *     standard `text-sm` body step.
 *   - The compound pieces (Header, Title, Description, Action,
 *     Content, Footer) are layout primitives; the visual hierarchy
 *     is owned by the consumer.
 */
const cardVariants = cva(
  // `isolate` makes each Card its own stacking context so a sibling
  // Card cannot bleed into the next (the detector caught an overlay
  // bug in the Layout section where the AspectRatio card's centered
  // marker was reading on top of the ScrollArea card's lines).
  "flex flex-col gap-6 rounded-xl py-6 text-card-foreground isolate",
  {
    variants: {
      variant: {
        default: "bg-card",
        bordered: "bg-card border border-border-strong",
        quiet: "bg-transparent border border-border-subtle",
        surface: "bg-surface",
        glass: "glass",
        // Deprecated alias for `surface` — kept so the existing
        // showcase and tests do not break. Prefer `surface`.
        muted: "bg-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {}

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

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        "[.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        // Weight lifted from 700 → 800 so the title-card hierarchy
        // reads at KDS distance (≈1.5m). Stays inside the Orderly
        // 5-step ramp; no new step added.
        "font-display text-xl font-extrabold leading-tight text-primary",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-ink-muted", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6", "[.border-t]:pt-6", className)}
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
