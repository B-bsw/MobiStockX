"use client";

import { useState, type FormEvent } from "react";
import { ReceiptText } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  validateTaxInvoice,
  vatBreakdown,
  type TaxInvoiceErrors,
  type TaxInvoiceForm,
} from "@/types/sales/types";

interface PosTaxInvoiceProps {
  enabled: boolean;
  values: TaxInvoiceForm;
  total: number;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
  onConfirm: (values: TaxInvoiceForm) => void;
}

const fieldClass =
  "h-[43px] w-full rounded-[20px] border border-[#EBEBEB] bg-white px-5 text-[15px] text-black outline-none placeholder:text-[#CACACA] focus:border-[#2495FF] aria-[invalid=true]:border-[#E53935]";

export function PosTaxInvoice({
  enabled,
  values,
  total,
  disabled,
  onToggle,
  onConfirm,
}: PosTaxInvoiceProps) {
  const [open, setOpen] = useState(false);

  function handleToggle(checked: boolean) {
    onToggle(checked);
    setOpen(checked);
  }

  const filledIn = values.companyOrBuyerName.trim() !== "";

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
          onCheckedChange={handleToggle}
        />
      </div>

      {enabled && (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#EBEBEB] pt-2">
          <p className="min-w-0 truncate text-[13px] text-[#808080]">
            {filledIn ? values.companyOrBuyerName : "ยังไม่กรอกข้อมูล"}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            <ReceiptText aria-hidden="true" />
            {filledIn ? "แก้ไขข้อมูล" : "กรอกข้อมูล"}
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ข้อมูลใบกำกับภาษี</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลผู้ซื้อสำหรับออกใบกำกับภาษีแบบเต็มรูป
            </DialogDescription>
          </DialogHeader>

          <TaxInvoiceFields
            initialValues={values}
            total={total}
            fieldClass={fieldClass}
            onCancel={() => setOpen(false)}
            onConfirm={(next) => {
              onConfirm(next);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TaxInvoiceFieldsProps {
  initialValues: TaxInvoiceForm;
  total: number;
  fieldClass: string;
  onCancel: () => void;
  onConfirm: (values: TaxInvoiceForm) => void;
}

function TaxInvoiceFields({
  initialValues,
  total,
  fieldClass,
  onCancel,
  onConfirm,
}: TaxInvoiceFieldsProps) {
  const [form, setForm] = useState<TaxInvoiceForm>(initialValues);
  const [errors, setErrors] = useState<TaxInvoiceErrors>({});

  const { beforeVat, vat } = vatBreakdown(total);

  function change<K extends keyof TaxInvoiceForm>(
    field: K,
    value: TaxInvoiceForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateTaxInvoice(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onConfirm(form);
  }

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
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-col">
      <DialogBody className="space-y-3">
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
            autoFocus
            placeholder="เช่น บริษัท ตัวอย่าง จำกัด"
            value={form.companyOrBuyerName}
            aria-invalid={Boolean(errors.companyOrBuyerName)}
            aria-describedby={describedBy("companyOrBuyerName")}
            onChange={(event) =>
              change("companyOrBuyerName", event.target.value)
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
              value={form.taxId}
              aria-invalid={Boolean(errors.taxId)}
              aria-describedby={describedBy("taxId")}
              onChange={(event) => change("taxId", event.target.value)}
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
              value={form.branchNumber}
              aria-invalid={Boolean(errors.branchNumber)}
              aria-describedby={describedBy("branchNumber")}
              onChange={(event) => change("branchNumber", event.target.value)}
              className={`${fieldClass} tabular-nums`}
            />
            {error("branchNumber")}
          </div>
        </div>

        <div>
          <label htmlFor="pos-tax-address" className="mb-1 block text-[14px]">
            ที่อยู่ *
          </label>
          <textarea
            id="pos-tax-address"
            rows={3}
            placeholder="ที่อยู่ตามที่จดทะเบียน"
            value={form.address}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={describedBy("address")}
            onChange={(event) => change("address", event.target.value)}
            className="w-full resize-none rounded-[20px] border border-[#EBEBEB] bg-white px-5 py-3 text-[15px] leading-snug text-black outline-none placeholder:text-[#CACACA] focus:border-[#2495FF] aria-[invalid=true]:border-[#E53935]"
          />
          {error("address")}
        </div>

        {total > 0 && (
          <dl className="rounded-[16px] bg-muted px-4 py-3 text-[14px] text-muted-foreground">
            <div className="flex justify-between">
              <dt>มูลค่าก่อน VAT</dt>
              <dd className="tabular-nums text-foreground">
                {formatMoney(beforeVat)}
              </dd>
            </div>
            <div className="mt-1 flex justify-between">
              <dt>VAT 7%</dt>
              <dd className="tabular-nums text-foreground">
                {formatMoney(vat)}
              </dd>
            </div>
            <div className="mt-1 flex justify-between border-t pt-1">
              <dt>ยอดรวม</dt>
              <dd className="tabular-nums text-foreground">
                {formatMoney(total)}
              </dd>
            </div>
          </dl>
        )}
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" size="touch" onClick={onCancel}>
          ยกเลิก
        </Button>
        <Button type="submit" size="touch">
          บันทึกข้อมูล
        </Button>
      </DialogFooter>
    </form>
  );
}
