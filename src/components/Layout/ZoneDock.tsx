/**
 * ZoneDock — a modern macOS-style navigation dock.
 *
 * Features:
 *   - Cosine distance magnification on cursor hover with prefers-reduced-motion check.
 *   - Native drag-and-drop reordering with persistent order in localStorage per zone.
 *   - Accessible keyboard reordering (Alt+ArrowLeft / Alt+ArrowRight) with aria-live announcer.
 *   - Soft, transparent focus ring (outline-transparent with subtle translucent ring).
 *   - Tooltip integration via Radix UI Tooltip.
 *   - Active route glowing dot indicator.
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { NavLink } from "react-router";
import { Compass } from "lucide-react";
import { useTranslate } from "../../hooks/useTranslate";
import type { Role } from "../../types/auth";
import { useAuthPredicate } from "../RouteGuards/useAuthPredicate";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import type { DockItem } from "./ZoneSidebar";
import type { Zone } from "../Header/types";

const MAGNIFICATION_RADIUS = 120;
const BASE_SIZE = 44;
const MAX_SCALE = 1.35;

export interface ZoneDockProps {
  zone: Zone;
  items: readonly DockItem[];
}

export function ZoneDock({ zone, items }: ZoneDockProps) {
  const predicate = useAuthPredicate();
  const translate = useTranslate();
  const roleSet = new Set<Role>(predicate.roles);

  // Filter items visible to current role
  const visibleItems = items.filter(
    (item) => !item.roles || item.roles.some((r) => roleSet.has(r)),
  );

  const storageKey = `orderly_dock_order_${zone}`;

  // Maintain ordered list of items
  const [orderedItems, setOrderedItems] = useState<DockItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const savedPaths = JSON.parse(stored) as string[];
        const map = new Map(visibleItems.map((item) => [item.to, item]));
        const result: DockItem[] = [];

        // Add saved items in order
        for (const path of savedPaths) {
          const found = map.get(path);
          if (found) {
            result.push(found);
            map.delete(path);
          }
        }
        // Append any new or remaining items
        for (const remaining of map.values()) {
          result.push(remaining);
        }
        return result;
      }
    } catch {
      // Fallback to default order on storage error
    }
    return [...visibleItems];
  });

  // Synchronize if visible items change (e.g. role update)
  useEffect(() => {
    setOrderedItems((prev) => {
      const currentPaths = new Set(visibleItems.map((i) => i.to));
      const prevPaths = new Set(prev.map((i) => i.to));
      // If the set of visible items has not changed, retain custom user order
      if (
        currentPaths.size === prevPaths.size &&
        [...currentPaths].every((p) => prevPaths.has(p))
      ) {
        return prev;
      }
      const map = new Map(visibleItems.map((item) => [item.to, item]));
      const result: DockItem[] = [];
      for (const item of prev) {
        if (map.has(item.to)) {
          result.push(map.get(item.to)!);
          map.delete(item.to);
        }
      }
      for (const remaining of map.values()) {
        result.push(remaining);
      }
      return result;
    });
  }, [visibleItems]);

  // Persist order to localStorage
  const saveOrder = useCallback(
    (newItems: DockItem[]) => {
      setOrderedItems(newItems);
      try {
        localStorage.setItem(storageKey, JSON.stringify(newItems.map((i) => i.to)));
      } catch {
        // Ignore storage quota errors
      }
    },
    [storageKey],
  );

  // Mouse magnification state
  const dockRef = useRef<HTMLElement | null>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Screen reader announcement for accessible reordering
  const [announcement, setAnnouncement] = useState("");

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", orderedItems[index].to);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const updated = [...orderedItems];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(dropIndex, 0, removed);
      saveOrder(updated);

      const label = removed.labelKey
        ? translate(removed.labelKey, removed.label ?? removed.to)
        : (removed.label ?? removed.to);
      setAnnouncement(`Moved ${label} to position ${dropIndex + 1} of ${updated.length}.`);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Keyboard navigation & accessible reordering
  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const isAlt = e.altKey || e.metaKey;
    const total = orderedItems.length;

    if (isAlt && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      const targetIndex = e.key === "ArrowLeft" ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < total) {
        const updated = [...orderedItems];
        const [removed] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, removed);
        saveOrder(updated);

        const label = removed.labelKey
          ? translate(removed.labelKey, removed.label ?? removed.to)
          : (removed.label ?? removed.to);
        setAnnouncement(`Moved ${label} to position ${targetIndex + 1} of ${total}.`);

        // Refocus moved item
        requestAnimationFrame(() => {
          const targetEl =
            dockRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-dock-item]")[targetIndex];
          targetEl?.focus();
        });
      }
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = index > 0 ? index - 1 : total - 1;
      const prevEl =
        dockRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-dock-item]")[prevIndex];
      prevEl?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = index < total - 1 ? index + 1 : 0;
      const nextEl =
        dockRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-dock-item]")[nextIndex];
      nextEl?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      const firstEl = dockRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-dock-item]")[0];
      firstEl?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const lastEl =
        dockRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-dock-item]")[total - 1];
      lastEl?.focus();
    }
  };

  return (
    <>
      {/* Screen reader live region for reorder feedback */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <nav
        ref={dockRef}
        aria-label="Zone dock navigation"
        className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2 select-none"
        onMouseMove={(e) => {
          if (!isReducedMotion) {
            setMouseX(e.clientX);
          }
        }}
        onMouseLeave={() => setMouseX(null)}
      >
        <ul
          role="toolbar"
          aria-label="Dock navigation items"
          className="bg-surface-elevated/80 dark:bg-surface/80 border-border-subtle m-0 flex items-end gap-1.5 rounded-2xl border p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
        >
          {orderedItems.map((item, index) => {
            const labelText = item.labelKey
              ? translate(item.labelKey, item.label ?? item.labelKey)
              : (item.label ?? item.to);
            const IconComponent = item.icon ?? Compass;

            return (
              <DockItemNode
                key={item.to}
                item={item}
                index={index}
                labelText={labelText}
                IconComponent={IconComponent}
                mouseX={mouseX}
                isReducedMotion={isReducedMotion}
                isDragging={draggedIndex === index}
                isDragOver={dragOverIndex === index}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            );
          })}
        </ul>
      </nav>
    </>
  );
}

