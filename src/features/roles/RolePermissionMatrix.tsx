/**
 * RolePermissionMatrix — read-only tabular presentation of the 8 platform roles
 * cross-referenced against the 16 CRM permissions.
 *
 * Consumes `ROLE_PERMISSIONS` directly from `src/types/auth.ts`.
 */

import { useTranslation } from "react-i18next";
import { Check, Minus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Card,
  Badge,
} from "../../components/ui";
import { ROLE_PERMISSIONS, type Role, type Permission } from "../../types/auth";

const ROLES: readonly Role[] = [
  "SuperAdmin",
  "RestaurantAdmin",
  "Manager",
  "KitchenManager",
  "KitchenStaff",
  "Waiter",
  "Cashier",
  "Host",
];

const PERMISSIONS: readonly Permission[] = [
  "brands:view",
  "brands:create",
  "brands:edit",
  "brands:archive",
  "restaurants:create",
  "restaurants:edit",
  "restaurants:archive",
  "users:view_all",
  "users:create",
  "users:edit",
  "users:assign_roles",
  "users:assign_restaurants",
  "roles:view",
  "audit:view",
  "settings:view",
  "settings:edit",
];

export function RolePermissionMatrix() {
  const { t } = useTranslation("admin");

  return (
    <Card className="overflow-x-auto p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-ink w-56 font-semibold">
              {t("roles.permissionColumn")}
            </TableHead>
            {ROLES.map((role) => (
              <TableHead key={role} className="text-ink text-center font-medium">
                <span className="block text-xs font-semibold">
                  {t(`roles.${role[0].toLowerCase() + role.slice(1)}`, { defaultValue: role })}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERMISSIONS.map((perm) => {
            const resource = perm.split(":")[0];
            return (
              <TableRow key={perm} className="hover:bg-surface-elevated/50 transition-colors">
                <TableCell className="text-ink font-mono text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      {resource}
                    </Badge>
                    <span>{perm}</span>
                  </div>
                </TableCell>
                {ROLES.map((role) => {
                  const hasPerm = ROLE_PERMISSIONS[role].includes(perm);
                  return (
                    <TableCell key={role} className="text-center">
                      {hasPerm ? (
                        <div className="bg-primary/10 text-primary inline-flex size-6 items-center justify-center rounded-full">
                          <Check className="size-3.5" aria-label={`Granted to ${role}`} />
                        </div>
                      ) : (
                        <div className="text-ink-subtle/40 inline-flex size-6 items-center justify-center">
                          <Minus className="size-3.5" aria-hidden="true" />
                        </div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
