/**
 * RequireAuth — gates a route on `predicate.isAuthenticated`.
 *
 * Unauthenticated visitors are redirected to `/login` with a
 * `returnTo` query param so the login page can send them back
 * after success. The `returnTo` value is normalized through
 * `safeReturnPath` to defend against open-redirect attacks.
 */

import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuthPredicate } from "./useAuthPredicate";
import { PATH } from "../../router/pathNames";
import { safeReturnPath } from "../../lib/safeReturnPath";

export interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps): React.ReactNode {
  const predicate = useAuthPredicate();
  const location = useLocation();

  if (!predicate.isAuthenticated) {
    const returnTo = safeReturnPath(`${location.pathname}${location.search}`, PATH.HOME);
    const target = `${PATH.LOGIN}?returnTo=${encodeURIComponent(returnTo)}`;
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}
