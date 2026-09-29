import { PackageOpen, SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import type { CartItem, PosProduct } from "@/types/pos/types";
import { PosProductCard } from "./pos-product-card";

interface PosCatalogProps {
  products: PosProduct[];
  items: CartItem[];
  search: string;
  loading?: boolean;
  onSearchChange: (value: string) => void;
  onAdd: (product: PosProduct) => void;
}

export function PosCatalog({
  products,
  items,
  search,
  loading = false,
  onSearchChange,
  onAdd,
}: PosCatalogProps) {
  const searching = search.trim() !== "";

  return (
    <section
      className="min-w-0 bg-background px-4 py-4 sm:px-6"
      aria-label="รายการสินค้าสำหรับขาย"
    >
      <SearchInput
        label="ค้นหาสินค้าเพื่อขาย"
        placeholder="ค้นหาชื่อรุ่น แบรนด์ หรือสเปก"
        value={search}
        onValueChange={onSearchChange}
      />

      {loading ? (
        <div
          className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3"
          aria-hidden="true"
        >
          <span className="sr-only" role="status">
            กำลังโหลดสินค้า
          </span>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        /* auto-fill keeps the tile size honest from 375px to a 27" counter
           display without a single breakpoint. */
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3">
          {products.map((product) => (
            <PosProductCard
              key={product.id}
              product={product}
              remaining={
                product.stock -
                (items.find((item) => item.product.id === product.id)
                  ?.quantity ?? 0)
              }
              onAdd={onAdd}
            />
          ))}
        </div>
      ) : searching ? (
        <EmptyState
          icon={SearchX}
          title="ไม่พบสินค้าที่ค้นหา"
          description={`ไม่มีรุ่นที่ตรงกับ "${search.trim()}" ในสินค้าที่มีสต๊อกพร้อมขาย`}
        />
      ) : (
        <EmptyState
          icon={PackageOpen}
          title="ไม่มีสินค้าที่พร้อมขาย"
          description="ทุกรุ่นสต๊อกหมด ไปที่หน้ารับสินค้าเข้าเพื่อเพิ่มเครื่องเข้าคลังก่อน"
        />
      )}
    </section>
  );
}
