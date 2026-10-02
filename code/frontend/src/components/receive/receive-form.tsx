"use client";

import { useState, type FormEvent } from "react";

import { Plus } from "lucide-react";

import { api } from "@/lib/api";

import { suppliers } from "@/datas/receive/data";

import type { ReceiveLine } from "@/types/receive/types";

import type { ProductModel } from "@/types/products/types";

import { PanelSection } from "@/components/ui/panel";

import { ReceiveItemRow } from "./receive-item-row";

function createLine(id: string): ReceiveLine {
  return {
    id,
    modelId: "",
    quantity: "1",
    costPrice: "",
    sellingPrice: "",
    grade: "A+",
    serialNumber: "",
    supplier: suppliers[0],
    invoice: "",
    note: "",
  };
}

interface ReceiveFormProps {
  models: ProductModel[];
  onReceived: () => void;
}

export function ReceiveForm({
  models,
  onReceived,
}: ReceiveFormProps) {
  const [lines, setLines] = useState<ReceiveLine[]>([
    createLine("initial"),
  ]);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  function changeLine(
    id: string,
    field: keyof Omit<ReceiveLine, "id">,
    value: string,
  ) {
    setMessage("");

    setLines((current) =>
      current.map((line) =>
        line.id === id
          ? { ...line, [field]: value }
          : line,
      ),
    );
  }

  function selectModel(
    id: string,
    modelId: string,
  ) {
    const model = models.find(
      (item) => String(item.modelId) === modelId,
    );

    setMessage("");

    setLines((current) =>
      current.map((line) =>
        line.id === id
          ? {
              ...line,
              modelId,
              costPrice:
                line.costPrice ||
                String(model?.standardCost ?? ""),
              sellingPrice:
                line.sellingPrice ||
                String(model?.standardPrice ?? ""),
            }
          : line,
      ),
    );
  }

  function addLine() {
    setMessage("");

    setLines((current) => [
      ...current,
      createLine(crypto.randomUUID()),
    ]);
  }

  function removeLine(id: string) {
    setMessage("");

    setLines((current) => {
      if (current.length <= 1) {
        return current;
      }

      return current.filter(
        (line) => line.id !== id,
      );
    });
  }

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setIsError(false);

    const valid = lines.every((line) => {
      const quantity = Number(line.quantity);

      return (
        models.some(
          (model) =>
            String(model.modelId) === line.modelId,
        ) &&
        Number.isSafeInteger(quantity) &&
        quantity > 0 &&
        quantity <= 50 &&
        Number(line.costPrice) >= 0 &&
        Number(line.sellingPrice) > 0
      );
    });

    if (!valid) {
      setIsError(true);

      setMessage(
        "กรุณาเลือกสินค้า ระบุจำนวน 1 ถึง 50 และกรอกต้นทุนกับราคาขายให้ถูกต้อง",
      );

      return;
    }

    setSaving(true);

    let created = 0;
    let failed = 0;

    for (const line of lines) {
      const quantity = Number(line.quantity);

      for (
        let index = 0;
        index < quantity;
        index += 1
      ) {
        const serial = line.serialNumber.trim();

        try {
          await api.post("/products/items", {
            modelId: Number(line.modelId),

            serialNumber:
              serial === ""
                ? null
                : quantity === 1
                  ? serial
                  : `${serial}-${index + 1}`,

            imei: null,
            condition: "NEW",
            grade: line.grade || null,
            batteryHealth: 100,
            costPrice: Number(line.costPrice),
            sellingPrice: Number(line.sellingPrice),
            warrantyExpireDate: null,
          });

          created += 1;
        } catch {
          failed += 1;
        }
      }
    }

    setSaving(false);

    if (created > 0) {
      setLines([
        createLine(crypto.randomUUID()),
      ]);

      onReceived();
    }

    setIsError(created === 0);

    setMessage(
      failed === 0
        ? `รับสินค้าเข้าคลังสำเร็จ ${created} เครื่อง`
        : `สำเร็จ ${created} เครื่อง ไม่สำเร็จ ${failed} เครื่อง (Serial อาจซ้ำกับที่มีอยู่)`,
    );
  }

  return (
    <form onSubmit={submit}>
      <PanelSection
        title="บันทึกการรับสินค้าใหม่"
        description="เพิ่มรายการสินค้าและรายละเอียดสำหรับนำเข้าคลัง"
      >
        <div className="space-y-4">
          <ReceiveItemRow
            line={lines[0]}
            models={models}
            removable={false}
            onChange={(id, field, value) => {
              if (field === "modelId") {
                selectModel(id, value);
              } else {
                changeLine(id, field, value);
              }
            }}
            onRemove={removeLine}
          />

          {lines.length > 1 && (
            <div className="space-y-4">
              {lines.slice(1).map((line) => (
                <div
                  key={line.id}
                  className="border-t border-[#EBEBEB] pt-4"
                >
                  <ReceiveItemRow
                    line={line}
                    models={models}
                    removable
                    onChange={(id, field, value) => {
                      if (field === "modelId") {
                        selectModel(id, value);
                      } else {
                        changeLine(
                          id,
                          field,
                          value,
                        );
                      }
                    }}
                    onRemove={removeLine}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </PanelSection>

      <div className="flex flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={addLine}
          disabled={saving}
          className="h-11 rounded-lg border border-[#D9E0E8] bg-white px-4 text-sm font-medium text-[#404040] transition hover:bg-[#F8F9FB] disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <Plus
              size={16}
              aria-hidden="true"
            />
            เพิ่มรายการ
          </span>
        </button>

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-lg bg-[#7FBFFF] px-5 text-sm font-medium text-white transition hover:bg-[#68AEF4] disabled:opacity-50"
        >
          {saving
            ? "กำลังบันทึก…"
            : "ยืนยันการรับสินค้า"}
        </button>
      </div>

      {message && (
        <div className="px-4 pb-4 sm:px-6">
          <p
            className={
              isError
                ? "text-sm text-[#E53935]"
                : "text-sm text-[#606060]"
            }
          >
            {message}
          </p>
        </div>
      )}
    </form>
  );
}