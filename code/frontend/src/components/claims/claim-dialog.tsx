"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck, ShieldX } from "lucide-react";
import { api } from "@/lib/api";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import {
  isWarrantyValid,
  type ImeiOption,
  type WarrantyRecord,
} from "@/types/claims/types";
import { ImeiCombobox, fetchClaimableImeis } from "./imei-combobox";

interface ClaimDialogProps {
  open: boolean;
  saving: boolean;
  error: string;
  onOpenChange: (open: boolean) => void;
  onSave: (values: { imei: string; symptom: string }) => void;
}

export function ClaimDialog({
  open,
  saving,
  error,
  onOpenChange,
  onSave,
}: ClaimDialogProps) {
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
          <DialogTitle>แจ้งเคลมสินค้า</DialogTitle>
          <DialogDescription>
            กรอก IMEI เพื่อตรวจสอบสิทธิ์ประกัน แล้วบันทึกอาการเสียของเครื่อง
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <ClaimFields
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

interface ClaimFieldsProps {
  saving: boolean;
  error: string;
  onCancel: () => void;
  onSave: (values: { imei: string; symptom: string }) => void;
}

function ClaimFields({ saving, error, onCancel, onSave }: ClaimFieldsProps) {
  const [imei, setImei] = useState("");
  const [symptom, setSymptom] = useState("");
  const [errors, setErrors] = useState<{ imei?: string; symptom?: string }>({});

  const [warranty, setWarranty] = useState<WarrantyRecord | null>(null);
  const [checking, setChecking] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const [options, setOptions] = useState<ImeiOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Mounted only while the dialog is open, so this runs once per open.
  useEffect(() => {
    let active = true;

    const getOptions = async () => {
      try {
        const loaded = await fetchClaimableImeis();
        if (active) setOptions(loaded);
      } catch {
        // The field still accepts a typed IMEI, so a failed list isn't fatal.
        if (active) setOptions([]);
      } finally {
        if (active) setOptionsLoading(false);
      }
    };

    getOptions();
    return () => {
      active = false;
    };
  }, []);

  async function checkWarranty(code = imei) {
    const value = code.trim();

    if (!/^\d{15}$/.test(value)) {
      setErrors((current) => ({ ...current, imei: "IMEI ต้องเป็นตัวเลข 15 หลัก" }));
      return;
    }

    setChecking(true);
    setLookupError("");
    setWarranty(null);

    try {
      const response = await api.get(`/claims/warranty/${value}`);
      setWarranty(response.data.data);
    } catch (caught) {
      const status = (caught as { response?: { status?: number } }).response
        ?.status;
      setLookupError(
        status === 404
          ? "ไม่พบข้อมูลประกันของ IMEI นี้ เครื่องนี้อาจไม่ได้ขายผ่านระบบ"
          : "ตรวจสอบประกันไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setChecking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found: { imei?: string; symptom?: string } = {};
    if (!/^\d{15}$/.test(imei.trim())) {
      found.imei = "IMEI ต้องเป็นตัวเลข 15 หลัก";
    }
    if (symptom.trim() === "") {
      found.symptom = "กรุณาระบุอาการเสีย";
    }

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onSave({ imei: imei.trim(), symptom: symptom.trim() });
  }

  const valid = warranty !== null && isWarrantyValid(warranty);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-col">
      <DialogBody className="space-y-4">
        {error !== "" ? <Alert tone="danger">{error}</Alert> : null}

        <Field
          id="claim-imei"
          label="IMEI เครื่อง"
          required
          error={errors.imei}
          hint="พิมพ์เพื่อค้นหา หรือเลือกจากรายการ IMEI ของเครื่องที่ขายแล้ว"
        >
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <ImeiCombobox
                id="claim-imei"
                value={imei}
                options={options}
                loading={optionsLoading}
                disabled={saving}
                invalid={Boolean(errors.imei)}
                describedBy={errors.imei ? "claim-imei-error" : undefined}
                onValueChange={(next) => {
                  setImei(next);
                  setErrors((current) => ({ ...current, imei: undefined }));
                  setWarranty(null);
                  setLookupError("");
                }}
                onSelect={(option) => {
                  // Picking from the list is an explicit choice: check it now.
                  setErrors((current) => ({ ...current, imei: undefined }));
                  setWarranty(null);
                  setLookupError("");
                  checkWarranty(option.imei);
                }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              disabled={checking || saving}
              onClick={() => checkWarranty()}
            >
              {checking ? "กำลังตรวจ…" : "ตรวจสอบ"}
            </Button>
          </div>
        </Field>

        {lookupError !== "" ? <Alert tone="danger">{lookupError}</Alert> : null}

        {warranty !== null ? (
          <div className="rounded-lg border bg-secondary/40 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-foreground">
                {warranty.warrantyCode}
              </span>
              <Badge tone={valid ? "success" : "danger"}>
                {valid ? (
                  <ShieldCheck aria-hidden="true" className="size-3.5" />
                ) : (
                  <ShieldX aria-hidden="true" className="size-3.5" />
                )}
                {valid ? "อยู่ในระยะประกัน" : "ประกันหมดอายุ"}
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground">
              คุ้มครอง {warranty.startDate} ถึง {warranty.expireDate}
            </p>
          </div>
        ) : null}

        <Field
          id="claim-symptom"
          label="อาการเสีย"
          required
          error={errors.symptom}
        >
          <textarea
            id="claim-symptom"
            rows={4}
            value={symptom}
            aria-invalid={Boolean(errors.symptom)}
            aria-describedby={
              errors.symptom ? "claim-symptom-error" : undefined
            }
            className={cn(controlClass, "h-auto py-2.5")}
            onChange={(event) => {
              setSymptom(event.target.value);
              setErrors((current) => ({ ...current, symptom: undefined }));
            }}
          />
        </Field>
      </DialogBody>

      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          disabled={saving}
          onClick={onCancel}
        >
          ยกเลิก
        </Button>
        <Button type="submit" disabled={saving || !valid}>
          {saving ? "กำลังบันทึก…" : "บันทึกการเคลม"}
        </Button>
      </DialogFooter>
    </form>
  );
}
