"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardField, CardFields } from "@/components/ui/data-table";
import { formatMoney } from "@/lib/format";
import type { ProductModel } from "@/types/products/types";

export interface ProductRowActions {
  deletingId: number | null;
  /** Row currently asking "are you sure?" inline instead of via window.confirm. */
  confirmId: number | null;
  onEdit?: (product: ProductModel) => void;
  onRequestDelete: (product: ProductModel) => void;
  onConfirmDelete: (product: ProductModel) => void;
  onCancelDelete: () => void;
}

export function productSpec(product: ProductModel) {
  return (
    [product.storageCapacity, product.color]
      .filter((value) => value && value !== "-")
      .join(" · ") || "—"
  );
}

/**
 * Two-step delete kept in the row. A modal for one destructive row action is
 * more ceremony than the decision needs, and window.confirm cannot be styled
 * or translated consistently.
 */
export function ProductActions({
  product,
  actions,
  className,
}: {
  product: ProductModel;
  actions: ProductRowActions;
  className?: string;
}) {
  const deleting = actions.deletingId === product.modelId;
  const confirming = actions.confirmId === product.modelId;

  if (confirming) {
    return (
      <div className={className}>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            size="sm"
            variant="destructive"
            disabled={deleting}
            onClick={() => actions.onConfirmDelete(product)}
          >
            {deleting ? "กำลังลบ…" : "ยืนยันลบ"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={deleting}
            onClick={actions.onCancelDelete}
          >
            ยกเลิก
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-end gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          title="แก้ไข"
          aria-label={`แก้ไข ${product.modelName}`}
          className="text-muted-foreground hover:bg-[#DCEEFF] hover:text-[#2580D9]"
          onClick={() => actions.onEdit?.(product)}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          title="ลบ"
          aria-label={`ลบ ${product.modelName}`}
          className="text-muted-foreground hover:bg-danger-bg hover:text-danger"
          onClick={() => actions.onRequestDelete(product)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export function ProductMobileCard({
  product,
  actions,
}: {
  product: ProductModel;
  actions: ProductRowActions;
}) {
  const quantity = Number(product.stockQuantity ?? 0);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {product.modelName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {product.brandName} · {productSpec(product)}
          </p>
        </div>
        <Badge tone={quantity === 0 ? "danger" : quantity <= 3 ? "warning" : "success"}>
          {quantity === 0 ? "หมด" : `สต๊อก ${quantity}`}
        </Badge>
      </div>

      <CardFields>
        <CardField label="หมวดหมู่">{product.categoryNameTh}</CardField>
        <CardField label="ราคาขาย">฿{formatMoney(product.standardPrice)}</CardField>
        <CardField label="ต้นทุน">฿{formatMoney(product.standardCost)}</CardField>
      </CardFields>

      <ProductActions product={product} actions={actions} className="mt-3" />
    </div>
  );
}
