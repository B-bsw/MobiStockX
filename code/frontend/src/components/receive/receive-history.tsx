import { formatDateTime, formatMoney } from "@/lib/format";
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
    <section className="overflow-hidden rounded-[20px] border border-[#EBEBEB] bg-white">
      <h2 className="px-6 py-3.5 text-[21px] text-black">ประวัติการรับสินค้า</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead className="border-y border-[#EBEBEB] bg-[#F8F9FB] text-[20px] text-[#707070]">
            <tr>
              <th className="w-[22%] px-7 py-2 font-normal">วันที่รับเข้า</th>
              <th className="w-[30%] px-5 py-2 font-normal">สินค้า</th>
              <th className="w-[20%] px-5 py-2 font-normal">Serial</th>
              <th className="w-[14%] px-4 py-2 font-normal">ต้นทุน</th>
              <th className="px-5 py-2 font-normal">ราคาขาย</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#E53935]">
                  {error}
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.itemId}
                  className="border-b border-[#EBEBEB] text-[17px] last:border-b-0"
                >
                  <td className="whitespace-nowrap px-7 py-4 text-[#606060]">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-black">{item.modelName}</td>
                  <td className="px-5 py-4 text-[14px] text-[#808080]">
                    {item.serialNumber || item.imei || "—"}
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
                <td colSpan={5} className="py-12 text-center text-gray-500">
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
