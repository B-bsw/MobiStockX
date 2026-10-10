"use client";

import { useEffect, useMemo, useState } from "react";
import { PackageOpen, ScanLine, SearchX } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { itemLabel, matchesIdentifier } from "@/types/pos/types";
import type { PosItem, PosProduct } from "@/types/pos/types";
import { CONDITION_LABEL, type ProductItem } from "@/types/stock/types";

export function toPosItem(item: ProductItem, fallbackPrice: number): PosItem {
  return {
    itemId: item.itemId,
    serialNumber: item.serialNumber,
    imei: item.imei,
    grade: item.grade,
    condition: item.condition,
    batteryHealth: item.batteryHealth,
    price: Number(item.sellingPrice ?? 0) || fallbackPrice,
  };
}

interface PosItemPickerProps {
  product: PosProduct | null;
  pickedItemIds: number[];
  onClose: () => void;
  onPick: (product: PosProduct, item: PosItem) => void;
}

export function PosItemPicker({
  product,
  pickedItemIds,
  onClose,
  onPick,
}: PosItemPickerProps) {
  const [items, setItems] = useState<PosItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const modelId = product?.id ?? null;

  useEffect(() => {
    if (modelId === null) return;

    let active = true;
    const getItems = async () => {
      try {
        setLoading(true);
        setError("");
        setSearch("");

        const response = await api.get(`/products/items/model/${modelId}`, {
          params: { status: "AVAILABLE" },
        });
        const data: ProductItem[] = response.data.data ?? [];

        if (!active) return;
        setItems(data.map((item) => toPosItem(item, product?.price ?? 0)));
      } catch {
        if (active) setError("ไม่สามารถโหลดรายการเครื่องของรุ่นนี้ได้");
      } finally {
        if (active) setLoading(false);
      }
    };

    getItems();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () => (query ? items.filter((item) => matchesIdentifier(item, query)) : items),
    [items, query],
  );

  return (
    <Dialog open={product !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>เลือกเครื่องที่จะขาย</DialogTitle>
          <DialogDescription>
            {product
              ? `${product.name} · ${product.brand} — เลือกตาม Serial Number หรือ IMEI`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <SearchInput
            label="ค้นหา Serial Number หรือ IMEI"
            placeholder="ยิงบาร์โค้ด หรือพิมพ์ S/N หรือ IMEI"
            value={search}
            onValueChange={setSearch}
          />

          {error && (
            <p className="rounded-lg bg-danger-bg px-4 py-2.5 text-sm text-danger">
              {error}
            </p>
          )}

          {loading ? (
            <div className="space-y-2" aria-hidden="true">
              <span className="sr-only" role="status">
                กำลังโหลดรายการเครื่อง
              </span>
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : visible.length > 0 ? (
            <ul className="space-y-2">
              {visible.map((item) => {
                const picked = pickedItemIds.includes(item.itemId);

                return (
                  <li key={item.itemId}>
                    <button
                      type="button"
                      disabled={picked || product === null}
                      onClick={() => product && onPick(product, item)}
                      aria-label={`เลือก ${itemLabel(item)}`}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 text-start transition-colors",
                        "hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        "disabled:cursor-not-allowed disabled:border-border disabled:bg-secondary",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm font-semibold text-foreground">
                          {itemLabel(item)}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {item.condition && (
                            <Badge tone="info">
                              {CONDITION_LABEL[
                                item.condition as keyof typeof CONDITION_LABEL
                              ] ?? item.condition}
                            </Badge>
                          )}
                          {item.grade && <Badge>เกรด {item.grade}</Badge>}
                          {item.batteryHealth !== null && (
                            <Badge tone="neutral">
                              แบต {item.batteryHealth}%
                            </Badge>
                          )}
                          {picked && <Badge tone="warning">อยู่ในตะกร้า</Badge>}
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                        ฿{formatMoney(item.price)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : query ? (
            <EmptyState
              icon={SearchX}
              title="ไม่พบเครื่องที่ค้นหา"
              description={`ไม่มีเครื่องที่ S/N หรือ IMEI ตรงกับ "${search.trim()}" ในรุ่นนี้`}
            />
          ) : (
            <EmptyState
              icon={PackageOpen}
              title="ไม่มีเครื่องพร้อมขายในรุ่นนี้"
              description="ทุกเครื่องถูกขายหรือถูกจองไปแล้ว ไปที่หน้ารับสินค้าเข้าเพื่อเพิ่มเครื่องเข้าคลัง"
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

interface PosScanBoxProps {
  value: string;
  pending: boolean;
  error: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
}

export function PosScanBox({
  value,
  pending,
  error,
  onValueChange,
  onSubmit,
}: PosScanBoxProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="mt-3"
    >
      <label
        htmlFor="pos-scan"
        className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-foreground"
      >
        <ScanLine size={16} aria-hidden="true" />
        ยิง / พิมพ์ Serial Number หรือ IMEI
      </label>
      <div className="flex gap-2">
        <input
          id="pos-scan"
          value={value}
          autoComplete="off"
          inputMode="text"
          placeholder="เช่น 356938035643809"
          aria-invalid={error !== ""}
          aria-describedby={error ? "pos-scan-error" : undefined}
          onChange={(event) => onValueChange(event.target.value)}
          className="h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3.5 font-mono text-sm text-foreground transition-colors placeholder:font-sans placeholder:text-muted-foreground hover:border-border-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/20"
        />
        <Button type="submit" size="touch" disabled={pending || value.trim() === ""}>
          {pending ? "กำลังค้นหา" : "เพิ่ม"}
        </Button>
      </div>
      {error && (
        <p id="pos-scan-error" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
