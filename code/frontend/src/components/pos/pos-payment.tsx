import { formatMoney } from "@/lib/format";
import {
  PAYMENT_METHODS,
  type Customer,
  type PaymentMethod,
  type TaxInvoiceErrors,
  type TaxInvoiceForm,
} from "@/types/sales/types";
import { PosTaxInvoice } from "./pos-tax-invoice";

interface PosPaymentProps {
  total: number;
  received: string;
  customers: Customer[];
  customerId: string;
  paymentMethod: PaymentMethod;
  taxInvoiceEnabled: boolean;
  taxInvoice: TaxInvoiceForm;
  taxInvoiceErrors: TaxInvoiceErrors;
  saving: boolean;
  message: string;
  isError: boolean;
  canCheckout: boolean;
  onReceivedChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onTaxInvoiceToggle: (enabled: boolean) => void;
  onTaxInvoiceChange: <K extends keyof TaxInvoiceForm>(
    field: K,
    value: TaxInvoiceForm[K],
  ) => void;
  onCheckout: () => void;
}

const selectClass =
  "h-[43px] w-full rounded-[20px] border border-[#EBEBEB] bg-white px-5 text-[15px] text-black outline-none";

export function PosPayment({
  total,
  received,
  customers,
  customerId,
  paymentMethod,
  taxInvoiceEnabled,
  taxInvoice,
  taxInvoiceErrors,
  saving,
  message,
  isError,
  canCheckout,
  onReceivedChange,
  onCustomerChange,
  onPaymentMethodChange,
  onTaxInvoiceToggle,
  onTaxInvoiceChange,
  onCheckout,
}: PosPaymentProps) {
  const isCash = paymentMethod === "CASH";
  const enoughCash = !isCash || Number(received) >= total;

  return (
    <div className="shrink-0 border-t border-[#EBEBEB] px-7 pb-6 pt-3 text-[#808080]">
      <div className="flex justify-between text-[17px]">
        <span>ยอดรวม</span>
        <span className="text-black">{formatMoney(total)}</span>
      </div>

      <label htmlFor="pos-customer" className="mb-1 mt-2 block text-[14px]">
        ลูกค้า *
      </label>
      <select
        id="pos-customer"
        value={customerId}
        onChange={(event) => onCustomerChange(event.target.value)}
        className={selectClass}
      >
        <option value="">เลือกลูกค้า</option>
        {customers.map((customer) => (
          <option key={customer.customerId} value={customer.customerId}>
            {customer.firstName} {customer.lastName} · {customer.phone}
          </option>
        ))}
      </select>

      <label
        htmlFor="pos-payment-method"
        className="mb-1 mt-2 block text-[14px]"
      >
        วิธีชำระเงิน
      </label>
      <select
        id="pos-payment-method"
        value={paymentMethod}
        onChange={(event) =>
          onPaymentMethodChange(event.target.value as PaymentMethod)
        }
        className={selectClass}
      >
        {PAYMENT_METHODS.map((method) => (
          <option key={method.value} value={method.value}>
            {method.label}
          </option>
        ))}
      </select>

      {isCash && (
        <>
          <label htmlFor="pos-received" className="mb-1 mt-2 block text-[14px]">
            รับเงินมา
          </label>
          <input
            id="pos-received"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            value={received}
            onChange={(event) => onReceivedChange(event.target.value)}
            className="h-[43px] w-full rounded-[18px] border-2 border-[#2495FF] px-5 text-[15px] text-black outline-none placeholder:text-[#CACACA] focus:ring-2 focus:ring-blue-100"
          />
          {total > 0 && Number(received) >= total && (
            <p className="mt-2 text-sm">
              เงินทอน {formatMoney(Number(received) - total)}
            </p>
          )}
        </>
      )}

      <PosTaxInvoice
        enabled={taxInvoiceEnabled}
        values={taxInvoice}
        errors={taxInvoiceErrors}
        total={total}
        disabled={saving}
        onToggle={onTaxInvoiceToggle}
        onChange={onTaxInvoiceChange}
      />

      <button
        type="button"
        disabled={!canCheckout || !enoughCash || saving}
        onClick={onCheckout}
        className="mt-3 h-[48px] w-full rounded-full bg-[#7FBFFF] text-[18px] text-white transition hover:bg-[#68AEF4] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "กำลังบันทึก..." : "ชำระเงิน"}
      </button>

      {message && (
        <p
          role="status"
          className={`mt-2 text-sm ${isError ? "text-[#E53935]" : "text-[#249447]"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
