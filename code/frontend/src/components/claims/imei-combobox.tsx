"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { controlClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { ImeiOption } from "@/types/claims/types";
import type { ProductItem } from "@/types/stock/types";

/*
 * A claim is always raised against a device that already left the shop, so the
 * suggestion list is the SOLD items — anything still AVAILABLE has no warranty
 * to claim against.
 */
export async function fetchClaimableImeis(): Promise<ImeiOption[]> {
  const response = await api.get("/products/items", {
    params: { status: "SOLD", size: 500 },
  });
  const items: ProductItem[] = response.data.data.content ?? [];

  return items
    .filter((item): item is ProductItem & { imei: string } => Boolean(item.imei))
    .map((item) => ({
      itemId: item.itemId,
      imei: item.imei,
      modelName: item.modelName,
      serialNumber: item.serialNumber,
    }));
}

const MAX_VISIBLE = 8;

interface ImeiComboboxProps {
  id: string;
  value: string;
  options: ImeiOption[];
  loading: boolean;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  onValueChange: (value: string) => void;
  /** Fired when a suggestion is committed, so the caller can auto-check warranty. */
  onSelect?: (option: ImeiOption) => void;
}

export function ImeiCombobox({
  id,
  value,
  options,
  loading,
  disabled = false,
  invalid = false,
  describedBy,
  onValueChange,
  onSelect,
}: ImeiComboboxProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = `${id}-listbox`;

  const query = value.trim();
  const matches = useMemo(() => {
    const ranked = query
      ? options.filter(
          (option) =>
            option.imei.includes(query) ||
            (option.serialNumber ?? "").toLowerCase().includes(query.toLowerCase()),
        )
      : options;

    return ranked.slice(0, MAX_VISIBLE);
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function commit(option: ImeiOption) {
    onValueChange(option.imei);
    onSelect?.(option);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (!open) {
        setOpen(true);
        return;
      }
      if (matches.length === 0) return;

      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + matches.length) % matches.length);
      return;
    }

    if (event.key === "Enter" && open && matches[active]) {
      // Don't submit the claim form while a suggestion is highlighted.
      event.preventDefault();
      commit(matches[active]);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  const activeId = open && matches[active] ? `${id}-option-${matches[active].itemId}` : undefined;

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoFocus
        autoComplete="off"
        maxLength={15}
        value={value}
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={cn(controlClass, "font-mono")}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          onValueChange(event.target.value.replace(/\D/g, ""));
          // The list is re-filtered, so the old highlight index is meaningless.
          setActive(0);
          setOpen(true);
        }}
      />

      {open ? (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {loading ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground" role="status">
              กำลังโหลดรายการ IMEI…
            </p>
          ) : matches.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">
              {options.length === 0
                ? "ไม่มี IMEI ของเครื่องที่ขายแล้วในระบบ"
                : `ไม่พบ IMEI ที่ขึ้นต้นด้วย "${query}"`}
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="IMEI ที่เลือกได้" className="max-h-64 overflow-y-auto">
              {matches.map((option, index) => (
                <li
                  key={option.itemId}
                  id={`${id}-option-${option.itemId}`}
                  role="option"
                  aria-selected={index === active}
                  onPointerDown={(event) => {
                    // Commit before the input loses focus and closes the list.
                    event.preventDefault();
                    commit(option);
                  }}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "cursor-pointer px-3 py-2.5 text-sm",
                    index === active ? "bg-secondary" : "bg-card",
                  )}
                >
                  <span className="font-mono font-medium text-foreground">
                    {option.imei}
                  </span>
                  <span className="ms-2 text-muted-foreground">
                    {option.modelName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
