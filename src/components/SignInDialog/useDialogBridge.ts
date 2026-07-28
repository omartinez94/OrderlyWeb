/**
 * useDialogBridge — bridges a CustomEvent on `window` to a callback
 * inside a React component.
 *
 * The sign-in dialog lives in exactly one place (`SignInDialogHost`,
 * mounted by `RootLayout`). Components that want to open it without
 * importing it directly fire `window.dispatchEvent(new
 * CustomEvent("orderly:open-signin"))`. The host listens and opens.
 *
 * Why the bridge: the marketing landing, the showcase, and any
 * future "Locked" gate all want to open the same dialog. Importing
 * `SignInDialog` everywhere creates duplicate mounted dialogs
 * (state diverges). The bridge keeps state in one component.
 *
 * Performance note (Phase 1, Vercel `advanced-event-handler-refs`):
 * the latest `open` callback lives in a ref so the
 * `addEventListener` binding is set up once on mount and never
 * re-binds across `open` identity changes. Without this, the host
 * would re-attach its listener on every parent re-render.
 */

import { useEffect, useRef } from "react";

export const SIGN_IN_EVENT = "orderly:open-signin";

export function openSignIn(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SIGN_IN_EVENT));
}

export function useDialogBridge(open: () => void): void {
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (): void => openRef.current();
    window.addEventListener(SIGN_IN_EVENT, handler);
    return () => {
      window.removeEventListener(SIGN_IN_EVENT, handler);
    };
  }, []);
}
