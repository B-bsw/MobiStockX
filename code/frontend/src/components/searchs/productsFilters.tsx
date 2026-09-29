"use client";

import { SearchInput } from "@/components/ui/search-input";
import { Segmented } from "@/components/ui/segmented";

interface ProductsFiltersProps {
  search: string;
  activeCategory: string;
  categories: string[];
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
}

export function ProductsFilters({
  search,
  activeCategory,
  categories,
  onSearchChange,
  onCategoryChange,
}: ProductsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:gap-4 lg:px-6">
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
  );
}
