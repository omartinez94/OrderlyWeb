import { useMemo, useState } from "react";
import { toast } from "../../../components/ui";
import {
  useGetTablesQuery,
  useGetMergedTablesQuery,
  useMergeTablesMutation,
  useSplitTablesMutation,
  useUpdateTableStatusMutation,
} from "../../../app/api/catalog";
import type { TableStatus } from "../../../types/catalog";
import type { MergedCluster } from "../types/floor";

export interface UseFloorPlanOptions {
  restaurantId: string;
}

export function useFloorPlan({ restaurantId }: UseFloorPlanOptions) {
  const [selectedStatus, setSelectedStatus] = useState<"all" | TableStatus>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false);

  const {
    data: tables = [],
    isLoading: isTablesLoading,
    isError: isTablesError,
    refetch: refetchTables,
  } = useGetTablesQuery({ restaurantId }, { skip: !restaurantId });

  const {
    data: mergedTables = [],
    isLoading: isMergedLoading,
    refetch: refetchMerged,
  } = useGetMergedTablesQuery({ restaurantId }, { skip: !restaurantId });

  const [mergeTablesMutation, { isLoading: isMerging }] = useMergeTablesMutation();
  const [splitTablesMutation, { isLoading: isSplitting }] = useSplitTablesMutation();
  const [updateTableStatusMutation, { isLoading: isUpdatingStatus }] =
    useUpdateTableStatusMutation();

  // Distinct sections
  const sections = useMemo(() => {
    const set = new Set<string>();
    for (const t of tables) {
      if (t.section) set.add(t.section);
    }
    return Array.from(set);
  }, [tables]);

  // Status counts
  const counts = useMemo(() => {
    const acc: Record<TableStatus | "all", number> = {
      all: tables.length,
      Available: 0,
      Occupied: 0,
      Reserved: 0,
      "Needs Cleaning": 0,
    };

    for (const t of tables) {
      const s = t.status ?? "Available";
      if (acc[s] !== undefined) {
        acc[s] += 1;
      }
    }
    return acc;
  }, [tables]);

  // Resolve merged clusters
  const tableMap = useMemo(() => new Map(tables.map((t) => [t.id, t])), [tables]);

  const activeMergedClusters = useMemo(() => {
    const clusters: MergedCluster[] = [];

    for (const mt of mergedTables) {
      if (!mt.isActive) continue;
      const parent = tableMap.get(mt.parentTableId);
      const child = tableMap.get(mt.childTableId);
      if (parent && child) {
        clusters.push({
          mergedTable: mt,
          parentTable: parent,
          childTable: child,
          combinedCapacity: parent.capacity + child.capacity,
        });
      }
    }

    return clusters;
  }, [mergedTables, tableMap]);

  const mergedTableIds = useMemo(() => {
    const set = new Set<string>();
    for (const c of activeMergedClusters) {
      set.add(c.parentTable.id);
      set.add(c.childTable.id);
    }
    return set;
  }, [activeMergedClusters]);

  // Available tables for merging
  const availableTables = useMemo(
    () =>
      tables.filter((t) => (t.status ?? "Available") === "Available" && !mergedTableIds.has(t.id)),
    [tables, mergedTableIds],
  );

  // Filtered tables
  const filteredTables = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();

    return tables.filter((t) => {
      const currentStatus = t.status ?? "Available";
      if (selectedStatus !== "all" && currentStatus !== selectedStatus) {
        return false;
      }
      if (selectedSection !== "all" && t.section !== selectedSection) {
        return false;
      }
      if (trimmed) {
        const matchesNum = t.tableNumber.toLowerCase().includes(trimmed);
        const matchesSec = t.section?.toLowerCase().includes(trimmed);
        return matchesNum || matchesSec;
      }
      return true;
    });
  }, [tables, selectedStatus, selectedSection, searchQuery]);

  const markCleaned = async (tableId: string) => {
    try {
      await updateTableStatusMutation({
        restaurantId,
        tableId,
        status: "Available",
      }).unwrap();
      toast.success("Table marked as cleaned and available.");
    } catch {
      toast.error("Failed to update table status.");
    }
  };

  const mergeTables = async (parentTableId: string, childTableId: string) => {
    await mergeTablesMutation({
      restaurantId,
      parentTableId,
      childTableId,
    }).unwrap();
  };

  const splitCluster = async (mergedTableId: string) => {
    try {
      await splitTablesMutation({
        restaurantId,
        mergedTableId,
      }).unwrap();
      toast.success("Tables cluster split successfully.");
    } catch {
      toast.error("Failed to split tables.");
    }
  };

  const refetchAll = () => {
    refetchTables();
    refetchMerged();
  };

  return {
    tables,
    filteredTables,
    sections,
    counts,
    activeMergedClusters,
    availableTables,
    mergedTableIds,
    selectedStatus,
    setSelectedStatus,
    selectedSection,
    setSelectedSection,
    searchQuery,
    setSearchQuery,
    isMergeDialogOpen,
    setIsMergeDialogOpen,
    isLoading: isTablesLoading || isMergedLoading,
    isError: isTablesError,
    isMerging,
    isSplitting,
    isUpdatingStatus,
    markCleaned,
    mergeTables,
    splitCluster,
    refetchAll,
  };
}
