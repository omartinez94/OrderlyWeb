/**
 * RouteLoadingShell — the shared suspense fallback for every lazy
 * route. Calm, sparse, no spinners inside content — the page-level
 * `<Suspense>` boundary (mounted by `RootLayout`) swaps the active
 * child route in once the chunk is ready. This surface is what
 * shows during the gap.
 */

import { Card, CardContent } from "../ui/card";

export function RouteLoadingShell(): React.ReactNode {
  return (
    <div className="bg-surface text-ink min-h-[calc(100vh-64px)] font-sans antialiased">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-16">
        <p className="text-ink-subtle font-mono text-xs tracking-widest uppercase">Loading</p>
        <Card className="bg-surface-elevated">
          <CardContent className="space-y-3 py-8">
            <div className="bg-surface h-3 w-2/3 rounded" />
            <div className="bg-surface h-3 w-1/2 rounded" />
            <div className="bg-surface h-3 w-3/4 rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
