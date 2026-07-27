"use client";

import { Collapsible as CollapsiblePrimitive } from "radix-ui";

/**
 * Collapsible — in-place show/hide content region.
 *
 * Use this for content that is not part of a stacked list (Accordion
 * is for that). A common pattern is a "Show advanced settings"
 * disclosure inside a form.
 *
 * Keyboard contract (Radix-handled):
 *   - Space/Enter on the trigger toggles the content.
 *   - `aria-expanded` is owned by Radix.
 */
function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
