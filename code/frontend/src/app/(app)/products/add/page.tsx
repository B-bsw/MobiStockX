"use client";

import { useRef, useState } from "react";

export default function AddProductPage() {
  /* ส้วนข้อมูลสินค้า */
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  /* ส่วนราคา */
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  /* ส่วนสต๊อก */
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const brandRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const skuRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const costRef = useRef<HTMLInputElement>(null);
  const stockRef = useRef<HTMLInputElement>(null);

  const minStockRef = useRef<HTMLInputElement>(null);

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

  /* ตรวจสอบข้อมูลครบมั้ย */
  const handleSubmit = () => {
    setSubmitted(true);

    if (!name) {
      scrollToField(nameRef);
      return;
    }

    if (!brand) {
      scrollToField(brandRef);
      return;
    }

    if (!model) {
      scrollToField(modelRef);
      return;
    }

    if (!sku) {
      scrollToField(skuRef);
      return;
    }

    if (!category) {
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

    if (!stock) {
      scrollToField(stockRef);
      return;
    }

    if (!minStock) {
      scrollToField(minStockRef);
      return;
    }

    alert("เพิ่มสินค้าสำเร็จ");
  };

  return (
    /* สีพื้นหลังสีฟ้า */
    <div>
      {/* กรอบสีขาวหลัก */}
      <div className="max-h-dvh min-h-[calc(100vh-64px)] overflow-y-auto rounded-[20px] bg-white shadow-md">
        {/* หัวข้อด้านบน */}
        <div className="flex items-center justify-between border-b border-[#EBEBEB] px-10 py-5">
          <div>
            <h1 className="text-[24px] font-medium text-gray-900">
              เพิ่มสินค้าใหม่
            </h1>

            <p className="text-[14px] text-gray-600">
              เพิ่มโทรศัพท์มือถือเข้าสู่ระบบคลังสินค้า
            </p>
          </div>

          <button className="rounded-full border border-[#D1D5DB] px-7 py-2 text-[18px] text-gray-600">
            ← กลับรายการสินค้า
          </button>
        </div>

        {/* เนื้อหาด้านใน */}
        <div className="space-y-5 p-5">
          {/* ช่องกรอกข้อมูลสินค้า */}
          <div className="rounded-[20px] border border-[#E5E7EB] p-7">
            <h2 className="mb-5 text-[20px] font-medium text-gray-900">
              ข้อมูลสินค้า
            </h2>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* ชื่อสินค้า */}
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
                  className={`h-[52px] w-full rounded-full border px-6 text-[16px] outline-none focus:border-[#7FBFFF] ${
                    submitted && !name
                      ? "border-red-500"
                      : "border-[#E5E7EB] focus:border-[#7FBFFF]"
                  }`}
                />

                {submitted && !name && (
                  <p className="mt-2 px-4 text-[14px] text-red-500">
                    กรุณากรอกชื่อสินค้า
                  </p>
                )}
              </div>

              {/* แบรนด์ */}
              <div>
                <label className="mb-2 block text-[15px] text-gray-600">
                  แบรนด์ *
                </label>

                <input
                  ref={brandRef}
                  type="text"
                  placeholder="กรอกแบรนด์"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className={`h-[52px] w-full rounded-full border px-6 text-[16px] outline-none focus:border-[#7FBFFF] ${
                    submitted && !brand
                      ? "border-red-500"
                      : "border-[#E5E7EB] focus:border-[#7FBFFF]"
                  }`}
                />

                {submitted && !brand && (
                  <p className="mt-2 px-4 text-[14px] text-red-500">
                    กรุณากรอกแบรนด์
                  </p>
                )}
              </div>

              {/* รุ่น / สี / ความจุ */}
              <div>
                <label className="mb-2 block text-[15px] text-gray-600">
                  รุ่น / สี / ความจุ *
                </label>

                <input
                  ref={modelRef}
                  type="text"
                  placeholder="กรอกรุ่น / สี / ความจุ"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className={`h-[52px] w-full rounded-full border px-6 text-[16px] outline-none focus:border-[#7FBFFF] ${
                    submitted && !model
                      ? "border-red-500"
                      : "border-[#E5E7EB] focus:border-[#7FBFFF]"
                  }`}
                />

                {submitted && !model && (
                  <p className="mt-2 px-4 text-[14px] text-red-500">
                    กรุณากรอกรุ่น / สี / ความจุ
                  </p>
                )}
              </div>

              {/* SKU */}
              <div>
                <label className="mb-2 block text-[15px] text-gray-600">
                  รหัส SKU *
                </label>

                <input
                  ref={skuRef}
                  type="text"
                  placeholder="กรอกรหัส SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className={`h-[52px] w-full rounded-full border px-6 text-[16px] outline-none focus:border-[#7FBFFF] ${
                    submitted && !sku
                      ? "border-red-500"
                      : "border-[#E5E7EB] focus:border-[#7FBFFF]"
                  }`}
                />

                {submitted && !sku && (
                  <p className="mt-2 px-4 text-[14px] text-red-500">
                    กรุณากรอกรหัส SKU
                  </p>
                )}
              </div>

              {/* หมวดหมู่ */}
              <div>
                <label className="mb-2 block text-[15px] text-gray-600">
                  หมวดหมู่ *
                </label>

                <select
                  ref={categoryRef}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`h-[52px] w-full rounded-full border bg-white px-6 text-[16px] text-gray-500 outline-none focus:border-[#7FBFFF] ${
                    submitted && !category
                      ? "border-red-500 text-gray-500"
                      : "border-[#E5E7EB] text-gray-700 focus:border-[#7FBFFF]"
                  }`}
                >
                  <option value="">เลือกหมวดหมู่</option>
                  <option value="Flagship">Flagship</option>
                  <option value="Mid-Range">Mid-Range</option>
                  <option value="Budget">Budget</option>
                </select>

                {submitted && !category && (
                  <p className="mt-2 px-4 text-[14px] text-red-500">
                    กรุณาเลือกหมวดหมู่
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ช่องกรอกาคา */}
          <div className="rounded-[20px] border border-[#E5E7EB] p-7">
            <h2 className="mb-5 text-[20px] font-medium text-gray-900">ราคา</h2>

            <div className="grid grid-cols-2 gap-6">
              {/* ราคาขาย */}
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
                  className={`h-[52px] w-full rounded-full border px-6 text-[16px] outline-none focus:border-[#7FBFFF] ${
                    submitted && !price
                      ? "border-red-500"
                      : "border-[#E5E7EB] focus:border-[#7FBFFF]"
                  }`}
                />

                {submitted && !price && (
                  <p className="mt-2 px-4 text-[14px] text-red-500">
                    กรุณากรอกราคาขาย
                  </p>
                )}
              </div>

              {/* ราคาต้นทุน */}
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
                  className={`h-[52px] w-full rounded-full border px-6 text-[16px] outline-none focus:border-[#7FBFFF] ${
                    submitted && !cost
                      ? "border-red-500"
                      : "border-[#E5E7EB] focus:border-[#7FBFFF]"
                  }`}
                />

                {submitted && !cost && (
                  <p className="mt-2 px-4 text-[14px] text-red-500">
                    กรุณากรอกราคาต้นทุน
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ช่องกรอกการจัดการสต๊อก */}
          <div className="rounded-[20px] border border-[#E5E7EB] p-7">
            <h2 className="mb-5 text-[20px] font-medium text-gray-900">
              การจัดการสต๊อก
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {/* จำนวนสต๊อกเริ่มต้น */}
              <div>
                <label className="mb-2 block text-[15px] text-gray-600">
                  จำนวนสต๊อกเริ่มต้น *
                </label>

                <input
                  ref={stockRef}
                  type="number"
                  placeholder="กรอกจำนวนสต๊อก"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className={`h-[52px] w-full rounded-full border px-6 text-[16px] outline-none focus:border-[#7FBFFF] ${
                    submitted && !stock
                      ? "border-red-500"
                      : "border-[#E5E7EB] focus:border-[#7FBFFF]"
                  }`}
                />

                {submitted && !stock && (
                  <p className="mt-2 px-4 text-[14px] text-red-500">
                    กรุณากรอกจำนวนสต๊อก
                  </p>
                )}
              </div>

              {/* จำนวนขั้นต่ำที่แจ้งเตือน */}
              <div>
                <label className="mb-2 block text-[15px] text-gray-600">
                  จำนวนขั้นต่ำที่แจ้งเตือน *
                </label>

                <input
                  ref={minStockRef}
                  type="number"
                  placeholder="กรอกจำนวนขั้นต่ำ"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  className={`h-[52px] w-full rounded-full border border-[#E5E7EB] px-6 text-[16px] outline-none focus:border-[#7FBFFF] ${
                    submitted && !minStock
                      ? "border-red-500"
                      : "border-[#E5E7EB] focus:border-[#7FBFFF]"
                  }`}
                />

                {submitted && !minStock && (
                  <p className="mt-2 px-4 text-[14px] text-red-500">
                    กรุณากรอกจำนวนขั้นต่ำที่แจ้งเตือน
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ปุ่มด้านล่าง */}
          <div className="flex justify-end gap-4 pb-2">
            <button className="rounded-full border border-[#D1D5DB] px-8 py-2 text-[18px] text-gray-600">
              ยกเลิก
            </button>

            <button
              onClick={handleSubmit}
              className="rounded-full bg-[#7FBFFF] px-8 py-2 text-[18px] text-white"
            >
              เพิ่มสินค้า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
