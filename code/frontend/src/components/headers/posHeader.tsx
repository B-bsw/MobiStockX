import type { PosTab } from "@/types/pos/types";

interface PosHeaderProps {
  activeTab: PosTab;
  onTabChange: (tab: PosTab) => void;
}

export function PosHeader({ activeTab, onTabChange }: PosHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#EBEBEB] px-6 py-6 xl:px-10">
      <div>
        <h1 className="text-[28px] font-medium leading-tight text-[#292929]">ขายสินค้า / POS</h1>
        <p className="text-[16px] text-[#606060]">บันทึกการขายและดูประวัติการขาย</p>
      </div>
      <div className="flex rounded-full border border-[#EBEBEB] p-1" aria-label="เมนูการขาย">
        {([{ value: "sale", label: "หน้าขาย (POS)" }, { value: "history", label: "ประวัติการขาย" }] as const).map((tab) => (
          <button
            key={tab.value}
            type="button"
            aria-pressed={activeTab === tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`rounded-full px-4 py-2 text-[18px] transition-colors xl:text-[20px] ${activeTab === tab.value ? "bg-[#7FBFFF] text-white" : "text-[#808080] hover:bg-gray-50"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
