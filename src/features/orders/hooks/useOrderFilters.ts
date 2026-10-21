/**
 * useOrderFilters — URL query-param-backed filter and pagination state
 * for the Order Operations table.
 *
 * Keeps status, orderType, search query, page, and pageSize in sync with URL
 * so that filters survive page reloads and deep linking works seamlessly.
 */

import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { QUERY_PARAM } from "../../../router/pathNames";
import { BackendOrderStatus, OrderType } from "../../../types/order";

export interface OrderFilters {
  status: BackendOrderStatus | undefined;
  orderType: OrderType | undefined;
  query: string;
  page: number;
  pageSize: number;
  setStatus: (status: BackendOrderStatus | undefined) => void;
  setOrderType: (orderType: OrderType | undefined) => void;
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
}

const VALID_STATUSES: readonly BackendOrderStatus[] = Object.values(BackendOrderStatus);
const VALID_TYPES: readonly OrderType[] = Object.values(OrderType);

function isValidStatus(value: string | null): value is BackendOrderStatus {
  return value !== null && (VALID_STATUSES as readonly string[]).includes(value);
}

function isValidType(value: string | null): value is OrderType {
  return value !== null && (VALID_TYPES as readonly string[]).includes(value);
}

export function useOrderFilters(): OrderFilters {
  const [searchParams, setSearchParams] = useSearchParams();

  const statusRaw = searchParams.get(QUERY_PARAM.STATUS);
  const status = isValidStatus(statusRaw) ? statusRaw : undefined;

  const typeRaw = searchParams.get(QUERY_PARAM.ORDER_TYPE);
  const orderType = isValidType(typeRaw) ? typeRaw : undefined;

  const query = searchParams.get(QUERY_PARAM.QUERY) ?? "";

  const pageRaw = searchParams.get(QUERY_PARAM.PAGE);
  const parsedPage = pageRaw ? parseInt(pageRaw, 10) : 1;
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const pageSizeRaw = searchParams.get(QUERY_PARAM.PAGE_SIZE);
  const parsedPageSize = pageSizeRaw ? parseInt(pageSizeRaw, 10) : 15;
  const pageSize = [15, 30, 50].includes(parsedPageSize) ? parsedPageSize : 15;

  const setParam = useCallback(
    (key: string, value: string | undefined, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === undefined || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          if (resetPage && key !== QUERY_PARAM.PAGE) {
            next.delete(QUERY_PARAM.PAGE);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setStatus = useCallback(
    (newStatus: BackendOrderStatus | undefined) => {
      setParam(QUERY_PARAM.STATUS, newStatus);
    },
    [setParam],
  );

  const setOrderType = useCallback(
    (newType: OrderType | undefined) => {
      setParam(QUERY_PARAM.ORDER_TYPE, newType);
    },
    [setParam],
  );

  const setQuery = useCallback(
    (newQuery: string) => {
      setParam(QUERY_PARAM.QUERY, newQuery);
    },
    [setParam],
  );

  const setPage = useCallback(
    (newPage: number) => {
      setParam(QUERY_PARAM.PAGE, newPage <= 1 ? undefined : String(newPage), false);
    },
    [setParam],
  );

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setParam(QUERY_PARAM.PAGE_SIZE, newPageSize === 15 ? undefined : String(newPageSize), true);
    },
    [setParam],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(QUERY_PARAM.STATUS);
        next.delete(QUERY_PARAM.ORDER_TYPE);
        next.delete(QUERY_PARAM.QUERY);
        next.delete(QUERY_PARAM.PAGE);
        next.delete(QUERY_PARAM.PAGE_SIZE);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return {
    status,
    orderType,
    query,
    page,
    pageSize,
    setStatus,
    setOrderType,
    setQuery,
    setPage,
    setPageSize,
    resetFilters,
  };
}
