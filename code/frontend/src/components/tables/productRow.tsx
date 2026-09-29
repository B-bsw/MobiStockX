import type { Product } from "../../types/products/types";

interface ProductRowProps {
  product: Product;
}

export function ProductRow({ product }: ProductRowProps) {
  return (
    <div className="grid grid-cols-[2fr_1.5fr_1.2fr_0.8fr_0.8fr_0.8fr_1.3fr] items-center border-b border-[#E5E7EB] px-7 py-4">
      <div>
        <p className="text-[16px] text-gray-900">{product.name}</p>

        <p className="text-[14px] text-gray-500">
          {product.brand} · {product.model}
        </p>
      </div>

      <span className="text-[16px] text-gray-500">{product.sku}</span>

      <span className="w-fit rounded-full bg-[#DCEEFF] px-5 py-1 text-[14px] text-[#2580D9]">
        {product.category}
      </span>

      <span className="text-[16px] text-gray-700">฿{product.price}</span>

      <span className="text-[16px] text-gray-700">฿{product.cost}</span>

      <span className="w-fit rounded-full bg-[#DDF6E2] px-5 py-1 text-[14px] text-[#249447]">
        {product.stock}
      </span>

      <div className="flex gap-2">
        <button className="rounded-full bg-[#DCEEFF] px-5 py-1 text-[14px] text-[#2580D9]">
          แก้ไข
        </button>

        <button className="rounded-full bg-[#FFE4E4] px-5 py-1 text-[14px] text-[#E53935]">
          ลบ
        </button>
      </div>
    </div>
  );
}
