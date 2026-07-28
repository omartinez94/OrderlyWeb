/**
 * SignInDialogHost — the singleton owner of the sign-in dialog state.
 *
 * Mounted once by `RootLayout` (and only once). Listens for the
 * `orderly:open-signin` CustomEvent so any component can open the
 * dialog without importing it directly.
 */

import { useCallback, useState } from "react";
import { SignInDialog } from "./SignInDialog";
import { useDialogBridge } from "./useDialogBridge";

export function SignInDialogHost(): React.ReactNode {
  const [open, setOpen] = useState(false);
  const openDialog = useCallback(() => setOpen(true), []);
  useDialogBridge(openDialog);

  return <SignInDialog open={open} onOpenChange={setOpen} />;
}
