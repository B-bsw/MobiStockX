import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "start" | "end" | "center";
  /** Applied to both the `th` and every `td`, e.g. "hidden xl:table-cell". */
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  /**
   * Below `lg` the table is replaced by this, one call per row. Squeezing six
   * columns into 375px is not responsive, it is just unreadable.
   */
  mobileCard: (row: T) => ReactNode;
  /** Describes the table for screen readers. Not shown. */
  caption: string;
  loading?: boolean;
  error?: string;
  empty?: ReactNode;
  skeletonRows?: number;
  /** Width at which the desktop table starts scrolling sideways instead of crushing. */
  minWidthClass?: string;
  maxHeightClass?: string;
  className?: string;
}

const ALIGN = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
} as const;

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  mobileCard,
  caption,
  loading = false,
  error = "",
  empty,
  skeletonRows = 6,
  minWidthClass = "min-w-[56rem]",
  maxHeightClass,
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn("px-4 py-4 sm:px-6", className)}>
        <span className="sr-only" role="status">
          กำลังโหลดข้อมูล
        </span>
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: skeletonRows }, (_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-4 flex-[2]" />
              <Skeleton className="hidden h-4 flex-1 sm:block" />
              <Skeleton className="hidden h-4 flex-1 md:block" />
              <Skeleton className="h-4 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error !== "") {
    return (
      <div className={cn("px-4 py-4 sm:px-6", className)}>
        <Alert tone="danger">{error}</Alert>
      </div>
    );
  }

  if (rows.length === 0) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div className={className}>
      {/* Desktop: a real table, so column alignment and copy/paste behave.
          One scroll container for both axes — nesting overflow-x inside
          overflow-y would make the inner box the sticky ancestor, and the
          header would never stick. border-separate keeps the th borders
          painted while the header is stuck. */}
      <div className={cn("hidden overflow-auto lg:block", maxHeightClass)}>
        <table
          className={cn(
            "w-full border-separate border-spacing-0 text-start",
            minWidthClass,
          )}
        >
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 z-[var(--z-sticky)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "border-b bg-muted px-4 py-3 text-sm font-semibold text-secondary-foreground first:pl-6 last:pr-6",
                    ALIGN[column.align ?? "start"],
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="group/row">
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "border-b px-4 py-3 align-middle text-sm text-foreground transition-colors first:pl-6 last:pr-6 group-last/row:border-b-0 group-hover/row:bg-secondary/60",
                      ALIGN[column.align ?? "start"],
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per record. */}
      <ul
        className={cn(
          "divide-y lg:hidden",
          maxHeightClass && "overflow-y-auto",
          maxHeightClass,
        )}
      >
        {rows.map((row) => (
          <li key={rowKey(row)} className="px-4 py-4">
            {mobileCard(row)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Label/value pair for the mobile card layout. */
export function CardField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm tabular-nums text-foreground">
        {children}
      </dd>
    </div>
  );
}

/** Grid of CardFields. Two columns is the most 375px comfortably holds. */
export function CardFields({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <dl className={cn("mt-3 grid grid-cols-2 gap-x-4 gap-y-3", className)}>
      {children}
    </dl>
  );
}
