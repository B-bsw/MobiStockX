"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { formatMoney } from "@/lib/format";
import {
  ITEM_STATUS_LABEL,
  ITEM_STATUS_STYLE,
  type ItemStatus,
  type ProductItem,
} from "@/types/stock/types";

const FILTERS: { value: "ALL" | ItemStatus; label: string }[] = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "AVAILABLE", label: "พร้อมขาย" },
  { value: "SOLD", label: "ขายแล้ว" },
  { value: "DAMAGED", label: "ชำรุด" },
];

export default function Page() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | ItemStatus>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get("/api/v1/products/items", {
          params: { size: 200 },
        });

        setItems(response.data.data.content ?? []);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลสต๊อกได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const keyword = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchSearch = [item.modelName, item.serialNumber, item.imei].some(
      (value) => (value ?? "").toLowerCase().includes(keyword),
    );
    const matchStatus = status === "ALL" || item.status === status;
    return matchSearch && matchStatus;
  });

  const available = items.filter((item) => item.status === "AVAILABLE").length;

  return (
    <div className="min-h-[calc(100vh-48px)] rounded-[20px] bg-white shadow-md">
      <div className="flex items-center justify-between border-b border-[#EBEBEB] px-10 py-5">
        <div>
          <h1 className="text-[24px] font-medium text-gray-900">จัดการสต๊อก</h1>
          <p className="text-[14px] text-gray-600">
            ทั้งหมด {items.length} เครื่อง พร้อมขาย {available} เครื่อง
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 px-10 py-4">
        <div className="flex h-[45px] min-w-[280px] flex-1 items-center rounded-full border border-[#EBEBEB] px-6">
          <span className="text-[20px] text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="ค้นหารุ่น Serial หรือ IMEI"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-4 flex-1 bg-transparent text-[16px] text-black outline-none placeholder:text-gray-300"
          />
        </div>

        <div className="flex h-[45px] items-center rounded-full border border-[#E5E7EB] px-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatus(filter.value)}
              className={`rounded-full px-6 py-1 text-[17px] transition-all duration-300 ${
                status === filter.value
                  ? "bg-[#78B8F2] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-6 overflow-hidden rounded-[20px] border border-[#E5E7EB]">
        <div className="max-h-[560px] overflow-y-auto">
          <div className="grid grid-cols-[2fr_1.6fr_1.6fr_0.9fr_1fr_1fr] items-center border-b bg-[#F8FAFC] px-7 py-4 text-[16px] font-medium text-gray-800">
            <span>รุ่นสินค้า</span>
            <span>Serial</span>
            <span>IMEI</span>
            <span>เกรด</span>
            <span>ราคาขาย</span>
            <span>สถานะ</span>
          </div>

          {loading ? (
            <div className="flex h-[200px] items-center justify-center text-[16px] text-gray-500">
              กำลังโหลดข้อมูล...
            </div>
          ) : error ? (
            <div className="flex h-[200px] items-center justify-center text-[16px] text-[#E53935]">
              {error}
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.itemId}
                className="grid grid-cols-[2fr_1.6fr_1.6fr_0.9fr_1fr_1fr] items-center border-b border-[#E5E7EB] px-7 py-4"
              >
                <span className="text-[15px] text-gray-900">
                  {item.modelName}
                </span>

                <span className="text-[15px] text-gray-500">
                  {item.serialNumber || "-"}
                </span>

                <span className="text-[15px] text-gray-500">
                  {item.imei || "-"}
                </span>

                <span className="text-[15px] text-gray-500">
                  {item.grade || "-"}
                </span>

                <span className="text-[16px] text-gray-700">
                  ฿{formatMoney(item.sellingPrice)}
                </span>

                <span
                  className={`w-fit rounded-full px-4 py-1 text-[14px] ${
                    ITEM_STATUS_STYLE[item.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ITEM_STATUS_LABEL[item.status] ?? item.status}
                </span>
              </div>
            ))
          ) : (
            <div className="flex h-[200px] items-center justify-center text-[16px] text-gray-500">
              {keyword !== "" ? "🔍 ไม่พบเครื่องที่ค้นหา" : "ไม่พบเครื่องในสถานะนี้"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
