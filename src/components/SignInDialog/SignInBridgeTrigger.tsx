/**
 * SignInBridgeTrigger — a non-visual wrapper that fires the global
 * "open sign-in" event when any child is clicked.
 *
 * Use when the host of the click (a `<Button>`, a link styled as a
 * button) already has its own visual contract. The trigger forwards
 * all unknown props through `cloneElement` so styling and refs
 * propagate.
 *
 *   <SignInBridgeTrigger className="...">
 *     <Button size="lg">Sign in to Orderly</Button>
 *   </SignInBridgeTrigger>
 */

import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { openSignIn } from "./useDialogBridge";

export interface SignInBridgeTriggerProps {
  children: ReactNode;
  className?: string;
}

export function SignInBridgeTrigger({ children, className }: SignInBridgeTriggerProps) {
  const only = Children.only(children);
  if (!isValidElement(only)) return <>{children}</>;

  const childProps = only.props as { onClick?: (e: React.MouseEvent) => void; className?: string };
  const handleClick = (e: React.MouseEvent): void => {
    childProps.onClick?.(e);
    if (!e.defaultPrevented) openSignIn();
  };

  return cloneElement(only, {
    onClick: handleClick,
    className: [childProps.className, className].filter(Boolean).join(" "),
  } as { onClick: typeof handleClick; className: string });
}
