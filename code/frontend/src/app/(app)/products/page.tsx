"use client";

import { useState } from "react";
import { ProductsFilters } from "@/components/searchs/productsFilters";
import { ProductsHeader } from "@/components/headers/productsHeader";
import { ProductsTable } from "@/components/tables/productsTable";
import { products } from "@/datas/product/data";
import type { ProductCategoryFilter } from "@/types/products/types";

export default function Page() {
  const [activeCategory, setActiveCategory] =
    useState<ProductCategoryFilter>("ทั้งหมด");
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "ทั้งหมด" || product.category === activeCategory;

    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-[#dae8ff] p-6">
      <div className="min-h-[calc(100vh-48px)] rounded-[20px] bg-white shadow-md">
        <ProductsHeader totalProducts={products.length} />
        <ProductsFilters
          search={search}
          activeCategory={activeCategory}
          onSearchChange={setSearch}
          onCategoryChange={setActiveCategory}
        />
        <ProductsTable products={filteredProducts} search={search} />
      </div>
    </div>
  );
}
