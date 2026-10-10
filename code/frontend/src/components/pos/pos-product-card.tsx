import { ScanLine } from "lucide-react";
import { ProductImage } from "@/components/products/product-image";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PosProduct } from "@/types/pos/types";

interface PosProductCardProps {
  product: PosProduct;
  remaining: number;
  onAdd: (product: PosProduct) => void;
}

export function PosProductCard({
  product,
  remaining,
  onAdd,
}: PosProductCardProps) {
  const soldOut = remaining === 0;
  const perUnit = product.isSerialized;

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => onAdd(product)}
      aria-label={
        perUnit
          ? `เลือกเครื่อง ${product.name} ตาม Serial Number หรือ IMEI เหลือ ${remaining} เครื่อง`
          : `เพิ่ม ${product.name} ลงตะกร้า เหลือ ${remaining} เครื่อง`
      }
      className={cn(
        "flex min-h-[7rem] flex-col justify-between gap-2 rounded-xl border border-border bg-card p-4 text-start transition-[border-color,box-shadow,transform] duration-150",
        "hover:border-primary hover:shadow-[0_1px_2px_oklch(0.26_0.018_250/0.06),0_8px_20px_-14px_oklch(0.53_0.145_250/0.4)]",
        "active:translate-y-px",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:border-border disabled:bg-secondary disabled:shadow-none",
      )}
    >
      <div className="flex min-w-0 gap-3">
        <ProductImage
          url={product.imageUrl}
          name={product.name}
          className={cn("size-14", soldOut && "opacity-60")}
          iconSize={22}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {product.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {product.brand} · {product.model}
          </p>
          {perUnit && !soldOut && (
            <p className="mt-1 flex items-center gap-1 text-xs text-primary">
              <ScanLine size={12} aria-hidden="true" />
              เลือกตาม S/N หรือ IMEI
            </p>
          )}
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-base font-semibold tabular-nums text-foreground">
          ฿{formatMoney(product.price)}
        </span>
        <span
          className={cn(
            "text-xs tabular-nums",
            soldOut ? "font-medium text-danger" : "text-muted-foreground",
          )}
        >
          {soldOut ? "หมด" : `เหลือ ${remaining}`}
        </span>
      </div>
    </button>
  );
}
