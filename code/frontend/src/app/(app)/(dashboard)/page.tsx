"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { ProductModel } from "@/types/products/types";
import type { SaleOrder } from "@/types/sales/types";
import type { ProductItem } from "@/types/stock/types";

const LOW_STOCK_THRESHOLD = 3;

export default function Home() {
  const [models, setModels] = useState<ProductModel[]>([]);
  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const [modelRes, saleRes, itemRes] = await Promise.all([
          api.get("/products/models", { params: { size: 200 } }),
          api.get("/sales", { params: { size: 200 } }),
          api.get("/products/items", { params: { size: 200 } }),
        ]);

        setModels(modelRes.data.data.content ?? []);
        setSales(saleRes.data.data.content ?? []);
        setItems(itemRes.data.data.content ?? []);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const totalStock = models.reduce(
    (sum, model) => sum + Number(model.stockQuantity ?? 0),
    0,
  );

  const stockValue = models.reduce(
    (sum, model) =>
      sum + Number(model.standardCost ?? 0) * Number(model.stockQuantity ?? 0),
    0,
  );

  const completed = sales.filter((sale) => sale.status === "COMPLETED");
  const revenue = completed.reduce(
    (sum, sale) => sum + Number(sale.totalAmount ?? 0),
    0,
  );

  const available = items.filter((item) => item.status === "AVAILABLE").length;

  const lowStock = models
    .filter((model) => Number(model.stockQuantity ?? 0) <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => Number(a.stockQuantity) - Number(b.stockQuantity));

  const cards = [
    { label: "รุ่นสินค้าทั้งหมด", value: `${models.length} รุ่น` },
    { label: "สต๊อกรวม", value: `${totalStock} ชิ้น` },
    { label: "มูลค่าสต๊อก (ต้นทุน)", value: `฿${formatMoney(stockValue)}` },
    { label: "ยอดขายรวม", value: `฿${formatMoney(revenue)}` },
    { label: "จำนวนบิลที่สำเร็จ", value: `${completed.length} บิล` },
    { label: "เครื่องพร้อมขาย", value: `${available} เครื่อง` },
  ];

  return (
    <div className="min-h-[calc(100vh-48px)] rounded-[20px] bg-white p-7 shadow-md">
      <div className="mb-6">
        <h1 className="text-[24px] font-medium text-gray-900">แดชบอร์ด</h1>
        <p className="text-[14px] text-gray-600">ภาพรวมคลังสินค้าและการขาย</p>
      </div>

      {error && (
        <div className="mb-5 rounded-[20px] bg-[#FFE4E4] px-7 py-4 text-[16px] text-[#E53935]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-[200px] items-center justify-center text-[16px] text-gray-500">
          กำลังโหลดข้อมูล...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-[20px] border border-[#E5E7EB] px-6 py-5"
              >
                <p className="text-[14px] text-gray-500">{card.label}</p>
                <p className="mt-1 text-[24px] text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 overflow-hidden rounded-[20px] border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F8FAFC] px-7 py-4">
              <h2 className="text-[18px] font-medium text-gray-800">
                สินค้าสต๊อกต่ำ (เหลือไม่เกิน {LOW_STOCK_THRESHOLD})
              </h2>
              <Link
                href="/receive"
                className="rounded-full bg-[#DCEEFF] px-5 py-1 text-[14px] text-[#2580D9]"
              >
                รับสินค้าเข้า
              </Link>
            </div>

            {lowStock.length > 0 ? (
              lowStock.slice(0, 10).map((model) => (
                <div
                  key={model.modelId}
                  className="grid grid-cols-[2fr_1fr_1fr] items-center border-b border-[#E5E7EB] px-7 py-3 last:border-b-0"
                >
                  <div>
                    <p className="text-[15px] text-gray-900">
                      {model.modelName}
                    </p>
                    <p className="text-[13px] text-gray-500">
                      {model.brandName}
                    </p>
                  </div>
                  <span className="text-[15px] text-gray-500">
                    {model.categoryNameTh}
                  </span>
                  <span
                    className={`w-fit rounded-full px-5 py-1 text-[14px] ${
                      Number(model.stockQuantity) === 0
                        ? "bg-[#FFE4E4] text-[#E53935]"
                        : "bg-[#FFF4D6] text-[#B4820A]"
                    }`}
                  >
                    เหลือ {model.stockQuantity}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-[120px] items-center justify-center text-[16px] text-gray-500">
                สต๊อกทุกรุ่นอยู่ในระดับปกติ
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
