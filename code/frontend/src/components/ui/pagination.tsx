"use client";

import { useId } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGE_SIZES } from "@/lib/use-pagination";
import { cn } from "@/lib/utils";

/**
 * Page numbers with ellipses, always the same width so the control doesn't
 * jump around as you move through the pages: 1 … 4 [5] 6 … 20
 */
function pageList(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const around = [page - 1, page, page + 1].filter(
    (candidate) => candidate > 1 && candidate < pageCount,
  );
  const pages = [1, ...around, pageCount];
  const result: (number | "gap")[] = [];

  pages.forEach((current, index) => {
    const previous = pages[index - 1];
    if (previous !== undefined && current - previous > 1) result.push("gap");
    result.push(current);
  });

  return result;
}

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  from: number;
  to: number;
  /** Noun for the summary line, e.g. "ลูกค้า" → "1–10 จาก 34 ลูกค้า". */
  unit: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  total,
  from,
  to,
  unit,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const sizeId = useId();

  // One page of results needs no controls, but the count is still useful.
  const showControls = pageCount > 1;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground" role="status">
          {total === 0
            ? `ไม่มี${unit}`
            : `${from}–${to} จาก ${total} ${unit}`}
        </p>

        {total > PAGE_SIZES[0] ? (
          <div className="flex items-center gap-1.5">
            <label htmlFor={sizeId} className="text-sm text-muted-foreground">
              แสดง
            </label>
            <select
              id={sizeId}
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-9 rounded-lg border border-input bg-card px-2 text-sm text-foreground transition-colors hover:border-border-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {showControls ? (
        <nav aria-label="เปลี่ยนหน้า" className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={page <= 1}
            aria-label="หน้าก่อนหน้า"
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>

          {pageList(page, pageCount).map((entry, index) =>
            entry === "gap" ? (
              <span
                key={`gap-${index}`}
                aria-hidden="true"
                className="px-1 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={entry}
                type="button"
                size="icon-sm"
                variant={entry === page ? "default" : "ghost"}
                aria-label={`หน้า ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                onClick={() => onPageChange(entry)}
                className="tabular-nums"
              >
                {entry}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={page >= pageCount}
            aria-label="หน้าถัดไป"
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      ) : null}
    </div>
  );
}
