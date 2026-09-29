"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ProductsFilters } from "@/components/searchs/productsFilters";
import { ProductsHeader } from "@/components/headers/productsHeader";
import { ProductsTable } from "@/components/tables/productsTable";
import type { Category, ProductModel } from "@/types/products/types";

export default function Page() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productRes, categoryRes] = await Promise.all([
          api.get("/products/models", { params: { size: 100 } }),
          api.get("/categories"),
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

  const handleDelete = async (product: ProductModel) => {
    const confirmed = window.confirm(
      `ต้องการลบ ${product.modelName} ใช่หรือไม่?`,
    );
    if (!confirmed) return;

    try {
      setDeletingId(product.modelId);
      setError("");

      await api.delete(`/products/models/${product.modelId}`);

      setProducts((prev) =>
        prev.filter((item) => item.modelId !== product.modelId),
      );
    } catch {
      setError("ลบสินค้าไม่สำเร็จ สินค้านี้อาจถูกใช้งานอยู่ในระบบ");
    } finally {
      setDeletingId(null);
    }
  };

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
      <ProductsHeader
        totalProducts={products.length}
        onAdd={() => router.push("/products/add")}
      />
      <ProductsFilters
        search={search}
        activeCategory={activeCategory}
        categories={categoryTabs}
        onSearchChange={setSearch}
        onCategoryChange={setActiveCategory}
      />

      {error && products.length > 0 && (
        <div className="mx-6 mb-4 rounded-[20px] bg-[#FFE4E4] px-7 py-3 text-[16px] text-[#E53935]">
          {error}
        </div>
      )}

      <ProductsTable
        products={filteredProducts}
        search={search}
        loading={loading}
        error={products.length === 0 ? error : ""}
        deletingId={deletingId}
        onEdit={(product) =>
          router.push(`/products/edit?id=${product.modelId}`)
        }
        onDelete={handleDelete}
      />
    </div>
  );
}
