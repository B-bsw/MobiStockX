"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  controls?: string;
  className?: string;
}


export function Switch({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  controls,
  className,
}: SwitchProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        aria-controls={controls}
        aria-expanded={controls ? checked : undefined}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer h-[26px] w-[46px] shrink-0 cursor-pointer appearance-none rounded-full bg-[#DCDCDC] transition-colors duration-150 checked:bg-[#2495FF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2495FF] disabled:cursor-not-allowed disabled:opacity-50"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[3px] top-[3px] size-5 rounded-full bg-white shadow-sm transition-transform duration-150 peer-checked:translate-x-5"
      />
    </span>
  );
}
