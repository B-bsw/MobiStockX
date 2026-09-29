import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertTone = "danger" | "warning" | "success" | "info";

const TONE = {
  danger: { wrap: "bg-danger-bg text-danger", icon: CircleAlert },
  warning: { wrap: "bg-warning-bg text-warning", icon: TriangleAlert },
  success: { wrap: "bg-success-bg text-success", icon: CircleCheck },
  info: { wrap: "bg-info-bg text-info", icon: Info },
} as const;

interface AlertProps {
  tone?: AlertTone;
  children: ReactNode;
  className?: string;
  /**
   * `alert` interrupts a screen reader immediately — use it for failures the
   * user must act on. `status` waits for a pause.
   */
  live?: "alert" | "status";
}

/**
 * Full background tint, no left stripe. The icon carries the meaning for
 * anyone who cannot separate the tints.
 */
export function Alert({
  tone = "danger",
  children,
  className,
  live = "alert",
}: AlertProps) {
  const { wrap, icon: Icon } = TONE[tone];

  return (
    <div
      role={live}
      className={cn(
        "flex items-start gap-2.5 rounded-lg px-4 py-3 text-sm",
        wrap,
        className,
      )}
    >
      <Icon size={18} aria-hidden="true" className="mt-px shrink-0" />
      <span className="min-w-0">{children}</span>
    </div>
  );
}
