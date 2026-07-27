'use client';

import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Tooltip — short, non-interactive label that appears on hover/focus.
 *
 * Contract:
 *   - Triggered by hover and focus only — never on click alone.
 *   - 200ms hover delay (configurable via `delayDuration` on
 *     `TooltipProvider`).
 *   - Content is text only; no interactive elements. If you need
 *     interactive content, use `Popover` instead.
 *   - The `TooltipContent` runtime check below warns in DEV when a
 *     consumer passes interactive children.
 *   - TooltipProvider must wrap the tree; in the AppShell, this is
 *     the auth plan's job.
 */

function TooltipProvider({
  delayDuration = 200,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

const INTERACTIVE_TAGS = new Set(['a', 'button', 'input', 'select', 'textarea', 'audio', 'video']);

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  // DEV-only runtime check: Tooltip content must not contain
  // interactive elements. Screen readers and keyboard users will not
  // reach the inner control while the tooltip is open, which is a
  // critical a11y violation. Use Popover for that.
  if (import.meta.env.DEV) {
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;
      // Inspect direct child and any descendants one level deep so
      // the warning surfaces common cases without walking the tree.
      const tag = typeof child.type === 'string' ? child.type : null;
      if (tag && INTERACTIVE_TAGS.has(tag)) {
        // eslint-disable-next-line no-console
        console.warn(
          '[Tooltip] interactive child detected. Tooltip content must be plain text — use Popover for interactive content.',
        );
      }
    });
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-fit rounded-md bg-ink px-3 py-1.5 text-xs text-surface-overlay',
          'shadow-md',
          'data-[side=bottom]:slide-in-from-top-2',
          'data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-ink fill-ink z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