interface DockItemNodeProps {
  item: DockItem;
  index: number;
  labelText: string;
  IconComponent: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  mouseX: number | null;
  isReducedMotion: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLLIElement>) => void;
  onDrop: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragEnd: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLAnchorElement>) => void;
}

function DockItemNode({
  item,
  labelText,
  IconComponent,
  mouseX,
  isReducedMotion,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onKeyDown,
}: DockItemNodeProps) {
  const itemRef = useRef<HTMLLIElement | null>(null);

  // Compute magnification scale via cosine curve based on cursor distance
  let scale = 1;
  if (!isReducedMotion && mouseX !== null && itemRef.current) {
    const rect = itemRef.current.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const distance = Math.abs(mouseX - centerX);
    if (distance < MAGNIFICATION_RADIUS) {
      const factor = Math.cos((distance / MAGNIFICATION_RADIUS) * (Math.PI / 2));
      scale = 1 + (MAX_SCALE - 1) * factor;
    }
  }

  const dynamicSize = Math.round(BASE_SIZE * scale);

  return (
    <li
      ref={itemRef}
      role="none"
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={[
        "relative flex flex-col items-center justify-end transition-[width,height,opacity] duration-150 ease-out cursor-grab active:cursor-grabbing",
        isDragging ? "opacity-40 scale-95" : "opacity-100",
        isDragOver
          ? "before:absolute before:inset-y-0 before:-left-1 before:w-0.5 before:bg-accent before:rounded-full"
          : "",
      ].join(" ")}
      style={{
        width: `${dynamicSize}px`,
        height: `${dynamicSize}px`,
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={item.to}
            end={item.to.split("/").length <= 3}
            data-dock-item
            aria-label={labelText}
            onKeyDown={onKeyDown}
            className={({ isActive }) =>
              [
                "relative flex items-center justify-center w-full h-full rounded-xl transition-all duration-150",
                "bg-surface/50 hover:bg-surface-elevated dark:bg-surface/30 dark:hover:bg-surface-elevated/20",
                // Transparent, non-aggressive focus ring with Windows High Contrast detection
                "focus-visible:outline-2 focus-visible:outline-transparent focus-visible:ring-2 focus-visible:ring-primary/20 dark:focus-visible:ring-white/15 focus-visible:scale-105",
                isActive
                  ? "text-primary dark:text-ink font-semibold"
                  : "text-ink-muted hover:text-ink",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <IconComponent
                  className="h-5 w-5 transition-transform duration-150"
                  style={{
                    transform: `scale(${scale})`,
                  }}
                />
                {/* Active indicator dot */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="bg-accent absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full shadow-[0_0_6px_rgba(234,88,12,0.8)]"
                  />
                )}
              </>
            )}
          </NavLink>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={12}
          className="bg-surface-elevated text-ink border-border-subtle pointer-events-none rounded-md border px-2.5 py-1 text-xs font-medium shadow-md"
        >
          {labelText}
        </TooltipContent>
      </Tooltip>
    </li>
  );
}
