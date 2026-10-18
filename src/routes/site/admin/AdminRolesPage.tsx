/**
 * AdminRolesPage — `/site/admin/roles`.
 * Read-only role × permission matrix for the CRM.
 * Gated by roles:view permission (SuperAdmin & RestaurantAdmin).
 */

import { useTranslation } from "react-i18next";
import { ResourceHeader } from "../../../components/Admin";
import { RolePermissionMatrix } from "../../../features/roles";
import { PATH } from "../../../router/pathNames";

export function AdminRolesPage() {
  const { t } = useTranslation("admin");

  return (
    <div className="flex flex-col gap-6 p-6">
      <ResourceHeader
        breadcrumbs={[{ label: "Admin", to: PATH.ADMIN }, { label: t("roles.title") }]}
        title={t("roles.title")}
        subtitle={t("roles.subtitle")}
      />

      <RolePermissionMatrix />
    </div>
  );
}
