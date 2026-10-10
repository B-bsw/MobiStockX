"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
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
import { Field, controlClass } from "@/components/ui/field";
import {
  EMPTY_CUSTOMER_FORM,
  toCustomerForm,
  validateCustomer,
  type CustomerFormErrors,
  type CustomerFormValues,
  type CustomerRecord,
} from "@/types/customers/types";

interface CustomerDialogProps {
  open: boolean;
  customer: CustomerRecord | null;
  saving: boolean;
  error: string;
  onOpenChange: (open: boolean) => void;
  onSave: (values: CustomerFormValues) => void;
}

export function CustomerDialog({
  open,
  customer,
  saving,
  error,
  onOpenChange,
  onSave,
}: CustomerDialogProps) {
  const editing = customer !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && saving) return;
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "แก้ไขข้อมูลติดต่อและข้อมูลสำหรับออกใบกำกับภาษี"
              : "บันทึกลูกค้าใหม่เพื่อใช้ในการขายและออกใบกำกับภาษี"}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <CustomerFields
            key={customer?.customerId ?? "new"}
            customer={customer}
            saving={saving}
            error={error}
            onCancel={() => onOpenChange(false)}
            onSave={onSave}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface CustomerFieldsProps {
  customer: CustomerRecord | null;
  saving: boolean;
  error: string;
  onCancel: () => void;
  onSave: (values: CustomerFormValues) => void;
}

function CustomerFields({
  customer,
  saving,
  error,
  onCancel,
  onSave,
}: CustomerFieldsProps) {
  const [values, setValues] = useState<CustomerFormValues>(() =>
    customer ? toCustomerForm(customer) : EMPTY_CUSTOMER_FORM,
  );
  const [errors, setErrors] = useState<CustomerFormErrors>({});

  function change<K extends keyof CustomerFormValues>(
    field: K,
    value: CustomerFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateCustomer(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onSave(values);
  }

  const describedBy = (field: keyof CustomerFormValues) =>
    errors[field] ? `customer-${field}-error` : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-col">
      <DialogBody className="space-y-4">
        {error !== "" ? <Alert tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="customer-firstName"
            label="ชื่อ"
            required
            error={errors.firstName}
          >
            <input
              id="customer-firstName"
              type="text"
              autoFocus
              value={values.firstName}
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={describedBy("firstName")}
              onChange={(event) => change("firstName", event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field
            id="customer-lastName"
            label="นามสกุล"
            required
            error={errors.lastName}
          >
            <input
              id="customer-lastName"
              type="text"
              value={values.lastName}
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={describedBy("lastName")}
              onChange={(event) => change("lastName", event.target.value)}
              className={controlClass}
            />
          </Field>
        </div>

        <Field
          id="customer-phone"
          label="เบอร์โทรศัพท์"
          required
          error={errors.phone}
        >
          <input
            id="customer-phone"
            type="tel"
            inputMode="numeric"
            placeholder="0812345678"
            value={values.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone")}
            onChange={(event) => change("phone", event.target.value)}
            className={`${controlClass} tabular-nums`}
          />
        </Field>

        <Field
          id="customer-taxNumber"
          label="เลขประจำตัวผู้เสียภาษี"
          error={errors.taxNumber}
          hint={
            errors.taxNumber
              ? undefined
              : "ไม่บังคับ · กรอกไว้เพื่อใช้ออกใบกำกับภาษีที่หน้า POS"
          }
        >
          <input
            id="customer-taxNumber"
            type="text"
            inputMode="numeric"
            maxLength={20}
            placeholder="13 หลัก"
            value={values.taxNumber}
            aria-invalid={Boolean(errors.taxNumber)}
            aria-describedby={
              describedBy("taxNumber") ?? "customer-taxNumber-hint"
            }
            onChange={(event) => change("taxNumber", event.target.value)}
            className={`${controlClass} tabular-nums`}
          />
        </Field>

        <Field id="customer-address" label="ที่อยู่">
          <textarea
            id="customer-address"
            rows={3}
            placeholder="ที่อยู่สำหรับออกใบกำกับภาษีหรือจัดส่ง"
            value={values.address}
            onChange={(event) => change("address", event.target.value)}
            className="w-full resize-none rounded-lg border bg-card px-3 py-2.5 text-sm leading-snug text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </Field>
      </DialogBody>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          size="touch"
          disabled={saving}
          onClick={onCancel}
        >
          ยกเลิก
        </Button>
        <Button type="submit" size="touch" disabled={saving}>
          {saving ? "กำลังบันทึก…" : "บันทึก"}
        </Button>
      </DialogFooter>
    </form>
  );
}
