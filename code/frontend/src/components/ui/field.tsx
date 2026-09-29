import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Every text input and select in the app uses this. 44px tall so it stays a
 * valid touch target on the tablet at the counter.
 */
export const controlClass =
  "h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:border-border-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  /** Rendered below the control, and wired up via aria-describedby by callers. */
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({
  id,
  label,
  required = false,
  error,
  hint,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1 text-sm font-medium text-secondary-foreground"
      >
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only">(จำเป็น)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Native select plus the chevron the browser hides once appearance is reset.
 * Native is deliberate: it gets the OS picker on mobile for free.
 */
export function SelectControl({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(controlClass, "cursor-pointer appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
