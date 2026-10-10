"use client";

import { formatMoney } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import {
  vatBreakdown,
  type TaxInvoiceErrors,
  type TaxInvoiceForm,
} from "@/types/sales/types";

interface PosTaxInvoiceProps {
  enabled: boolean;
  values: TaxInvoiceForm;
  errors: TaxInvoiceErrors;
  total: number;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
  onChange: <K extends keyof TaxInvoiceForm>(
    field: K,
    value: TaxInvoiceForm[K],
  ) => void;
}

const fieldClass =
  "h-[43px] w-full rounded-[20px] border border-[#EBEBEB] bg-white px-5 text-[15px] text-black outline-none placeholder:text-[#CACACA] focus:border-[#2495FF] aria-[invalid=true]:border-[#E53935]";

export function PosTaxInvoice({
  enabled,
  values,
  errors,
  total,
  disabled,
  onToggle,
  onChange,
}: PosTaxInvoiceProps) {
  const { beforeVat, vat } = vatBreakdown(total);

  const describedBy = (field: keyof TaxInvoiceForm) =>
    errors[field] ? `pos-tax-${field}-error` : undefined;

  const error = (field: keyof TaxInvoiceForm) =>
    errors[field] ? (
      <p
        id={`pos-tax-${field}-error`}
        role="alert"
        className="mt-1 text-[13px] text-[#E53935]"
      >
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="mt-3 rounded-[20px] border border-[#EBEBEB] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="pos-tax-toggle"
          className="cursor-pointer text-[15px] leading-tight text-black"
        >
          ขอใบกำกับภาษี
          <span className="block text-[13px] text-[#808080]">
            ไม่บังคับ · VAT 7% รวมในราคาแล้ว
          </span>
        </label>
        <Switch
          id="pos-tax-toggle"
          checked={enabled}
          disabled={disabled}
          controls="pos-tax-fields"
          onCheckedChange={onToggle}
        />
      </div>

      {enabled && (
        <div id="pos-tax-fields" className="mt-3 space-y-2">
          <div>
            <label
              htmlFor="pos-tax-companyOrBuyerName"
              className="mb-1 block text-[14px]"
            >
              ชื่อผู้ซื้อ / บริษัท *
            </label>
            <input
              id="pos-tax-companyOrBuyerName"
              type="text"
              placeholder="เช่น บริษัท ตัวอย่าง จำกัด"
              value={values.companyOrBuyerName}
              aria-invalid={Boolean(errors.companyOrBuyerName)}
              aria-describedby={describedBy("companyOrBuyerName")}
              onChange={(event) =>
                onChange("companyOrBuyerName", event.target.value)
              }
              className={fieldClass}
            />
            {error("companyOrBuyerName")}
          </div>

          <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-2">
            <div>
              <label htmlFor="pos-tax-taxId" className="mb-1 block text-[14px]">
                เลขผู้เสียภาษี *
              </label>
              <input
                id="pos-tax-taxId"
                type="text"
                inputMode="numeric"
                maxLength={20}
                placeholder="13 หลัก"
                value={values.taxId}
                aria-invalid={Boolean(errors.taxId)}
                aria-describedby={describedBy("taxId")}
                onChange={(event) => onChange("taxId", event.target.value)}
                className={`${fieldClass} tabular-nums`}
              />
              {error("taxId")}
            </div>

            <div>
              <label
                htmlFor="pos-tax-branchNumber"
                className="mb-1 block text-[14px]"
              >
                เลขสาขา
              </label>
              <input
                id="pos-tax-branchNumber"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="00000"
                value={values.branchNumber}
                aria-invalid={Boolean(errors.branchNumber)}
                aria-describedby={describedBy("branchNumber")}
                onChange={(event) =>
                  onChange("branchNumber", event.target.value)
                }
                className={`${fieldClass} tabular-nums`}
              />
              {error("branchNumber")}
            </div>
          </div>

          <div>
            <label
              htmlFor="pos-tax-address"
              className="mb-1 block text-[14px]"
            >
              ที่อยู่ *
            </label>
            <textarea
              id="pos-tax-address"
              rows={2}
              placeholder="ที่อยู่ตามที่จดทะเบียน"
              value={values.address}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={describedBy("address")}
              onChange={(event) => onChange("address", event.target.value)}
              className="w-full resize-none rounded-[20px] border border-[#EBEBEB] bg-white px-5 py-3 text-[15px] leading-snug text-black outline-none placeholder:text-[#CACACA] focus:border-[#2495FF] aria-[invalid=true]:border-[#E53935]"
            />
            {error("address")}
          </div>

          {total > 0 && (
            <dl className="border-t border-[#EBEBEB] pt-2 text-[14px]">
              <div className="flex justify-between">
                <dt>มูลค่าก่อน VAT</dt>
                <dd className="tabular-nums text-black">
                  {formatMoney(beforeVat)}
                </dd>
              </div>
              <div className="mt-1 flex justify-between">
                <dt>VAT 7%</dt>
                <dd className="tabular-nums text-black">{formatMoney(vat)}</dd>
              </div>
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
