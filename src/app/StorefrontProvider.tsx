/**
 * StorefrontProvider — wraps the entire router tree with the Redux
 * `<Provider>`, the session bootstrap, and the SignalR boot component.
 *
 * Mount order (in main.tsx):
 *   <StrictMode>
 *     <StorefrontProvider>          // <-- this file
 *       <RouterProvider router={...} />
 *     </StorefrontProvider>
 *   </StrictMode>
 *
 * Mount tree:
 *   <Provider>
 *     <SessionBoot>                 ← rehydrates session from refresh cookie
 *       <SignalRBootGate />
 *       {children}                  ← router
 *     </SessionBoot>
 *   </Provider>
 *
 * `SessionBoot` renders the branded loading shell until the refresh
 * call resolves, so the router's first render sees a settled slice.
 */

import { type ReactElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { SignalRBoot } from "../components/SignalRBoot/SignalRBoot";
import { useAppSelector } from "./hooks";
import { selectIsAuthenticated } from "./session/sessionSelectors";
import { SessionBoot } from "./session/SessionBoot";

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
      <SessionBoot>
        <SignalRBootGate />
        {children}
      </SessionBoot>
    </Provider>
  );
}
