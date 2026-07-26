'use client';

import * as React from 'react';
import { Avatar as AvatarPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Avatar — user identity surface.
 *
 * Sizes: `sm` (24px), `default` (32px), `lg` (40px).
 *
 * Accessibility:
 *   - `<AvatarImage>` always requires `alt`. Decorative avatars
 *     pass `alt=""`. The fallback initials are computed by the
 *     consumer (we do not read the name from a DTO here).
 *   - `<AvatarFallback>` renders when the image is missing or
 *     fails to load; it should still announce via `aria-label` on
 *     the root.
 */
function Avatar({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: 'default' | 'sm' | 'lg';
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        'group/avatar relative flex shrink-0 overflow-hidden rounded-full select-none',
        'data-[size=default]:size-8',
        'data-[size=sm]:size-6',
        'data-[size=lg]:size-10',
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-surface-elevated text-xs font-medium text-ink-muted',
        'group-data-[size=sm]/avatar:text-[0.65rem]',
        'group-data-[size=default]/avatar:text-xs',
        'group-data-[size=lg]/avatar:text-sm',
        className
      )}
      {...props}
    />
  );
}

function AvatarBadge({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        'absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-surface-overlay select-none',
        className
      )}
      {...props}
    />
  );
}

function AvatarGroup({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-surface-overlay',
        className
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-xs font-medium text-ink-muted ring-2 ring-surface-overlay',
        className
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
};
