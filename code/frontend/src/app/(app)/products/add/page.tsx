"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  EMPTY_PRODUCT_FORM,
  ProductForm,
  type ProductFormValues,
} from "@/components/products/product-form";
import type { Brand, Category } from "@/types/products/types";

export default function AddProductPage() {
  const router = useRouter();

  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getOptions = async () => {
      try {
        const [brandRes, categoryRes] = await Promise.all([
          api.get("/brands"),
          api.get("/categories"),
        ]);

        setBrands(brandRes.data.data ?? []);
        setCategories(categoryRes.data.data ?? []);
      } catch {
        setError("ไม่สามารถโหลดแบรนด์และหมวดหมู่ได้ ลองรีเฟรชหน้านี้อีกครั้ง");
      }
    };

    getOptions();
  }, []);

  const change = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => setValues((prev) => ({ ...prev, [field]: value }));

  const submit = async () => {
    try {
      setSaving(true);
      setError("");

      await api.post("/products/models", {
        modelName: values.name.trim(),
        color: values.color.trim() || null,
        storageCapacity: values.storage.trim() || null,
        modelWarrantyDuration: Number(values.warranty) || 12,
        isSerialized: true,
        standardCost: Number(values.cost),
        standardPrice: Number(values.price),
        imageUrl: null,
        brandId: Number(values.brandId),
        categoryId: Number(values.categoryId),
      });

      router.push("/products");
    } catch {
      setError("เพิ่มสินค้าไม่สำเร็จ กรุณาตรวจสอบข้อมูลและลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProductForm
      title="เพิ่มสินค้าใหม่"
      description="เพิ่มโทรศัพท์มือถือเข้าสู่ระบบคลังสินค้า"
      submitLabel="เพิ่มสินค้า"
      values={values}
      onChange={change}
      brands={brands}
      categories={categories}
      saving={saving}
      error={error}
      onValid={submit}
      onCancel={() => router.push("/products")}
    />
  );
}
