"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

import { api } from "@/lib/api";
import { suppliers } from "@/datas/receive/data";

import type { ReceiveLine } from "@/types/receive/types";
import type { ProductModel } from "@/types/products/types";

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

  function selectModel(id: string, modelId: string) {
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
    <section className="bg-white px-6 py-6 xl:px-10">
      {/* หัวข้อ */}
      <div className="mb-7">
        <h2 className="text-[20px] font-semibold text-[#292929]">
          บันทึกการรับสินค้าใหม่
        </h2>

        <p className="mt-1 text-[16px] text-[#606060]">
          เพิ่มรายการสินค้าและรายละเอียดสำหรับนำเข้าคลัง
        </p>
      </div>

      <form onSubmit={submit}>
        {/* รายละเอียดสินค้า */}
        <div className="border-b border-[#EBEBEB] pb-8">
          <ReceiveItemRow
            line={lines[0]}
            models={models}
            removable={false}
            onChange={(id, field, value) =>
              field === "modelId"
                ? selectModel(id, value)
                : changeLine(id, field, value)
            }
            onRemove={(id) =>
              setLines((current) =>
                current.filter(
                  (item) => item.id !== id,
                ),
              )
            }
          />

          {/* รายการเพิ่มเติม */}
          {lines.length > 1 && (
            <div className="mt-8 space-y-8">
              {lines.slice(1).map((line) => (
                <div
                  key={line.id}
                  className="border-t border-[#EBEBEB] pt-8"
                >
                  <ReceiveItemRow
                    line={line}
                    models={models}
                    removable
                    onChange={(id, field, value) =>
                      field === "modelId"
                        ? selectModel(id, value)
                        : changeLine(
                            id,
                            field,
                            value,
                          )
                    }
                    onRemove={(id) =>
                      setLines((current) =>
                        current.filter(
                          (item) =>
                            item.id !== id,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ปุ่ม */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setLines((current) => [
                ...current,
                createLine(crypto.randomUUID()),
              ]);

              setMessage("");
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#D9E0E8] bg-white px-5 text-[16px] text-[#606060] transition hover:bg-[#F8F9FB] disabled:opacity-50"
          >
            <Plus
              size={20}
              aria-hidden="true"
            />

            เพิ่มรายการ
          </button>

          <button
            type="submit"
            disabled={
              saving || models.length === 0
            }
            className="h-12 rounded-full bg-[#7FBFFF] px-7 text-[16px] text-white transition hover:bg-[#68AEF4] disabled:opacity-50"
          >
            {saving
              ? "กำลังบันทึก..."
              : "ยืนยันการรับสินค้า"}
          </button>
        </div>

        {/* ข้อความสถานะ */}
        {message && (
          <p
            role="status"
            className={`mt-4 text-sm ${
              isError
                ? "text-[#E53935]"
                : "text-[#249447]"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}