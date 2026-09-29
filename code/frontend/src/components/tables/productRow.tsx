import type { ProductModel } from "../../types/products/types";

interface ProductRowProps {
  product: ProductModel;
}

const formatMoney = (value: number) =>
  Number(value ?? 0).toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

export function ProductRow({ product }: ProductRowProps) {
  const spec =
    [product.storageCapacity, product.color]
      .filter((value) => value && value !== "-")
      .join(" · ") || "-";

  return (
    <div className="grid grid-cols-[2fr_1.5fr_1.2fr_0.8fr_0.8fr_0.8fr_1.3fr] items-center border-b border-[#E5E7EB] px-7 py-4">
      <div>
        <p className="text-[16px] text-gray-900">{product.modelName}</p>

        <p className="text-[14px] text-gray-500">{product.brandName}</p>
      </div>

      <span className="text-[16px] text-gray-500">{spec}</span>

      <span className="w-fit rounded-full bg-[#DCEEFF] px-5 py-1 text-[14px] text-[#2580D9]">
        {product.categoryNameTh}
      </span>

      <span className="text-[16px] text-gray-700">
        ฿{formatMoney(product.standardPrice)}
      </span>

      <span className="text-[16px] text-gray-700">
        ฿{formatMoney(product.standardCost)}
      </span>

      <span className="w-fit rounded-full bg-[#DDF6E2] px-5 py-1 text-[14px] text-[#249447]">
        {product.stockQuantity}
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
