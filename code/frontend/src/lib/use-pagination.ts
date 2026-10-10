"use client";

import { useMemo, useState } from "react";

export const PAGE_SIZES = [10, 25, 50, 100] as const;

export interface Pagination<T> {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  /** 1-based index of the first row on this page; 0 when there are no rows. */
  from: number;
  to: number;
  rows: T[];
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

/**
 * Client-side paging over an already-filtered array. These pages fetch the
 * whole collection in one request, so paging here keeps the filters instant
 * and avoids a round trip per page.
 */
export function usePagination<T>(rows: T[], initialSize = 10): Pagination<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  /*
   * Clamp during render rather than in an effect: filtering can shrink the list
   * below the current page (you are on page 5, then type a keyword), and
   * correcting it here avoids a blank table on the intermediate render.
   */
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;

  const visible = useMemo(
    () => rows.slice(start, start + pageSize),
    [rows, start, pageSize],
  );

  return {
    page: safePage,
    pageSize,
    pageCount,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
    rows: visible,
    setPage: (next) => setPage(Math.min(Math.max(1, next), pageCount)),
    setPageSize: (size) => {
      setPageSize(size);
      setPage(1);
    },
  };
}
