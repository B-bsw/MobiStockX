"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, SelectControl, controlClass } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  CONDITION_LABEL,
  GRADE_OPTIONS,
  ITEM_STATUS_LABEL,
  STATUS_OPTIONS,
  toEditForm,
  validateStockEdit,
  type ItemCondition,
  type ItemStatus,
  type ProductItem,
  type StockEditErrors,
  type StockEditForm,
} from "@/types/stock/types";

interface StockEditSheetProps {
  item: ProductItem | null;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (itemId: number, values: StockEditForm) => void;
}

export function StockEditSheet({
  item,
  saving,
  error,
  onClose,
  onSave,
}: StockEditSheetProps) {
  return (
    <Sheet
      open={item !== null}
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="border-b px-4 py-4 sm:px-6">
          <SheetTitle>แก้ไขเครื่องในสต๊อก</SheetTitle>
          <SheetDescription>
            {item ? item.modelName : ""}
            {item?.serialNumber ? ` · ${item.serialNumber}` : ""}
          </SheetDescription>
        </SheetHeader>

        {item ? (
          <StockEditFields
            key={item.itemId}
            item={item}
            saving={saving}
            error={error}
            onClose={onClose}
            onSave={onSave}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

interface StockEditFieldsProps {
  item: ProductItem;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (itemId: number, values: StockEditForm) => void;
}

function StockEditFields({
  item,
  saving,
  error,
  onClose,
  onSave,
}: StockEditFieldsProps) {
  const [values, setValues] = useState<StockEditForm>(() => toEditForm(item));
  const [errors, setErrors] = useState<StockEditErrors>({});

  function change<K extends keyof StockEditForm>(
    field: K,
    value: StockEditForm[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateStockEdit(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onSave(item.itemId, values);
  }

  const isSold = item.status === "SOLD";
  const describedBy = (field: keyof StockEditForm) =>
    errors[field] ? `stock-${field}-error` : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4 px-4 py-4 sm:px-6">
        {error !== "" ? <Alert tone="danger">{error}</Alert> : null}

        {isSold ? (
          <Alert tone="warning">
            เครื่องนี้ขายแล้ว แก้ไขรายละเอียดได้ แต่เปลี่ยนสถานะกลับไม่ได้
          </Alert>
        ) : null}

        <Field
          id="stock-serialNumber"
          label="Serial Number"
          error={errors.serialNumber}
          hint={errors.serialNumber ? undefined : "เว้นว่างได้"}
        >
          <input
            id="stock-serialNumber"
            type="text"
            value={values.serialNumber}
            aria-invalid={Boolean(errors.serialNumber)}
            aria-describedby={
              describedBy("serialNumber") ?? "stock-serialNumber-hint"
            }
            onChange={(event) =>
              change("serialNumber", event.target.value)
            }
            className={`${controlClass} tabular-nums`}
          />
        </Field>

        <Field id="stock-imei" label="IMEI" error={errors.imei}>
          <input
            id="stock-imei"
            type="text"
            inputMode="numeric"
            maxLength={15}
            placeholder="15 หลัก"
            value={values.imei}
            aria-invalid={Boolean(errors.imei)}
            aria-describedby={describedBy("imei")}
            onChange={(event) => change("imei", event.target.value)}
            className={`${controlClass} tabular-nums`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id="stock-grade" label="เกรด" error={errors.grade}>
            <SelectControl
              id="stock-grade"
              value={values.grade}
              aria-invalid={Boolean(errors.grade)}
              aria-describedby={describedBy("grade")}
              onChange={(event) => change("grade", event.target.value)}
            >
              <option value="">ไม่ระบุ</option>
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  เกรด {grade}
                </option>
              ))}
            </SelectControl>
          </Field>

          <Field id="stock-condition" label="สภาพเครื่อง">
            <SelectControl
              id="stock-condition"
              value={values.condition}
              onChange={(event) =>
                change("condition", event.target.value as ItemCondition)
              }
            >
              {Object.entries(CONDITION_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectControl>
          </Field>
        </div>

        <Field
          id="stock-batteryHealth"
          label="สุขภาพแบตเตอรี่ (%)"
          error={errors.batteryHealth}
        >
          <input
            id="stock-batteryHealth"
            type="number"
            min="0"
            max="100"
            step="1"
            inputMode="numeric"
            placeholder="ไม่ระบุ"
            value={values.batteryHealth}
            aria-invalid={Boolean(errors.batteryHealth)}
            aria-describedby={describedBy("batteryHealth")}
            onChange={(event) =>
              change("batteryHealth", event.target.value)
            }
            className={`${controlClass} tabular-nums`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field
            id="stock-costPrice"
            label="ต้นทุน"
            required
            error={errors.costPrice}
          >
            <input
              id="stock-costPrice"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={values.costPrice}
              aria-invalid={Boolean(errors.costPrice)}
              aria-describedby={describedBy("costPrice")}
              onChange={(event) =>
                change("costPrice", event.target.value)
              }
              className={`${controlClass} tabular-nums`}
            />
          </Field>

          <Field
            id="stock-sellingPrice"
            label="ราคาขาย"
            required
            error={errors.sellingPrice}
          >
            <input
              id="stock-sellingPrice"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={values.sellingPrice}
              aria-invalid={Boolean(errors.sellingPrice)}
              aria-describedby={describedBy("sellingPrice")}
              onChange={(event) =>
                change("sellingPrice", event.target.value)
              }
              className={`${controlClass} tabular-nums`}
            />
          </Field>
        </div>

        <Field
          id="stock-status"
          label="สถานะ"
          required
          hint={
            isSold
              ? undefined
              : "เปลี่ยนเป็นพร้อมขายหรือออกจากพร้อมขาย ระบบจะปรับยอดสต๊อกของรุ่นให้"
          }
        >
          <SelectControl
            id="stock-status"
            value={values.status}
            disabled={isSold}
            aria-describedby={isSold ? undefined : "stock-status-hint"}
            onChange={(event) =>
              change("status", event.target.value as ItemStatus)
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {ITEM_STATUS_LABEL[status]}
              </option>
            ))}
          </SelectControl>
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button
          type="button"
          size="touch"
          variant="outline"
          disabled={saving}
          onClick={onClose}
        >
          ยกเลิก
        </Button>
        <Button type="submit" size="touch" disabled={saving}>
          {saving ? "กำลังบันทึก…" : "บันทึกการแก้ไข"}
        </Button>
      </div>
    </form>
  );
}
