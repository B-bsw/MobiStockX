"use client";

import { useId } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** Visually hidden when the placeholder already carries the meaning. */
  label: string;
  className?: string;
}

/**
 * Replaces the five hand-rolled search fields that each used a 🔍 emoji and a
 * different height. One control, one icon, one focus treatment.
 */
export function SearchInput({
  value,
  onValueChange,
  placeholder,
  label,
  className,
}: SearchInputProps) {
  const id = useId();

  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onValueChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-input bg-card pl-11 pr-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:border-border-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 [&::-webkit-search-cancel-button]:hidden"
        />
        {value !== "" ? (
          <button
            type="button"
            onClick={() => onValueChange("")}
            aria-label={`ล้างคำค้นหา ${label}`}
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
