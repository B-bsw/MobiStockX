import { ChevronDown, Trash2 } from "lucide-react";

import { suppliers } from "@/datas/receive/data";
import type { ReceiveLine } from "@/types/receive/types";
import type { ProductModel } from "@/types/products/types";

interface ReceiveItemRowProps {
  line: ReceiveLine;
  models: ProductModel[];
  removable: boolean;
  onChange: (
    id: string,
    field: keyof Omit<ReceiveLine, "id">,
    value: string,
  ) => void;
  onRemove: (id: string) => void;
}

const fieldClass =
  "h-12 w-full min-w-0 rounded-lg border border-[#D9E0E8] bg-white px-4 text-[15px] text-[#292929] outline-none placeholder:text-[#8A94A3] focus:border-[#7FBFFF] focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-sm font-medium text-[#404040]";

export function ReceiveItemRow({
  line,
  models,
  removable,
  onChange,
  onRemove,
}: ReceiveItemRowProps) {
  return (
    <div className="space-y-5">
      {/* ชื่อสินค้า */}
      <div>
        <label
          htmlFor={`model-${line.id}`}
          className={labelClass}
        >
          ชื่อสินค้า <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <select
            id={`model-${line.id}`}
            required
            value={line.modelId}
            onChange={(event) =>
              onChange(line.id, "modelId", event.target.value)
            }
            className={`${fieldClass} appearance-none pr-10`}
          >
            <option value="">-เลือกสินค้า-</option>

            {models.map((model) => (
              <option
                key={model.modelId}
                value={model.modelId}
              >
                {model.modelName}
                {model.storageCapacity &&
                model.storageCapacity !== "-"
                  ? ` ${model.storageCapacity}`
                  : ""}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#808080]"
          />
        </div>
      </div>

      {/* จำนวน / ต้นทุน */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor={`quantity-${line.id}`}
            className={labelClass}
          >
            จำนวน <span className="text-red-500">*</span>
          </label>

          <input
            id={`quantity-${line.id}`}
            type="number"
            min="1"
            max="50"
            step="1"
            required
            value={line.quantity}
            onChange={(event) =>
              onChange(line.id, "quantity", event.target.value)
            }
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor={`cost-${line.id}`}
            className={labelClass}
          >
            ต้นทุน/เครื่อง <span className="text-red-500">*</span>
          </label>

          <input
            id={`cost-${line.id}`}
            type="number"
            min="0"
            step="0.01"
            required
            value={line.costPrice}
            onChange={(event) =>
              onChange(line.id, "costPrice", event.target.value)
            }
            className={fieldClass}
          />
        </div>
      </div>

      {/* ราคาขาย / Serial */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor={`price-${line.id}`}
            className={labelClass}
          >
            ราคาขาย <span className="text-red-500">*</span>
          </label>

          <input
            id={`price-${line.id}`}
            type="number"
            min="0"
            step="0.01"
            required
            value={line.sellingPrice}
            onChange={(event) =>
              onChange(line.id, "sellingPrice", event.target.value)
            }
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor={`serial-${line.id}`}
            className={labelClass}
          >
            Serial เริ่มต้น
          </label>

          <input
            id={`serial-${line.id}`}
            value={line.serialNumber}
            placeholder="ไม่บังคับ"
            onChange={(event) =>
              onChange(line.id, "serialNumber", event.target.value)
            }
            className={fieldClass}
          />
        </div>
      </div>

      {/* ซัพพลายเออร์ / เลขที่ใบส่งของ */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor={`supplier-${line.id}`}
            className={labelClass}
          >
            ซัพพลายเออร์
          </label>

          <div className="relative">
            <select
              id={`supplier-${line.id}`}
              value={line.supplier}
              onChange={(event) =>
                onChange(line.id, "supplier", event.target.value)
              }
              className={`${fieldClass} appearance-none pr-10`}
            >
              {suppliers.map((supplier) => (
                <option key={supplier}>
                  {supplier}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#808080]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`invoice-${line.id}`}
            className={labelClass}
          >
            เลขที่ใบส่งของ
          </label>

          <input
            id={`invoice-${line.id}`}
            value={line.invoice}
            placeholder="INV-2026-XXX"
            onChange={(event) =>
              onChange(line.id, "invoice", event.target.value)
            }
            className={fieldClass}
          />
        </div>
      </div>

      {/* หมายเหตุ */}
      <div>
        <label
          htmlFor={`note-${line.id}`}
          className={labelClass}
        >
          หมายเหตุ
        </label>

        <input
          id={`note-${line.id}`}
          value={line.note}
          placeholder="ไม่บังคับ"
          onChange={(event) =>
            onChange(line.id, "note", event.target.value)
          }
          className={fieldClass}
        />
      </div>

      {/* ลบรายการ */}
      {removable && (
        <button
          type="button"
          onClick={() => onRemove(line.id)}
          className="flex items-center gap-1.5 text-sm text-red-500 transition hover:text-red-600"
        >
          <Trash2 size={16} />
          ลบรายการ
        </button>
      )}
    </div>
  );
}