"use client";

import { SearchInput } from "@/components/ui/search-input";
import { Segmented } from "@/components/ui/segmented";

export type StockFilter = "ALL" | "IN_STOCK" | "OUT_OF_STOCK";

export const STOCK_FILTERS: readonly { value: StockFilter; label: string }[] = [
  { value: "ALL", label: "ทุกสถานะสต๊อก" },
  { value: "IN_STOCK", label: "มีสต๊อก" },
  { value: "OUT_OF_STOCK", label: "สต๊อกหมด" },
];

interface ProductsFiltersProps {
  search: string;
  activeCategory: string;
  categories: string[];
  brand: string;
  brands: string[];
  stock: StockFilter;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onBrandChange: (brand: string) => void;
  onStockChange: (stock: StockFilter) => void;
}

export function ProductsFilters({
  search,
  activeCategory,
  categories,
  brand,
  brands,
  stock,
  onSearchChange,
  onCategoryChange,
  onBrandChange,
  onStockChange,
}: ProductsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-3 lg:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <SearchInput
          label="ค้นหาสินค้า"
          placeholder="ค้นหาชื่อรุ่นหรือแบรนด์"
          value={search}
          onValueChange={onSearchChange}
          className="lg:max-w-sm lg:flex-1"
        />
        <Segmented
          label="กรองตามหมวดหมู่"
          value={activeCategory}
          onValueChange={onCategoryChange}
          options={categories.map((category) => ({
            value: category,
            label: category,
          }))}
          className="lg:ml-auto"
        />
      </div>

      {/* Brand list comes from the loaded products, so it can get long: a
          select stays usable where another pill row would not. */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
          แบรนด์
          <select
            value={brand}
            onChange={(event) => onBrandChange(event.target.value)}
            className="h-9 rounded-lg border border-input bg-card px-2 text-sm text-foreground transition-colors hover:border-border-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            {brands.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <Segmented
          label="กรองตามสต๊อก"
          options={STOCK_FILTERS}
          value={stock}
          onValueChange={onStockChange}
        />
      </div>
    </div>
  );
}
