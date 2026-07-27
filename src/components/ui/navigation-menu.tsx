"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * NavigationMenu — top-level horizontal navigation.
 *
 * Used for marketing surfaces and admin dashboards. For complex
 * tool palettes, use `Menubar` instead.
 *
 * Accessibility:
 *   - Radix handles the roving tabindex and the open/close
 *     announcements.
 *   - Triggers expose `aria-expanded` and `aria-haspopup`; the
 *     content region uses `aria-orientation`.
 *   - `NavigationMenuLink` exposes `data-active` when the route
 *     matches; the consumer wires this through React Router.
 */
function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva([
  "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
  "bg-transparent text-ink-muted transition-colors outline-none",
  "hover:bg-surface-elevated hover:text-ink",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50",
  "data-[state=open]:bg-surface-elevated data-[state=open]:text-ink",
]);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-2 pr-2.5",
        "data-[motion=from-end]:slide-in-from-right-52",
        "data-[motion=from-start]:slide-in-from-left-52",
        "data-[motion=to-end]:slide-out-to-right-52",
        "data-[motion=to-start]:slide-out-to-left-52",
        "data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in",
        "data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out",
        "md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:top-full",
        "group-data-[viewport=false]/navigation-menu:mt-1.5",
        "group-data-[viewport=false]/navigation-menu:overflow-hidden",
        "group-data-[viewport=false]/navigation-menu:rounded-md",
        "group-data-[viewport=false]/navigation-menu:border",
        "group-data-[viewport=false]/navigation-menu:border-border-subtle",
        "group-data-[viewport=false]/navigation-menu:bg-popover",
        "group-data-[viewport=false]/navigation-menu:text-ink",
        "group-data-[viewport=false]/navigation-menu:shadow-md",
        "group-data-[viewport=false]/navigation-menu:duration-200",
        "**:data-[slot=navigation-menu-link]:focus:ring-0",
        "**:data-[slot=navigation-menu-link]:focus:outline-none",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className={cn("absolute top-full left-0 isolate z-50 flex justify-center")}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border border-border-subtle bg-popover text-ink shadow-md",
          "data-[state=open]:animate-in data-[state=open]:zoom-in-90",
          "data-[state=closed]:animate-out data-[state=closed]:zoom-out-95",
          "md:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm outline-none transition-colors",
        "hover:bg-surface-elevated hover:text-ink",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "data-[active=true]:bg-surface-elevated data-[active=true]:text-ink",
        '[&_svg:not([class*="size-"])]:size-4',
        '[&_svg:not([class*="text-"])]:text-ink-muted',
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        "data-[state=hidden]:animate-out data-[state=hidden]:fade-out",
        "data-[state=visible]:animate-in data-[state=visible]:fade-in",
        className,
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
