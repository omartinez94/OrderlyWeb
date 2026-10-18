import { Link2Off, Users, Layers } from "lucide-react";
import { Card, CardContent, Badge, Button } from "../../../components/ui";
import type { MergedCluster } from "../types/floor";

export interface MergedTableGroupProps {
  cluster: MergedCluster;
  onSplit: (mergedTableId: string) => void;
  isSplitting?: boolean;
}

export function MergedTableGroup({ cluster, onSplit, isSplitting = false }: MergedTableGroupProps) {
  const { parentTable, childTable, combinedCapacity, mergedTable } = cluster;

  return (
    <Card
      data-testid={`merged-cluster-${mergedTable.id}`}
      className="border-primary/50 bg-primary/5 relative overflow-hidden border-2 border-dashed shadow-xs"
    >
      <CardContent className="flex flex-col gap-3 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-md">
              <Layers className="size-4" />
            </div>
            <div>
              <h3 className="text-ink font-display text-sm font-bold">
                Merged Cluster: {parentTable.tableNumber} + {childTable.tableNumber}
              </h3>
              <p className="text-ink-subtle text-[11px]">
                {parentTable.section ?? "Main"} • Combined Seating
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-primary/40 bg-primary/10 text-primary gap-1 text-[11px] font-semibold"
          >
            <Users className="size-3" />
            <span className="font-mono tabular-nums">{combinedCapacity} Seats</span>
          </Badge>
        </div>

        {/* Tables list in cluster */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="border-border/60 bg-surface rounded-md border p-2">
            <span className="text-ink font-semibold">Table {parentTable.tableNumber}</span>
            <span className="text-ink-subtle block text-[11px]">
              Capacity: {parentTable.capacity} • {parentTable.status}
            </span>
          </div>
          <div className="border-border/60 bg-surface rounded-md border p-2">
            <span className="text-ink font-semibold">Table {childTable.tableNumber}</span>
            <span className="text-ink-subtle block text-[11px]">
              Capacity: {childTable.capacity} • {childTable.status}
            </span>
          </div>
        </div>

        {/* Action Button: Split Tables */}
        <div className="border-border/50 flex justify-end border-t pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isSplitting}
            onClick={() => onSplit(mergedTable.id)}
            className="text-destructive hover:text-destructive gap-1.5 text-xs"
          >
            <Link2Off className="size-3.5" />
            Split Cluster
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
