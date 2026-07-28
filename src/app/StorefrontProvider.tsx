/**
 * StorefrontProvider — wraps the entire router tree with the Redux
 * `<Provider>`. Mounted in `main.tsx` *inside* `<RouterProvider>`'s
 * element so any component below can call `useAppSelector`.
 *
 * Order in main.tsx (top-down):
 *   <StrictMode>
 *     <StorefrontProvider>          // <-- this file
 *       <RouterProvider router={...} />
 *     </StorefrontProvider>
 *   </StrictMode>
 *
 * Phase 4 will also mount <SignalRBoot /> here so it can read
 * session state via selectors.
 */

import { type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "./store";

export function StorefrontProvider({ children }: { children: ReactNode }): ReactNode {
  return <Provider store={store}>{children}</Provider>;
}
