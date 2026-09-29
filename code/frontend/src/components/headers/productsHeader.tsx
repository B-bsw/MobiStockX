interface ProductsHeaderProps {
  totalProducts: number;
  onAdd?: () => void;
}

export function ProductsHeader({ totalProducts, onAdd }: ProductsHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#EBEBEB] px-10 py-5">
      <div>
        <h1 className="text-[24px] font-medium text-gray-900">สินค้า</h1>
        <p className="text-[14px] text-gray-600">
          มีสินค้าทั้งหมด {totalProducts} รายการ
        </p>
      </div>

      <button
        onClick={onAdd}
        className="rounded-full bg-[#7FBFFF] px-7 py-2 text-[20px] text-white"
      >
        + เพิ่มสินค้า
      </button>
    </div>
  );
}
