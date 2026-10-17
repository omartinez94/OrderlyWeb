/**
 * Standalone popup launcher for the Virtual Bump Bar.
 *
 * Opens an isolated, non-resizable auxiliary window (840x220) replicating
 * the physical Logic Controls KB9000 membrane keypad.
 *
 * Uses BroadcastChannel("orderly-kds-bumpbar") to communicate back to the KDS main window.
 */

export function openVirtualBumpBar(): Window | null {
  const width = 840;
  const height = 220;
  const screenW = typeof window !== "undefined" && window.screen ? window.screen.width : 1024;
  const screenH = typeof window !== "undefined" && window.screen ? window.screen.height : 768;
  const left = Math.max(0, screenW - width - 20);
  const top = Math.max(0, screenH - height - 60);

  if (typeof window === "undefined" || !window.open) {
    return null;
  }

  return window.open(
    "/site/kitchen/virtual-bumpbar",
    "OrderlyVirtualBumpBar",
    `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no,location=no,toolbar=no`,
  );
}
