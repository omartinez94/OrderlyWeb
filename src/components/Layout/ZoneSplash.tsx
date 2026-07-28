/**
 * ZoneSplash — the placeholder page rendered for every leaf route
 * until the feature module ships. Shows the zone, the page name,
 * and a one-line description. Provides a "Back to <zone> home" link
 * so users have a way out of a leaf they landed on by mistake.
 */

import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { PATH } from "../../router/pathNames";
import type { Zone } from "../Header/types";

export interface ZoneSplashProps {
  zone: Zone;
  title: string;
  subtitle?: string;
}

const ZONE_HOME: Record<Zone, string> = {
  admin: PATH.ADMIN,
  kitchen: PATH.KITCHEN,
  restaurant: PATH.RESTAURANT,
};

const ZONE_LABEL: Record<Zone, string> = {
  admin: "Admin zone",
  kitchen: "Kitchen zone",
  restaurant: "Restaurant zone",
};

export function ZoneSplash({ zone, title, subtitle }: ZoneSplashProps): React.ReactNode {
  return (
    <div className="bg-surface text-ink min-h-[calc(100vh-64px)] font-sans antialiased">
      <main
        id="main"
        className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-16 sm:py-24"
      >
        <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">
          {ZONE_LABEL[zone]}
        </p>
        <h1 className="text-primary font-display text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-ink-muted max-w-xl font-sans text-base leading-relaxed">{subtitle}</p>
        )}

        <Card className="bg-surface-elevated mt-4 border-border-subtle">
          <CardHeader>
            <CardTitle className="text-primary font-display text-lg">Coming soon</CardTitle>
            <CardDescription>
              This page is a placeholder. The feature module will land in a future milestone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link to={ZONE_HOME[zone]}>Back to {ZONE_LABEL[zone].toLowerCase()} home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
