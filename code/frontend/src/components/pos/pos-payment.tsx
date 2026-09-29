interface PosPaymentProps {
  total: number;
  received: string;
  onReceivedChange: (value: string) => void;
}

export function PosPayment({ total, received, onReceivedChange }: PosPaymentProps) {
  return (
    <div className="border-t border-[#EBEBEB] px-7 pb-6 pt-3 text-[#808080]">
      <div className="flex justify-between text-[17px]">
        <span>ยอดรวม</span>
        <span>{total.toLocaleString("th-TH")}</span>
      </div>
      <label htmlFor="pos-payment-method" className="mb-1 block text-[14px]">วิธีชำระเงิน</label>
      <select id="pos-payment-method" className="h-[43px] w-full rounded-[20px] border border-[#EBEBEB] bg-white px-5 text-[15px] text-[#444444]">
        <option value="cash">เงินสด</option>
      </select>
      <label htmlFor="pos-received" className="mb-1 mt-2 block text-[14px]">รับเงินมา</label>
      <input
        id="pos-received"
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        placeholder="0.00"
        value={received}
        onChange={(event) => onReceivedChange(event.target.value)}
        className="h-[43px] w-full rounded-[18px] border-2 border-[#2495FF] px-5 text-[15px] text-gray-900 outline-none placeholder:text-[#CACACA] focus:ring-2 focus:ring-blue-100"
      />
      {total > 0 && Number(received) >= total && (
        <p className="mt-2 text-sm">เงินทอน {(Number(received) - total).toLocaleString("th-TH")}</p>
      )}
      <button
        type="button"
        disabled
        aria-label="ชำระเงิน (ยังไม่เชื่อมต่อระบบ)"
        title="ยังไม่เชื่อมต่อระบบชำระเงิน"
        className="mt-3 h-[48px] w-full cursor-not-allowed rounded-full bg-[#7FBFFF]"
      />
    </div>
  );
}
