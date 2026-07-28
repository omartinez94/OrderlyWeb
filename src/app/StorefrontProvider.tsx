/**
 * StorefrontProvider — wraps the entire router tree with the Redux
 * `<Provider>` and the SignalR boot component.
 *
 * Mount order (in main.tsx):
 *   <StrictMode>
 *     <StorefrontProvider>          // <-- this file
 *       <RouterProvider router={...} />
 *     </StorefrontProvider>
 *   </StrictMode>
 *
 * Phase 3 also mounts <SignalRBoot /> here so it can read session
 * state via selectors. `enabled` flips true once the session slice
 * reports `authenticated`.
 */

import { type ReactElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { SignalRBoot } from "../components/SignalRBoot/SignalRBoot";
import { useAppSelector } from "./hooks";
import { selectIsAuthenticated } from "./session/sessionSelectors";

/**
 * Inner wrapper that reads session state and toggles SignalR boot.
 * Lives inside `<Provider>` so the selector can read the store.
 */
function SignalRBootGate(): ReactElement | null {
  const enabled = useAppSelector(selectIsAuthenticated);
  return <SignalRBoot enabled={enabled} />;
}

export function StorefrontProvider({ children }: { children: ReactNode }): ReactNode {
  return (
    <Provider store={store}>
      <SignalRBootGate />
      {children}
    </Provider>
  );
}
