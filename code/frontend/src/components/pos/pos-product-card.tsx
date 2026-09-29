import type { PosProduct } from "@/types/pos/types";

interface PosProductCardProps {
  product: PosProduct;
  remaining: number;
  onAdd: (product: PosProduct) => void;
}

export function PosProductCard({ product, remaining, onAdd }: PosProductCardProps) {
  return (
    <button
      type="button"
      disabled={remaining === 0}
      onClick={() => onAdd(product)}
      aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
      className="rounded-[26px] border border-[#EBEBEB] bg-white px-6 py-[18px] text-left transition hover:border-[#7FBFFF] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-[#7FBFFF] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <p className="text-[17px] font-medium text-black">{product.name}</p>
      <p className="text-[14px] text-[#808080]">{product.brand} · {product.model}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[17px] text-black">{product.price.toLocaleString("th-TH")}</span>
        <span className="text-[15px] text-[#808080]">เหลือ {remaining}</span>
      </div>
    </button>
  );
}
