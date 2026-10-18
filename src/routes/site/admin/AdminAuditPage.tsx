/**
 * AdminAuditPage — cross-entity audit timeline.
 * Phase 3 deliverable.
 * Provides filters for entity type, actor, and date range.
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useListAuditQuery, type AuditEntityType } from "../../../features/audit";
import { ResourceHeader } from "../../../components/Admin";
import {
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Badge,
} from "../../../components/ui";
import { PATH } from "../../../router/pathNames";
import { formatAbsolute, formatRelative } from "../../../features/audit/EntityAuditLog";

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

export function AdminAuditPage() {
  const { t } = useTranslation("admin");
  const [entityType, setEntityType] = useState<string>("all");
  const [actorQuery, setActorQuery] = useState<string>("");
  const [since, setSince] = useState<string>("");
  const [until, setUntil] = useState<string>("");

  const queryParams = useMemo(() => {
    return {
      entityType: entityType !== "all" ? (entityType as AuditEntityType) : undefined,
      since: since ? new Date(since).toISOString() : undefined,
      until: until ? new Date(until).toISOString() : undefined,
    };
  }, [entityType, since, until]);

  const { data: auditEntries = [], isLoading, isError } = useListAuditQuery(queryParams);

  const filteredEntries = useMemo(() => {
    if (!actorQuery.trim()) return auditEntries;
    const q = actorQuery.toLowerCase().trim();
    return auditEntries.filter((e) => e.actorName.toLowerCase().includes(q));
  }, [auditEntries, actorQuery]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <ResourceHeader
        breadcrumbs={[{ label: "Admin", to: PATH.ADMIN }, { label: t("audit.title") }]}
        title={t("audit.title")}
        subtitle={t("audit.subtitle")}
      />

      {/* Filter toolbar */}
      <Card className="flex flex-wrap items-center gap-4 p-4">
        {/* Entity Type Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-ink-muted text-xs font-medium">{t("audit.filterEntity")}</label>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger aria-label={t("audit.filterEntity")} className="w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("audit.allEntities")}</SelectItem>
              <SelectItem value="brand">{t("audit.entityLabels.brand")}</SelectItem>
              <SelectItem value="restaurant">{t("audit.entityLabels.restaurant")}</SelectItem>
              <SelectItem value="staff">{t("audit.entityLabels.staff")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actor Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-ink-muted text-xs font-medium">{t("audit.filterActor")}</label>
          <Input
            type="text"
            placeholder="Search actor…"
            value={actorQuery}
            onChange={(e) => setActorQuery(e.target.value)}
            className="w-48 text-xs"
          />
        </div>

        {/* Since Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-ink-muted text-xs font-medium">From</label>
          <Input
            type="date"
            aria-label="From date"
            value={since}
            onChange={(e) => setSince(e.target.value)}
            className="w-36 text-xs"
          />
        </div>

        {/* Until Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-ink-muted text-xs font-medium">To</label>
          <Input
            type="date"
            aria-label="To date"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
            className="w-36 text-xs"
          />
        </div>

        {/* Entry count */}
        <div className="text-ink-subtle ml-auto self-end text-xs">
          {t("audit.entries", { count: filteredEntries.length })}
        </div>
      </Card>

      {/* Audit Entries List */}
      <section
        aria-label={t("audit.title")}
        className="border-border-subtle bg-surface-elevated rounded-control border p-4"
      >
        {isLoading ? (
          <p className="text-ink-muted font-sans text-xs" role="status">
            Loading audit entries…
          </p>
        ) : isError ? (
          <p className="text-danger font-sans text-xs" role="alert">
            Could not load audit entries.
          </p>
        ) : filteredEntries.length === 0 ? (
          <p className="text-ink-muted font-sans text-xs" role="note">
            {t("auditLog.empty")}
          </p>
        ) : (
          <ul
            className="m-0 flex list-none flex-col gap-3 p-0"
            style={{ contentVisibility: "auto" }}
          >
            {filteredEntries.map((entry) => {
              const actionText = ACTION_LABELS[entry.action] ?? entry.action;
              return (
                <li
                  key={entry.id}
                  className="border-border-subtle border-t pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {t(`audit.entityLabels.${entry.entityType}`, {
                          defaultValue: entry.entityType,
                        })}
                      </Badge>
                      <span className="text-ink font-sans text-sm font-medium">{actionText}</span>
                      <span className="text-ink-subtle font-mono text-xs">({entry.entityId})</span>
                    </div>
                    <span
                      className="text-ink-subtle font-mono text-xs tabular-nums"
                      title={formatAbsolute(entry.timestamp)}
                    >
                      {formatRelative(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-ink-muted mt-1 font-sans text-xs">
                    by <span className="text-ink font-medium">{entry.actorName}</span>
                  </p>
                  {entry.reason && (
                    <p className="text-ink-muted mt-0.5 font-sans text-xs italic">
                      “{entry.reason}”
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
