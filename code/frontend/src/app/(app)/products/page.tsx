"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ProductsFilters } from "@/components/searchs/productsFilters";
import { ProductsHeader } from "@/components/headers/productsHeader";
import { ProductsTable } from "@/components/tables/productsTable";
import type { Category, ProductModel } from "@/types/products/types";

export default function Page() {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productRes, categoryRes] = await Promise.all([
          axios.get("/api/v1/products/models", { params: { size: 100 } }),
          axios.get("/api/v1/categories"),
        ]);

        setProducts(productRes.data.data.content ?? []);
        setCategories(categoryRes.data.data ?? []);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      product.modelName.toLowerCase().includes(keyword) ||
      (product.brandName ?? "").toLowerCase().includes(keyword);

    const matchCategory =
      activeCategory === "ทั้งหมด" || product.categoryNameTh === activeCategory;

    return matchSearch && matchCategory;
  });

  const categoryTabs = ["ทั้งหมด", ...categories.map((c) => c.categoryNameTh)];

  return (
    <div className="min-h-[calc(100vh-48px)] rounded-[20px] bg-white shadow-md">
      <ProductsHeader totalProducts={products.length} />
      <ProductsFilters
        search={search}
        activeCategory={activeCategory}
        categories={categoryTabs}
        onSearchChange={setSearch}
        onCategoryChange={setActiveCategory}
      />
      <ProductsTable
        products={filteredProducts}
        search={search}
        loading={loading}
        error={error}
      />
    </div>
  );
}
