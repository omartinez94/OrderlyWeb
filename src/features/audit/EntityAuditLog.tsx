/**
 * EntityAuditLog — unified read-only timeline of audit entries
 * for any entity (brand, restaurant, staff).
 *
 * Implements Phase 3 generic audit timeline.
 * Supports configurable limit, collapsible full history,
 * relative and absolute timestamps, and optional entity badges.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuditForQuery, useListAuditQuery } from "./api";
import type { AuditEntityType, AdminAuditEntry } from "./api";
import { Badge } from "../../components/ui";

const ACTION_LABELS: Record<string, string> = {
  create: "Created",
  update: "Updated",
  archive: "Archived",
  reactivate: "Reactivated",
  deactivate: "Deactivated",
  "role-grant": "Granted role",
  "role-revoke": "Revoked role",
  "restaurant-assign": "Assigned to restaurant",
  "restaurant-unassign": "Removed from restaurant",
};

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = now - then;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatAbsolute(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 19);
}

export interface EntityAuditLogProps {
  entityType?: AuditEntityType;
  entityId?: string;
  limit?: number;
  showEntityBadge?: boolean;
}

export function EntityAuditLog({
  entityType,
  entityId,
  limit = 20,
  showEntityBadge = false,
}: EntityAuditLogProps) {
  const { t } = useTranslation("admin");

  // If entityId is supplied, use auditFor. Otherwise, use listAudit (for cross-entity/dashboard timelines).
  const isSpecificEntity = Boolean(entityId && entityType);
  const auditForRes = useAuditForQuery(
    { entityType: entityType!, entityId: entityId! },
    { skip: !isSpecificEntity },
  );
  const listAuditRes = useListAuditQuery(entityType ? { entityType } : {}, {
    skip: isSpecificEntity,
  });

  const { data, isLoading, isError } = isSpecificEntity ? auditForRes : listAuditRes;
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <p className="text-ink-muted font-sans text-xs" role="status">
        Loading audit log…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-danger font-sans text-xs" role="alert">
        Could not load the audit log.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-ink-muted font-sans text-xs" role="note">
        {t("auditLog.empty")}
      </p>
    );
  }

  const visible = showAll ? data : data.slice(0, limit);

  return (
    <section
      aria-label={t("auditLog.title")}
      className="border-border-subtle bg-surface-elevated rounded-control border p-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-primary font-display text-sm font-bold tracking-wider uppercase">
          {t("auditLog.title")}
        </h2>
        {showEntityBadge && entityType && (
          <Badge variant="outline" className="text-xs capitalize">
            {t(`auditLog.entityLabels.${entityType}`, { defaultValue: entityType })}
          </Badge>
        )}
      </div>

      <ul
        className="m-0 mt-3 flex list-none flex-col gap-2 p-0"
        style={{ contentVisibility: "auto" }}
      >
        {visible.map((entry: AdminAuditEntry) => {
          const actionText = ACTION_LABELS[entry.action] ?? entry.action;
          const currentEntityType = entry.entityType;
          return (
            <li
              key={entry.id}
              className="border-border-subtle border-t pt-2 first:border-t-0 first:pt-0"
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  {showEntityBadge && !entityType && currentEntityType && (
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      {t(`auditLog.entityLabels.${currentEntityType}`, {
                        defaultValue: currentEntityType,
                      })}
                    </Badge>
                  )}
                  <span className="text-ink font-sans text-sm font-medium">{actionText}</span>
                </div>
                <span
                  className="text-ink-subtle font-mono text-xs tabular-nums"
                  title={formatAbsolute(entry.timestamp)}
                >
                  {formatRelative(entry.timestamp)}
                </span>
              </div>
              <p className="text-ink-muted font-sans text-xs">by {entry.actorName}</p>
              {entry.reason && (
                <p className="text-ink-muted font-sans text-xs italic">“{entry.reason}”</p>
              )}
            </li>
          );
        })}
      </ul>

      {data.length > limit && (
        <button
          type="button"
          className="text-primary hover:text-primary-hover mt-3 font-sans text-xs underline"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? "Collapse" : `${t("auditLog.viewFull")} (${data.length})`}
        </button>
      )}
    </section>
  );
}
