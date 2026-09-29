import type { ReceiveRecord } from "@/types/receive/types";

export function ReceiveHistory({ records }: { records: ReceiveRecord[] }) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#EBEBEB] bg-white">
      <h2 className="px-6 py-3.5 text-[21px] text-black">ประวัติการรับสินค้า</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead className="border-y border-[#EBEBEB] bg-[#F8F9FB] text-[20px] text-[#707070]">
            <tr>
              <th className="w-[17%] px-7 py-2 font-normal">วันที่</th>
              <th className="w-[28%] px-5 py-2 font-normal">สินค้า</th>
              <th className="w-[10%] px-4 py-2 text-center font-normal">จำนวน</th>
              <th className="w-[27%] px-5 py-2 font-normal">ซัพพลายเออร์</th>
              <th className="px-5 py-2 font-normal">เลขใบส่งของ</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-[#EBEBEB] text-[17px] last:border-b-0">
                <td className="whitespace-nowrap px-7 py-4 text-[#606060]">{record.date}</td>
                <td className="px-5 py-4 text-black">{record.product}</td>
                <td className="px-4 py-3 text-center"><span className="inline-block rounded-full bg-[#E5F2FF] px-3 py-1.5 text-[16px] font-semibold text-[#2460FF]">+{record.quantity}</span></td>
                <td className="px-5 py-4 text-[#606060]">{record.supplier}</td>
                <td className="px-5 py-4 text-[14px] text-[#808080]">{record.invoice || "—"}</td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-gray-500">ยังไม่มีประวัติการรับสินค้า</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
