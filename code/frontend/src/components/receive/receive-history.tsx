import {
  formatDateTime,
  formatMoney,
} from "@/lib/format";

import type { ProductItem } from "@/types/stock/types";

interface ReceiveHistoryProps {
  items: ProductItem[];
  loading?: boolean;
  error?: string;
}

export function ReceiveHistory({
  items,
  loading = false,
  error = "",
}: ReceiveHistoryProps) {
  return (
    <section className="border-t border-[#EBEBEB] bg-white">
      {/* หัวข้อ */}
      <div className="px-4 py-6 sm:px-6">
        <div>
          <h2 className="text-[20px] font-semibold text-[#292929]">
            ประวัติการรับสินค้า
          </h2>

          <p className="mt-1 text-[16px] text-[#606060]">
            รายการสินค้าที่รับเข้าคลังล่าสุด
          </p>
        </div>
      </div>

      {/* ตาราง */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead className="border-y border-[#DCE3EB] bg-[#EFF4FA]">
            <tr>
              <th className="w-[22%] px-6 py-3 text-sm font-semibold text-[#404040]">
                วันที่รับเข้า
              </th>

              <th className="w-[30%] px-5 py-3 text-sm font-semibold text-[#404040]">
                สินค้า
              </th>

              <th className="w-[20%] px-5 py-3 text-sm font-semibold text-[#404040]">
                Serial
              </th>

              <th className="w-[14%] px-5 py-3 text-sm font-semibold text-[#404040]">
                ต้นทุน
              </th>

              <th className="px-5 py-3 text-sm font-semibold text-[#404040]">
                ราคาขาย
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-sm text-[#808080]"
                >
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-sm text-[#E53935]"
                >
                  {error}
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.itemId}
                  className="border-b border-[#E2E7ED]"
                >
                  <td className="whitespace-nowrap px-6 py-3.5 text-sm text-[#606060]">
                    {formatDateTime(item.createdAt)}
                  </td>

                  <td className="px-5 py-3.5 text-sm font-medium text-[#292929]">
                    {item.modelName}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-[#707984]">
                    {item.serialNumber ||
                      item.imei ||
                      "—"}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-[#606060]">
                    ฿{formatMoney(item.costPrice)}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-[#606060]">
                    ฿{formatMoney(item.sellingPrice)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-sm text-[#808080]"
                >
                  ยังไม่มีประวัติการรับสินค้า
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}