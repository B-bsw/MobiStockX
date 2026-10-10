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
import { Field, SelectControl, controlClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  CLAIM_STATUS_LABEL,
  CLAIM_TRANSITIONS,
  type ClaimRecord,
  type ClaimStatus,
} from "@/types/claims/types";

interface ClaimStatusDialogProps {
  open: boolean;
  claim: ClaimRecord | null;
  saving: boolean;
  error: string;
  onOpenChange: (open: boolean) => void;
  onSave: (values: { claimStatus: ClaimStatus; resolution: string }) => void;
}

export function ClaimStatusDialog({
  open,
  claim,
  saving,
  error,
  onOpenChange,
  onSave,
}: ClaimStatusDialogProps) {
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
          <DialogTitle>อัปเดตสถานะการเคลม</DialogTitle>
          <DialogDescription>
            {claim
              ? `${claim.claimCode} · IMEI ${claim.itemImei}`
              : "เลือกสถานะถัดไปของการเคลม"}
          </DialogDescription>
        </DialogHeader>

        {open && claim ? (
          <StatusFields
            key={claim.claimId}
            claim={claim}
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

interface StatusFieldsProps {
  claim: ClaimRecord;
  saving: boolean;
  error: string;
  onCancel: () => void;
  onSave: (values: { claimStatus: ClaimStatus; resolution: string }) => void;
}

function StatusFields({
  claim,
  saving,
  error,
  onCancel,
  onSave,
}: StatusFieldsProps) {
  const options = CLAIM_TRANSITIONS[claim.claimStatus];
  const [claimStatus, setClaimStatus] = useState<ClaimStatus | "">(
    options[0] ?? "",
  );
  const [resolution, setResolution] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (claimStatus === "") return;
    onSave({ claimStatus, resolution: resolution.trim() });
  }

  if (options.length === 0) {
    return (
      <>
        <DialogBody>
          <Alert tone="info">
            การเคลมนี้ปิดแล้ว ({CLAIM_STATUS_LABEL[claim.claimStatus]})
            ไม่สามารถเปลี่ยนสถานะได้อีก
          </Alert>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel}>
            ปิด
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-col">
      <DialogBody className="space-y-4">
        {error !== "" ? <Alert tone="danger">{error}</Alert> : null}

        <Field
          id="claim-status"
          label="สถานะถัดไป"
          required
          hint={`สถานะปัจจุบัน: ${CLAIM_STATUS_LABEL[claim.claimStatus]}`}
        >
          <SelectControl
            id="claim-status"
            value={claimStatus}
            onChange={(event) =>
              setClaimStatus(event.target.value as ClaimStatus)
            }
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {CLAIM_STATUS_LABEL[option]}
              </option>
            ))}
          </SelectControl>
        </Field>

        <Field id="claim-resolution" label="บันทึกการดำเนินการ">
          <textarea
            id="claim-resolution"
            rows={3}
            value={resolution}
            className={cn(controlClass, "h-auto py-2.5")}
            onChange={(event) => setResolution(event.target.value)}
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
        <Button type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก…" : "บันทึก"}
        </Button>
      </DialogFooter>
    </form>
  );
}
