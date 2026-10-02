"use client";

import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onValueChange: (value: T) => void;
  /** Names the group for screen readers, e.g. "กรองตามสถานะ". */
  label: string;
  className?: string;
}

/**
 * Pill filter group. Scrolls sideways instead of wrapping into a second row,
 * which is what the old fixed-width version did once categories grew.
 */
export function Segmented<T extends string>({
  options,
  value,
  onValueChange,
  label,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "-mx-1 flex min-w-0 shrink-0 items-center gap-1 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "h-9 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-150",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
