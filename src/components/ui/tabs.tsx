'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Tabs — a roving tabindex tabbed region.
 *
 * Keyboard contract (Radix-handled):
 *   - Arrow keys move focus between triggers (roving tabindex).
 *   - Home/End jump to the first/last trigger.
 *   - The active panel is in the tab order; the inactive panels
 *     are inert (`hidden` when not selected).
 *   - `aria-orientation` is set from the `orientation` prop; the
 *     default is `horizontal` (arrow keys move left/right).
 *
 * Variants:
 *   default  Pill tabs in a `bg-muted` container — the standard
 *            pattern for primary navigation within a page.
 *   line     Underline-only tabs — used in compact surfaces where
 *            the tab list shares a horizontal rule with the panel
 *            below it.
 */
function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn('group/tabs flex gap-2', className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  [
    'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px]',
    'text-ink-muted',
    'group-data-[orientation=horizontal]/tabs:h-9',
    'group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col',
  ],
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function TabsList({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5',
        'rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap',
        'text-ink-muted transition-colors outline-none',
        'hover:text-ink',
        'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start',
        'data-[state=active]:bg-surface-overlay data-[state=active]:text-ink data-[state=active]:shadow-sm',
        'group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none',
        'after:absolute after:bg-primary after:opacity-0 after:transition-opacity',
        'group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5',
        'group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5',
        'group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
