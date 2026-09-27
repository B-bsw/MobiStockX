import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "@/types/pos/types";
import { PosPayment } from "./pos-payment";

interface PosCartProps {
  items: CartItem[];
  received: string;
  onReceivedChange: (value: string) => void;
  onQuantityChange: (id: number, quantity: number) => void;
}

export function PosCart({ items, received, onReceivedChange, onQuantityChange }: PosCartProps) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <aside className="flex min-h-[650px] flex-col border-t border-[#EBEBEB] bg-white lg:border-l lg:border-t-0" aria-label="ตะกร้าสินค้า">
      <div className="border-b border-[#EBEBEB] px-6 py-4">
        <h2 className="text-[17px] text-black">รายการสินค้า</h2>
        <p className="text-[14px] text-[#808080]" aria-live="polite">{count} รายการในตะกร้า</p>
      </div>
      {items.length === 0 ? (
        <div className="flex min-h-[300px] flex-1 items-center justify-center text-center text-[17px] leading-snug text-[#808080]">
          <p>ตะกร้าว่าง<br />กดเลือกสินค้าเพื่อเพิ่ม</p>
        </div>
      ) : (
        <div className="flex-1 space-y-4 p-5">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="border-b border-[#EBEBEB] pb-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[15px] text-gray-900">{product.name}</p>
                <button type="button" onClick={() => onQuantityChange(product.id, 0)} aria-label={`ลบ ${product.name}`} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => onQuantityChange(product.id, quantity - 1)} aria-label={`ลดจำนวน ${product.name}`} className="rounded-full border border-gray-200 p-1"><Minus size={14} /></button>
                  <span>{quantity}</span>
                  <button type="button" disabled={quantity >= product.stock} onClick={() => onQuantityChange(product.id, quantity + 1)} aria-label={`เพิ่มจำนวน ${product.name}`} className="rounded-full border border-gray-200 p-1 disabled:opacity-30"><Plus size={14} /></button>
                </div>
                <span>{(product.price * quantity).toLocaleString("th-TH")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <PosPayment total={total} received={received} onReceivedChange={onReceivedChange} />
    </aside>
  );
}
