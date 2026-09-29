import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one content surface. Pages put a single Panel on the tinted page
 * background; sections inside it are separated by rules, not by more panels.
 * Nesting a Panel in a Panel is always a mistake.
 */
function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="panel"
      className={cn(
        "rounded-2xl border bg-card shadow-[0_1px_2px_oklch(0.26_0.018_250/0.05),0_10px_30px_-18px_oklch(0.26_0.018_250/0.18)]",
        className,
      )}
      {...props}
    />
  );
}

interface PanelHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Primary action(s). Wraps below the title on narrow screens. */
  actions?: ReactNode;
  className?: string;
}

function PanelHeader({
  title,
  description,
  actions,
  className,
}: PanelHeaderProps) {
  return (
    <div
      data-slot="panel-header"
      className={cn(
        "flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

/** A titled region inside a Panel. Separated by a rule, never by a border box. */
function PanelSection({
  title,
  description,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b px-4 py-5 last:border-b-0 sm:px-6", className)}>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export { Panel, PanelHeader, PanelSection };
