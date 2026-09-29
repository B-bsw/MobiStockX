"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

interface Category {
  categoryId: number;
  categoryNameTh: string;
}

interface Brand {
  brandId: number;
  brandName: string;
}

function EditProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modelId = searchParams.get("id");

  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [color, setColor] = useState("");
  const [storage, setStorage] = useState("");
  const [warranty, setWarranty] = useState("12");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [isSerialized, setIsSerialized] = useState(true);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const brandRef = useRef<HTMLSelectElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);

  const scrollToField = (
    ref: React.RefObject<HTMLInputElement | HTMLSelectElement | null>,
  ) => {
    const field = ref.current;
    if (!field) return;

    field.focus({ preventScroll: true });

    const container = field.closest(".overflow-y-auto") as HTMLElement | null;

    if (container) {
      const fieldPosition = field.getBoundingClientRect();
      const containerPosition = container.getBoundingClientRect();

      container.scrollTo({
        top:
          container.scrollTop +
          (fieldPosition.top - containerPosition.top) -
          300,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const getData = async () => {
      if (!modelId) {
        setError("ไม่พบรหัสสินค้าที่ต้องการแก้ไข");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [productRes, brandRes, categoryRes] = await Promise.all([
          axios.get(`/api/v1/products/models/${modelId}`),
          axios.get("/api/v1/brands"),
          axios.get("/api/v1/categories"),
        ]);

        const product = productRes.data.data;

        setName(product.modelName ?? "");
        setBrandId(String(product.brandId ?? ""));
        setCategoryId(String(product.categoryId ?? ""));
        setColor(product.color ?? "");
        setStorage(product.storageCapacity ?? "");
        setWarranty(String(product.modelWarrantyDuration ?? 12));
        setPrice(String(product.standardPrice ?? ""));
        setCost(String(product.standardCost ?? ""));
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

  const handleSubmit = async () => {
    setSubmitted(true);
    setError("");

    if (!name) {
      scrollToField(nameRef);
      return;
    }

    if (!brandId) {
      scrollToField(brandRef);
      return;
    }

    if (!categoryId) {
      scrollToField(categoryRef);
      return;
    }

    if (!price) {
      scrollToField(priceRef);
      return;
    }

    if (!cost) {
      scrollToField(costRef);
      return;
    }

    try {
      setSaving(true);

      await axios.put(`/api/v1/products/models/${modelId}`, {
        modelName: name,
        color: color || null,
        storageCapacity: storage || null,
        modelWarrantyDuration: Number(warranty) || 12,
        isSerialized,
        standardCost: Number(cost),
        standardPrice: Number(price),
        imageUrl: null,
        brandId: Number(brandId),
        categoryId: Number(categoryId),
      });

      router.push("/products");
    } catch {
      setError("บันทึกการแก้ไขไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (invalid: boolean) =>
    `h-[52px] w-full rounded-full border px-6 text-[16px] text-black outline-none focus:border-[#7FBFFF] ${
      invalid ? "border-red-500" : "border-[#E5E7EB] focus:border-[#7FBFFF]"
    }`;

  return (
    <div className="min-h-screen bg-[#dae8ff] p-6">
      <div className="max-h-[calc(100vh-48px)] min-h-[calc(100vh-64px)] overflow-y-auto rounded-[20px] bg-white shadow-md">
        <div className="flex items-center justify-between border-b border-[#EBEBEB] px-10 py-5">
          <div>
            <h1 className="text-[24px] font-medium text-gray-900">
              แก้ไขสินค้า
            </h1>

            <p className="text-[14px] text-gray-600">
              แก้ไขข้อมูลสินค้าในระบบคลังสินค้า
            </p>
          </div>

          <button
            onClick={() => router.push("/products")}
            className="rounded-full border border-[#D1D5DB] px-7 py-2 text-[18px] text-gray-600"
          >
            ← กลับรายการสินค้า
          </button>
        </div>

        {loading ? (
          <div className="flex h-[300px] items-center justify-center text-[16px] text-gray-500">
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <div className="space-y-5 p-5">
            {error && (
              <div className="rounded-[20px] bg-[#FFE4E4] px-7 py-4 text-[16px] text-[#E53935]">
                {error}
              </div>
            )}

            <div className="rounded-[20px] border border-[#E5E7EB] p-7">
              <h2 className="mb-5 text-[20px] font-medium text-gray-900">
                ข้อมูลสินค้า
              </h2>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="col-span-2">
                  <label className="mb-2 block text-[15px] text-gray-600">
                    ชื่อสินค้า *
                  </label>

                  <input
                    ref={nameRef}
                    type="text"
                    placeholder="กรอกชื่อสินค้า"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass(submitted && !name)}
                  />

                  {submitted && !name && (
                    <p className="mt-2 px-4 text-[14px] text-red-500">
                      กรุณากรอกชื่อสินค้า
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-[15px] text-gray-600">
                    แบรนด์ *
                  </label>

                  <select
                    ref={brandRef}
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className={`${inputClass(submitted && !brandId)} bg-white text-black`}
                  >
                    <option value="">เลือกแบรนด์</option>
                    {brands.map((b) => (
                      <option key={b.brandId} value={b.brandId}>
                        {b.brandName}
                      </option>
                    ))}
                  </select>

                  {submitted && !brandId && (
                    <p className="mt-2 px-4 text-[14px] text-red-500">
                      กรุณาเลือกแบรนด์
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-[15px] text-gray-600">
                    หมวดหมู่ *
                  </label>

                  <select
                    ref={categoryRef}
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className={`${inputClass(submitted && !categoryId)} bg-white text-black`}
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.categoryNameTh}
                      </option>
                    ))}
                  </select>

                  {submitted && !categoryId && (
                    <p className="mt-2 px-4 text-[14px] text-red-500">
                      กรุณาเลือกหมวดหมู่
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-[15px] text-gray-600">
                    สี
                  </label>

                  <input
                    type="text"
                    placeholder="เช่น Natural Titanium"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className={inputClass(false)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[15px] text-gray-600">
                    ความจุ
                  </label>

                  <input
                    type="text"
                    placeholder="เช่น 256GB"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className={inputClass(false)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[15px] text-gray-600">
                    ระยะประกัน (เดือน)
                  </label>

                  <input
                    type="number"
                    placeholder="12"
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className={inputClass(false)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#E5E7EB] p-7">
              <h2 className="mb-5 text-[20px] font-medium text-gray-900">
                ราคา
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="mb-2 block text-[15px] text-gray-600">
                    ราคาขาย *
                  </label>

                  <input
                    ref={priceRef}
                    type="number"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputClass(submitted && !price)}
                  />

                  {submitted && !price && (
                    <p className="mt-2 px-4 text-[14px] text-red-500">
                      กรุณากรอกราคาขาย
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-[15px] text-gray-600">
                    ราคาต้นทุน *
                  </label>

                  <input
                    ref={costRef}
                    type="number"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className={inputClass(submitted && !cost)}
                  />

                  {submitted && !cost && (
                    <p className="mt-2 px-4 text-[14px] text-red-500">
                      กรุณากรอกราคาต้นทุน
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pb-2">
              <button
                onClick={() => router.push("/products")}
                disabled={saving}
                className="rounded-full border border-[#D1D5DB] px-8 py-2 text-[18px] text-gray-600 disabled:opacity-50"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleSubmit}
                disabled={saving || !modelId}
                className="rounded-full bg-[#7FBFFF] px-8 py-2 text-[18px] text-white disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#dae8ff] p-6">
          <div className="flex min-h-[calc(100vh-48px)] items-center justify-center rounded-[20px] bg-white text-[16px] text-gray-500 shadow-md">
            กำลังโหลดข้อมูล...
          </div>
        </div>
      }
    >
      <EditProductForm />
    </Suspense>
  );
}
