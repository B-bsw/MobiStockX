import type { Product } from "../../types/products/types";
import { ProductRow } from "./productRow";

interface ProductsTableProps {
  products: Product[];
  search: string;
}

export function ProductsTable({ products, search }: ProductsTableProps) {
  return (
    <div className="mx-6 overflow-hidden rounded-[20px] border border-[#E5E7EB]">
      <div className="max-h-dvh overflow-y-auto">
        <div className="grid grid-cols-[2fr_1.5fr_1.2fr_0.8fr_0.8fr_0.8fr_1.3fr] items-center border-b bg-[#F8FAFC] px-7 py-4 text-[16px] font-medium text-gray-800">
          <span>สินค้า</span>
          <span>รหัส SKU</span>
          <span>หมวดหมู่</span>
          <span>ราคาขาย</span>
          <span>ต้นทุน</span>
          <span>สต๊อก</span>
          <span className="text-center">จัดการ</span>
        </div>
        {products.length > 0 ? (
          products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))
        ) : (
          <div className="flex h-[200px] items-center justify-center text-[16px] text-gray-500">
            {search.trim() !== ""
              ? "🔍 ไม่พบสินค้าที่ค้นหา"
              : "ไม่พบสินค้าในหมวดหมู่นี้"}
          </div>
        )}
      </div>
    </div>
  );
}
