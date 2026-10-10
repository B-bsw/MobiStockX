"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  ProductsFilters,
  type StockFilter,
} from "@/components/searchs/productsFilters";
import { ProductsHeader } from "@/components/headers/productsHeader";
import { ProductsTable } from "@/components/tables/productsTable";
import { Alert } from "@/components/ui/alert";
import { Pagination } from "@/components/ui/pagination";
import { Panel } from "@/components/ui/panel";
import { usePagination } from "@/lib/use-pagination";
import type { Category, ProductModel } from "@/types/products/types";

export default function Page() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("ทั้งหมด");
  const [stock, setStock] = useState<StockFilter>("ALL");
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

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
    try {
      setDeletingId(product.modelId);
      setError("");

      await api.delete(`/products/models/${product.modelId}`);

      setProducts((prev) =>
        prev.filter((item) => item.modelId !== product.modelId),
      );
      setConfirmId(null);
    } catch {
      setError("ลบสินค้าไม่สำเร็จ สินค้านี้อาจถูกใช้งานอยู่ในระบบ");
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const keyword = search.toLowerCase();
    const quantity = Number(product.stockQuantity ?? 0);

    const matchSearch =
      product.modelName.toLowerCase().includes(keyword) ||
      (product.brandName ?? "").toLowerCase().includes(keyword);

    const matchCategory =
      activeCategory === "ทั้งหมด" || product.categoryNameTh === activeCategory;

    const matchBrand = brand === "ทั้งหมด" || product.brandName === brand;

    const matchStock =
      stock === "ALL" ||
      (stock === "IN_STOCK" ? quantity > 0 : quantity === 0);

    return matchSearch && matchCategory && matchBrand && matchStock;
  });

  const paged = usePagination(filteredProducts);

  const categoryTabs = ["ทั้งหมด", ...categories.map((c) => c.categoryNameTh)];

  const brandNames = [
    ...new Set(products.map((product) => product.brandName).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "th"));

  return (
    <Panel className="overflow-hidden">
      <ProductsHeader
        totalProducts={products.length}
        onAdd={() => router.push("/products/add")}
      />
      <ProductsFilters
        search={search}
        activeCategory={activeCategory}
        categories={categoryTabs}
        brand={brand}
        brands={brandNames}
        stock={stock}
        onSearchChange={setSearch}
        onCategoryChange={setActiveCategory}
        onBrandChange={setBrand}
        onStockChange={setStock}
      />

      {error !== "" && products.length > 0 ? (
        <div className="px-4 pt-4 sm:px-6">
          <Alert tone="danger">{error}</Alert>
        </div>
      ) : null}

      <ProductsTable
        products={paged.rows}
        search={search}
        loading={loading}
        error={products.length === 0 ? error : ""}
        actions={{
          deletingId,
          confirmId,
          onEdit: (product) =>
            router.push(`/products/edit?id=${product.modelId}`),
          onRequestDelete: (product) => setConfirmId(product.modelId),
          onConfirmDelete: handleDelete,
          onCancelDelete: () => setConfirmId(null),
        }}
      />

      {!loading && filteredProducts.length > 0 ? (
        <Pagination
          page={paged.page}
          pageCount={paged.pageCount}
          pageSize={paged.pageSize}
          total={paged.total}
          from={paged.from}
          to={paged.to}
          unit="รายการ"
          onPageChange={paged.setPage}
          onPageSizeChange={paged.setPageSize}
        />
      ) : null}
    </Panel>
  );
}
