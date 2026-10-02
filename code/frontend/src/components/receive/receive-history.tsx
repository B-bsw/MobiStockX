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
    <section className="border-t border-[#EBEBEB] bg-white px-6 py-6 xl:px-10">
      <div className="mb-5">
        <h2 className="text-[20px] font-semibold text-[#292929]">
          ประวัติการรับสินค้า
        </h2>

        <p className="mt-1 text-[16px] text-[#606060]">
          รายการสินค้าที่รับเข้าคลังล่าสุด
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#EBEBEB]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="border-b border-[#EBEBEB] bg-[#F8F9FB] text-sm text-[#707070]">
              <tr>
                <th className="w-[22%] px-6 py-3 font-medium">
                  วันที่รับเข้า
                </th>

                <th className="w-[30%] px-5 py-3 font-medium">
                  สินค้า
                </th>

                <th className="w-[20%] px-5 py-3 font-medium">
                  Serial
                </th>

                <th className="w-[14%] px-4 py-3 font-medium">
                  ต้นทุน
                </th>

                <th className="px-5 py-3 font-medium">
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
                    className="border-b border-[#EBEBEB] text-sm last:border-b-0"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-[#606060]">
                      {formatDateTime(item.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-[#292929]">
                      {item.modelName}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#808080]">
                      {item.serialNumber ||
                        item.imei ||
                        "—"}
                    </td>

                    <td className="px-4 py-4 text-[#606060]">
                      ฿{formatMoney(item.costPrice)}
                    </td>

                    <td className="px-5 py-4 text-[#606060]">
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
      </div>
    </section>
  );
}