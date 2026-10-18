/**
 * StatusBadge — status indicator mapping brand/restaurant states
 * ('active' | 'inactive' | 'archived') to styled Badges with localized copy.
 */

import { useTranslation } from "react-i18next";
import { Badge } from "../ui";
import type { RestaurantStatus } from "../../types/catalog";

export interface StatusBadgeProps {
  status: RestaurantStatus | boolean;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation("admin");

  const normalizedStatus: RestaurantStatus =
    typeof status === "boolean" ? (status ? "active" : "inactive") : status;

  const variant =
    normalizedStatus === "active"
      ? "default"
      : normalizedStatus === "inactive"
        ? "outline"
        : "secondary";

  const labelKey = `status.${normalizedStatus}` as const;

  return (
    <Badge variant={variant} className={className}>
      {t(labelKey)}
    </Badge>
  );
}
