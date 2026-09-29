"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { formatDateTime, formatMoney } from "@/lib/format";
import { SALE_STATUS_LABEL, type SaleOrder } from "@/types/sales/types";

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: "bg-[#DDF6E2] text-[#249447]",
  PENDING: "bg-[#FFF4D6] text-[#B4820A]",
  CANCELLED: "bg-[#FFE4E4] text-[#E53935]",
};

export default function Page() {
  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get("/api/v1/sales", {
          params: { size: 100 },
        });

        setSales(response.data.data.content ?? []);
      } catch {
        setError("ไม่สามารถโหลดประวัติการขายได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const keyword = search.trim().toLowerCase();
  const filtered = sales.filter((sale) =>
    [sale.saleCode, sale.customerName, sale.customerPhone].some((value) =>
      (value ?? "").toLowerCase().includes(keyword),
    ),
  );

  const totalRevenue = sales
    .filter((sale) => sale.status === "COMPLETED")
    .reduce((sum, sale) => sum + Number(sale.totalAmount ?? 0), 0);

  return (
    <div className="min-h-[calc(100vh-48px)] rounded-[20px] bg-white shadow-md">
      <div className="flex items-center justify-between border-b border-[#EBEBEB] px-10 py-5">
        <div>
          <h1 className="text-[24px] font-medium text-gray-900">
            ประวัติการขาย
          </h1>
          <p className="text-[14px] text-gray-600">
            ทั้งหมด {sales.length} บิล ยอดขายรวม ฿{formatMoney(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="px-10 py-4">
        <div className="flex h-[45px] items-center rounded-full border border-[#EBEBEB] px-6">
          <span className="text-[20px] text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาเลขที่บิล ชื่อลูกค้า เบอร์โทร"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-4 flex-1 bg-transparent text-[16px] text-black outline-none placeholder:text-gray-300"
          />
        </div>
      </div>

      <div className="mx-6 overflow-hidden rounded-[20px] border border-[#E5E7EB]">
        <div className="max-h-[560px] overflow-y-auto">
          <div className="grid grid-cols-[1.6fr_1.4fr_1.6fr_1.2fr_1fr_0.9fr] items-center border-b bg-[#F8FAFC] px-7 py-4 text-[16px] font-medium text-gray-800">
            <span>เลขที่บิล</span>
            <span>วันที่</span>
            <span>ลูกค้า</span>
            <span>รายการ</span>
            <span>ยอดรวม</span>
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
            filtered.map((sale) => (
              <div
                key={sale.saleId}
                className="grid grid-cols-[1.6fr_1.4fr_1.6fr_1.2fr_1fr_0.9fr] items-center border-b border-[#E5E7EB] px-7 py-4"
              >
                <span className="text-[15px] text-gray-900">
                  {sale.saleCode}
                </span>

                <span className="text-[15px] text-gray-500">
                  {formatDateTime(sale.saleDate)}
                </span>

                <div>
                  <p className="text-[15px] text-gray-900">
                    {sale.customerName}
                  </p>
                  <p className="text-[13px] text-gray-500">
                    {sale.customerPhone}
                  </p>
                </div>

                <span className="text-[15px] text-gray-500">
                  {(sale.items ?? []).length} รายการ
                </span>

                <span className="text-[16px] text-gray-700">
                  ฿{formatMoney(sale.totalAmount)}
                </span>

                <span
                  className={`w-fit rounded-full px-4 py-1 text-[14px] ${
                    STATUS_STYLE[sale.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {SALE_STATUS_LABEL[sale.status] ?? sale.status}
                </span>
              </div>
            ))
          ) : (
            <div className="flex h-[200px] items-center justify-center text-[16px] text-gray-500">
              {keyword !== "" ? "🔍 ไม่พบบิลที่ค้นหา" : "ยังไม่มีประวัติการขาย"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
