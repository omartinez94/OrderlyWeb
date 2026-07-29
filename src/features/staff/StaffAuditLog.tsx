/**
 * StaffAuditLog — read-only timeline of audit entries for a staff
 * member. Mounted under the action buttons on `StaffDetail`.
 *
 * Phase 4 of staff-management. Shows the most recent 20 entries;
 * a "View full history" button expands to the full list (the
 * modal is a simple full-list render here — Phase 5+ can swap it
 * for a proper dialog primitive).
 *
 * Vercel `rendering-content-visibility` — the timeline `<ul>`
 * carries `content-visibility: auto` for long histories.
 */

import { useState } from "react";
import { useAuditLogForQuery } from "./api";
import type { StaffAuditEntry } from "../../app/api/identity";

const ACTION_LABEL: Record<StaffAuditEntry["action"], string> = {
  create: "Created",
  update: "Updated",
  deactivate: "Deactivated",
  reactivate: "Reactivated",
  "role-grant": "Granted role",
  "role-revoke": "Revoked role",
  "restaurant-assign": "Assigned to restaurant",
  "restaurant-unassign": "Removed from restaurant",
};

function formatRelative(iso: string): string {
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

function formatAbsolute(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 19);
}

export interface StaffAuditLogProps {
  staffId: string;
}

export function StaffAuditLog({ staffId }: StaffAuditLogProps) {
  const { data, isLoading, isError } = useAuditLogForQuery(staffId, { skip: !staffId });
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
        No activity recorded yet.
      </p>
    );
  }

  const visible = showAll ? data : data.slice(0, 20);

  return (
    <section
      aria-label="Audit log"
      className="border-border-subtle bg-surface-elevated rounded-control border p-4"
    >
      <h2 className="text-primary font-display text-sm font-bold tracking-wider uppercase">
        Activity
      </h2>
      <ul
        className="m-0 mt-3 flex list-none flex-col gap-2 p-0"
        style={{ contentVisibility: "auto" }}
      >
        {visible.map((entry) => (
          <li
            key={entry.id}
            className="border-border-subtle border-t pt-2 first:border-t-0 first:pt-0"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-ink font-sans text-sm font-medium">
                {ACTION_LABEL[entry.action]}
              </span>
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
        ))}
      </ul>
      {data.length > 20 && (
        <button
          type="button"
          className="text-primary hover:text-primary-hover mt-3 font-sans text-xs underline"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? "Collapse" : `View full history (${data.length} entries)`}
        </button>
      )}
    </section>
  );
}
