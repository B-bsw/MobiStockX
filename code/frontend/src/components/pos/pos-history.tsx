import { formatDateTime, formatMoney } from "@/lib/format";
import { SALE_STATUS_LABEL, type SaleOrder } from "@/types/sales/types";

interface PosHistoryProps {
  sales: SaleOrder[];
  loading?: boolean;
}

export function PosHistory({ sales, loading = false }: PosHistoryProps) {
  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-1 items-center justify-center bg-[#F8F9FB] text-[#808080]">
        กำลังโหลดประวัติการขาย...
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="flex min-h-[500px] flex-1 items-center justify-center bg-[#F8F9FB] text-[#808080]">
        ยังไม่มีประวัติการขาย
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8F9FB] p-6">
      <div className="overflow-hidden rounded-[20px] border border-[#EBEBEB] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="border-b border-[#EBEBEB] bg-[#F8FAFC] text-[16px] text-[#707070]">
              <tr>
                <th className="px-6 py-3 font-normal">เลขที่บิล</th>
                <th className="px-5 py-3 font-normal">วันที่</th>
                <th className="px-5 py-3 font-normal">ลูกค้า</th>
                <th className="px-5 py-3 font-normal">พนักงาน</th>
                <th className="px-5 py-3 font-normal">ยอดรวม</th>
                <th className="px-5 py-3 font-normal">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr
                  key={sale.saleId}
                  className="border-b border-[#EBEBEB] text-[16px] last:border-b-0"
                >
                  <td className="px-6 py-4 text-black">{sale.saleCode}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-[#606060]">
                    {formatDateTime(sale.saleDate)}
                  </td>
                  <td className="px-5 py-4 text-[#606060]">
                    {sale.customerName}
                  </td>
                  <td className="px-5 py-4 text-[#606060]">
                    {sale.createdByUserName}
                  </td>
                  <td className="px-5 py-4 text-black">
                    ฿{formatMoney(sale.totalAmount)}
                  </td>
                  <td className="px-5 py-4 text-[#606060]">
                    {SALE_STATUS_LABEL[sale.status] ?? sale.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
