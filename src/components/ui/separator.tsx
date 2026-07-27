import * as React from 'react';
import { Separator as SeparatorPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Separator — a hairline divider between content regions.
 *
 * Contract:
 *   - Default is `decorative` — purely visual, hidden from screen
 *     readers. Set `decorative={false}` for a semantic separator
 *     (e.g. between tool groups in a menubar).
 *   - Color is `bg-border` (Linen Edge) — the quiet hairline
 *     specified in DESIGN.md.
 *   - Horizontal separator: 1px tall, full width.
 *   - Vertical separator: full height, 1px wide.
 */
function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        'data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full',
        'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
