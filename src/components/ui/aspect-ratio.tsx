"use client";

import { AspectRatio as AspectRatioPrimitive } from "radix-ui";

/**
 * AspectRatio — constrains its child to a fixed aspect ratio.
 *
 * Used to keep media (images, video, charts) at a predictable
 * shape so layout doesn't shift while assets load. The primitive
 * itself is unstyled; pass `ratio={16 / 9}` and style the child
 * directly.
 */
function AspectRatio({ ...props }: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
