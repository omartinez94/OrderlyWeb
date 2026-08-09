import { Navigate } from "react-router";
import { PATH } from "../../../router/pathNames";

export function AdminUsersPage(): React.ReactNode {
  return <Navigate to={PATH.ADMIN_STAFF} replace />;
}
