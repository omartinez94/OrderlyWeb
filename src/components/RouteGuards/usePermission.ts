import { useAuthPredicate } from "./useAuthPredicate";
import type { Permission } from "../../types/auth";

export function usePermission(perm: Permission): boolean {
  const predicate = useAuthPredicate();
  return predicate.permissions.includes(perm);
}
