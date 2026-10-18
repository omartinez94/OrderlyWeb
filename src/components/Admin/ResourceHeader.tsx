/**
 * ResourceHeader — standardized page header for admin CRM resources.
 * Renders eyebrow/breadcrumb, title with icon/badge, and action slot.
 */

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface ResourceHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

export function ResourceHeader({
  breadcrumbs,
  title,
  subtitle,
  badge,
  actions,
}: ResourceHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="text-ink-subtle flex items-center gap-1.5 text-xs"
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="text-ink-subtle/60 size-3" />}
                  {crumb.to && !isLast ? (
                    <Link
                      to={crumb.to}
                      className="hover:text-ink underline-offset-4 transition-colors hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-ink font-medium" : ""}>{crumb.label}</span>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="font-display text-ink text-2xl font-bold tracking-tight">{title}</h1>
          {badge}
        </div>

        {subtitle && <p className="text-ink-subtle text-xs">{subtitle}</p>}
      </div>

      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
