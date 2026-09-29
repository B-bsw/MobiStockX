import { Search } from "lucide-react";
import { productCategories } from "../../datas/product/data";
import type { ProductCategoryFilter } from "../../types/products/types";

interface ProductsFiltersProps {
  search: string;
  activeCategory: ProductCategoryFilter;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: ProductCategoryFilter) => void;
}

export function ProductsFilters({
  search,
  activeCategory,
  onSearchChange,
  onCategoryChange,
}: ProductsFiltersProps) {
  return (
    <div className="flex items-center gap-5 px-10 py-4">
      <div className="flex h-[45px] flex-1 items-center rounded-full border border-[#EBEBEB] px-6">
        <span className="text-[20px] text-gray-500">
          <Search size={20}/>
        </span>
        <input
          type="text"
          placeholder="ค้นหาสินค้า"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="ml-4 flex-1 bg-transparent text-[16px] outline-none placeholder:text-gray-300"
        />
      </div>
      <div className="flex h-[45px] items-center rounded-full border border-[#E5E7EB] px-2">
        {productCategories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`rounded-full px-8 py-1 text-[18px] transition-all duration-300 ${
              activeCategory === category
                ? "bg-[#78B8F2] text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
