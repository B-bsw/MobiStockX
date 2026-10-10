import { Minus, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { itemLabel, type CartItem } from "@/types/pos/types";
import type {
  Customer,
  PaymentMethod,
  TaxInvoiceForm,
} from "@/types/sales/types";
import { PosPayment } from "./pos-payment";

interface PosCartProps {
  items: CartItem[];
  received: string;
  customers: Customer[];
  customerId: string;
  paymentMethod: PaymentMethod;
  taxInvoiceEnabled: boolean;
  taxInvoice: TaxInvoiceForm;
  saving: boolean;
  message: string;
  isError: boolean;
  onReceivedChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onTaxInvoiceToggle: (enabled: boolean) => void;
  onTaxInvoiceConfirm: (values: TaxInvoiceForm) => void;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onCheckout: () => void;
}

function unitPrice(line: CartItem) {
  return line.item?.price ?? line.product.price;
}

export function PosCart({
  items,
  received,
  customers,
  customerId,
  paymentMethod,
  taxInvoiceEnabled,
  taxInvoice,
  saving,
  message,
  isError,
  onReceivedChange,
  onCustomerChange,
  onPaymentMethodChange,
  onTaxInvoiceToggle,
  onTaxInvoiceConfirm,
  onQuantityChange,
  onCheckout,
}: PosCartProps) {
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, line) => sum + unitPrice(line) * line.quantity,
    0,
  );

  return (
    <aside
      className="flex min-h-[650px] flex-col border-t border-[#EBEBEB] bg-white lg:min-h-0 lg:border-l lg:border-t-0"
      aria-label="ตะกร้าสินค้า"
    >
      <div className="shrink-0 border-b border-[#EBEBEB] px-6 py-4">
        <h2 className="text-[17px] text-black">รายการสินค้า</h2>
        <p className="text-[14px] text-[#808080]" aria-live="polite">
          {count} รายการในตะกร้า
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex min-h-[300px] flex-1 items-center justify-center text-center text-[17px] leading-snug text-[#808080] lg:min-h-0">
          <p>
            ตะกร้าว่าง
            <br />
            กดเลือกสินค้าเพื่อเพิ่ม
          </p>
        </div>
      ) : (
        <div className="max-h-[40dvh] min-h-0 flex-1 space-y-4 overflow-y-auto p-5 lg:max-h-none">
          {items.map((line) => {
            const { lineId, product, item, quantity } = line;
            const name = item ? `${product.name} · ${itemLabel(item)}` : product.name;

            return (
              <div key={lineId} className="border-b border-[#EBEBEB] pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[15px] text-gray-900">{product.name}</p>
                    {item && (
                      <p className="mt-0.5 break-all font-mono text-[13px] text-gray-500">
                        {itemLabel(item)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onQuantityChange(lineId, 0)}
                    aria-label={`ลบ ${name}`}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  {/* A picked unit is one physical phone: no quantity stepper. */}
                  {item ? (
                    <span>1 เครื่อง</span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onQuantityChange(lineId, quantity - 1)}
                        aria-label={`ลดจำนวน ${name}`}
                        className="rounded-full border border-gray-200 p-1"
                      >
                        <Minus size={14} />
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        disabled={quantity >= product.stock}
                        onClick={() => onQuantityChange(lineId, quantity + 1)}
                        aria-label={`เพิ่มจำนวน ${name}`}
                        className="rounded-full border border-gray-200 p-1 disabled:opacity-30"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                  <span>{formatMoney(unitPrice(line) * quantity)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PosPayment
        total={total}
        received={received}
        customers={customers}
        customerId={customerId}
        paymentMethod={paymentMethod}
        taxInvoiceEnabled={taxInvoiceEnabled}
        taxInvoice={taxInvoice}
        saving={saving}
        message={message}
        isError={isError}
        canCheckout={items.length > 0 && customerId !== ""}
        onReceivedChange={onReceivedChange}
        onCustomerChange={onCustomerChange}
        onPaymentMethodChange={onPaymentMethodChange}
        onTaxInvoiceToggle={onTaxInvoiceToggle}
        onTaxInvoiceConfirm={onTaxInvoiceConfirm}
        onCheckout={onCheckout}
      />
    </aside>
  );
}
