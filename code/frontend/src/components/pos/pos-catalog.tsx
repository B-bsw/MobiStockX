import { Search } from "lucide-react";
import type { CartItem, PosProduct } from "@/types/pos/types";
import { PosProductCard } from "./pos-product-card";

interface PosCatalogProps {
  products: PosProduct[];
  items: CartItem[];
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: (product: PosProduct) => void;
}

export function PosCatalog({ products, items, search, onSearchChange, onAdd }: PosCatalogProps) {
  return (
    <section className="min-w-0 bg-[#F8F9FB] px-6 py-7 xl:px-7" aria-label="รายการสินค้าสำหรับขาย">
      <div className="flex h-[55px] items-center gap-4 rounded-full border border-[#EBEBEB] bg-white px-7">
        <Search size={24} className="shrink-0 text-[#909090]" aria-hidden="true" />
        <input
          type="search"
          aria-label="ค้นหาสินค้า"
          placeholder="ค้นหาสินค้า"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[20px] text-gray-900 outline-none placeholder:text-[#CACACA]"
        />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-x-5">
        {products.map((product) => (
          <PosProductCard
            key={product.id}
            product={product}
            remaining={product.stock - (items.find((item) => item.product.id === product.id)?.quantity ?? 0)}
            onAdd={onAdd}
          />
        ))}
      </div>
      {products.length === 0 && <p className="py-16 text-center text-gray-500">ไม่พบสินค้าที่ค้นหา</p>}
    </section>
  );
}
