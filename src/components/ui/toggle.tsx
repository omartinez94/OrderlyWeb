"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Toggle — two-state press button built on Radix.
 *
 * Contract:
 *   - `aria-pressed` flips on click (Radix handles it via the
 *     `data-state` attribute, which is consumed by the `on`
 *     variant selector).
 *   - Variant `default` is fully transparent; variant `outline` adds
 *     a `border-strong` border.
 *   - `on` state lifts to `surface-elevated` ground with `ink` label
 *     — quiet, readable, not a brand color (per the One-Voice Rule
 *     the tangerine accent is reserved for urgent CTAs only).
 *   - Focus-visible: 2px primary ring with 2px offset.
 *   - Sizes: `sm`, `default`, `lg`.
 */
const toggleVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap",
    "transition-colors outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30",
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
    "data-[state=on]:bg-secondary data-[state=on]:text-ink",
    "hover:bg-muted hover:text-muted-foreground",
  ],
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent shadow-xs hover:bg-secondary",
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
        lg: "h-10 min-w-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
