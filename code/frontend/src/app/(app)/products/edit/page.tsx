"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  EMPTY_PRODUCT_FORM,
  ProductForm,
  type ProductFormValues,
} from "@/components/products/product-form";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import type { Brand, Category } from "@/types/products/types";

function EditProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelId = searchParams.get("id");

  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);
  const [isSerialized, setIsSerialized] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      if (!modelId) {
        setError("ไม่พบรหัสสินค้าที่ต้องการแก้ไข กลับไปเลือกสินค้าจากรายการอีกครั้ง");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [productRes, brandRes, categoryRes] = await Promise.all([
          api.get(`/products/models/${modelId}`),
          api.get("/brands"),
          api.get("/categories"),
        ]);

        const product = productRes.data.data;

        setValues({
          name: product.modelName ?? "",
          brandId: String(product.brandId ?? ""),
          categoryId: String(product.categoryId ?? ""),
          color: product.color ?? "",
          storage: product.storageCapacity ?? "",
          warranty: String(product.modelWarrantyDuration ?? 12),
          price: String(product.standardPrice ?? ""),
          cost: String(product.standardCost ?? ""),
        });
        setIsSerialized(product.isSerialized ?? true);

        setBrands(brandRes.data.data ?? []);
        setCategories(categoryRes.data.data ?? []);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [modelId]);

  const change = <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => setValues((prev) => ({ ...prev, [field]: value }));

  const submit = async () => {
    if (!modelId) return;

    try {
      setSaving(true);
      setError("");

      await api.put(`/products/models/${modelId}`, {
        modelName: values.name.trim(),
        color: values.color.trim() || null,
        storageCapacity: values.storage.trim() || null,
        modelWarrantyDuration: Number(values.warranty) || 12,
        isSerialized,
        standardCost: Number(values.cost),
        standardPrice: Number(values.price),
        imageUrl: null,
        brandId: Number(values.brandId),
        categoryId: Number(values.categoryId),
      });

      router.push("/products");
    } catch {
      setError("บันทึกการแก้ไขไม่สำเร็จ กรุณาตรวจสอบข้อมูลและลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProductForm
      title="แก้ไขสินค้า"
      description="แก้ไขข้อมูลสินค้าในระบบคลังสินค้า"
      submitLabel="บันทึกการแก้ไข"
      values={values}
      onChange={change}
      brands={brands}
      categories={categories}
      saving={saving}
      loading={loading}
      error={error}
      onValid={submit}
      onCancel={() => router.push("/products")}
    />
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <Panel className="overflow-hidden">
          <div className="border-b px-4 py-5 sm:px-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="mt-2 h-4 w-52" />
          </div>
          <div className="space-y-4 px-4 py-6 sm:px-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index}>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-11 w-full" />
              </div>
            ))}
          </div>
        </Panel>
      }
    >
      <EditProductForm />
    </Suspense>
  );
}
