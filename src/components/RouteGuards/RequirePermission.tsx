import type { ReactNode } from "react";
import type { Permission } from "../../types/auth";
import { ForbiddenPage } from "../../routes/ForbiddenPage";
import { usePermission } from "./usePermission";

export interface RequirePermissionProps {
  perm: Permission;
  children: ReactNode;
}

export function RequirePermission({ perm, children }: RequirePermissionProps): ReactNode {
  return usePermission(perm) ? <>{children}</> : <ForbiddenPage />;
}
