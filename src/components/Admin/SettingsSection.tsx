/**
 * SettingsSection — container for form and setting groups across Admin CRM.
 */

import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui";

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-ink text-base font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-ink-subtle text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
