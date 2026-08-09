import { useAppSelector } from "../../app/hooks";
import { selectPredicate } from "../../app/session/sessionSelectors";
import type { Permission } from "../../types/auth";

export function usePermission(perm: Permission): boolean {
  return useAppSelector((state) => selectPredicate(state).permissions.includes(perm));
}
