import { ChevronDown, Trash2 } from "lucide-react";
import { products } from "@/datas/product/data";
import { suppliers } from "@/datas/receive/data";
import type { ReceiveLine } from "@/types/receive/types";

interface ReceiveItemRowProps {
  line: ReceiveLine;
  removable: boolean;
  onChange: (id: string, field: keyof Omit<ReceiveLine, "id">, value: string) => void;
  onRemove: (id: string) => void;
}

const fieldClass = "h-[49px] w-full min-w-0 rounded-[19px] border border-[#EBEBEB] bg-white px-4 text-[15px] text-[#333333] outline-none placeholder:text-[#808080] focus:border-[#7FBFFF] focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block px-2 text-[14px] text-[#808080]";
const productOptions = products.filter((product, index, list) => list.findIndex((item) => item.sku === product.sku) === index);

export function ReceiveItemRow({ line, removable, onChange, onRemove }: ReceiveItemRowProps) {
  return (
    <div className="rounded-[20px] border border-[#EBEBEB] bg-[#F8F9FB] p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[2fr_0.7fr_1.85fr_1.25fr_1.2fr]">
        <div className="min-w-0">
          <label htmlFor={`product-${line.id}`} className={labelClass}>ชื่อสินค้า *</label>
          <div className="relative">
            <select id={`product-${line.id}`} required value={line.productId} onChange={(event) => onChange(line.id, "productId", event.target.value)} className={`${fieldClass} appearance-none pr-9`}>
              <option value="">-เลือกสินค้า-</option>
              {productOptions.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
            <ChevronDown size={18} aria-hidden="true" className="pointer-events-none absolute right-4 top-4 text-[#AAAAAA]" />
          </div>
        </div>
        <div>
          <label htmlFor={`quantity-${line.id}`} className={labelClass}>จำนวน *</label>
          <input id={`quantity-${line.id}`} type="number" min="1" max="999999" step="1" required value={line.quantity} onChange={(event) => onChange(line.id, "quantity", event.target.value)} className={fieldClass} />
        </div>
        <div className="min-w-0">
          <label htmlFor={`supplier-${line.id}`} className={labelClass}>ซัพพลายเออร์ *</label>
          <div className="relative">
            <select id={`supplier-${line.id}`} required value={line.supplier} onChange={(event) => onChange(line.id, "supplier", event.target.value)} className={`${fieldClass} appearance-none pr-9`}>
              {suppliers.map((supplier) => <option key={supplier}>{supplier}</option>)}
            </select>
            <ChevronDown size={18} aria-hidden="true" className="pointer-events-none absolute right-4 top-4 text-[#AAAAAA]" />
          </div>
        </div>
        <div>
          <label htmlFor={`invoice-${line.id}`} className={labelClass}>เลขที่ใบส่งของ</label>
          <input id={`invoice-${line.id}`} value={line.invoice} placeholder="INV-2026-XXX" onChange={(event) => onChange(line.id, "invoice", event.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor={`note-${line.id}`} className={labelClass}>หมายเหตุ</label>
          <input id={`note-${line.id}`} value={line.note} placeholder="ไม่บังคับ" onChange={(event) => onChange(line.id, "note", event.target.value)} className={fieldClass} />
        </div>
      </div>
      {removable && <button type="button" onClick={() => onRemove(line.id)} className="mt-2 flex items-center gap-1 px-2 text-sm text-red-500"><Trash2 size={15} /> ลบรายการ</button>}
    </div>
  );
}
