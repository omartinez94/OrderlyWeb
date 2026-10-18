import type { Table, TableStatus, MergedTableDto } from "../../../types/catalog";

export type TableShape = "square" | "round" | "booth" | "long";

export interface MergedCluster {
  mergedTable: MergedTableDto;
  parentTable: Table;
  childTable: Table;
  combinedCapacity: number;
}

export interface TableFilterState {
  status: "all" | TableStatus;
  section: string;
  searchQuery: string;
}
