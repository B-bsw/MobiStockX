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
  "h-[49px] w-full min-w-0 rounded-[19px] border border-[#EBEBEB] bg-white px-4 text-[15px] text-black outline-none placeholder:text-[#808080] focus:border-[#7FBFFF] focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1 block px-2 text-[14px] text-[#808080]";

export function ReceiveItemRow({
  line,
  models,
  removable,
  onChange,
  onRemove,
}: ReceiveItemRowProps) {
  return (
    <div className="rounded-[20px] border border-[#EBEBEB] bg-white p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[2fr_0.7fr_1fr_1fr_1.2fr]">
        <div className="min-w-0">
          <label htmlFor={`model-${line.id}`} className={labelClass}>
            ชื่อสินค้า *
          </label>
          <div className="relative">
            <select
              id={`model-${line.id}`}
              required
              value={line.modelId}
              onChange={(event) =>
                onChange(line.id, "modelId", event.target.value)
              }
              className={`${fieldClass} appearance-none pr-9`}
            >
              <option value="">-เลือกสินค้า-</option>
              {models.map((model) => (
                <option key={model.modelId} value={model.modelId}>
                  {model.modelName}
                  {model.storageCapacity && model.storageCapacity !== "-"
                    ? ` ${model.storageCapacity}`
                    : ""}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-4 text-[#AAAAAA]"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`quantity-${line.id}`} className={labelClass}>
            จำนวน *
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
          <label htmlFor={`cost-${line.id}`} className={labelClass}>
            ต้นทุน/เครื่อง *
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

        <div>
          <label htmlFor={`price-${line.id}`} className={labelClass}>
            ราคาขาย *
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
          <label htmlFor={`serial-${line.id}`} className={labelClass}>
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

      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="min-w-0">
          <label htmlFor={`supplier-${line.id}`} className={labelClass}>
            ซัพพลายเออร์
          </label>
          <div className="relative">
            <select
              id={`supplier-${line.id}`}
              value={line.supplier}
              onChange={(event) =>
                onChange(line.id, "supplier", event.target.value)
              }
              className={`${fieldClass} appearance-none pr-9`}
            >
              {suppliers.map((supplier) => (
                <option key={supplier}>{supplier}</option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-4 text-[#AAAAAA]"
            />
          </div>
        </div>

        <div>
          <label htmlFor={`invoice-${line.id}`} className={labelClass}>
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

        <div>
          <label htmlFor={`note-${line.id}`} className={labelClass}>
            หมายเหตุ
          </label>
          <input
            id={`note-${line.id}`}
            value={line.note}
            placeholder="ไม่บังคับ"
            onChange={(event) => onChange(line.id, "note", event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {removable && (
        <button
          type="button"
          onClick={() => onRemove(line.id)}
          className="mt-2 flex items-center gap-1 px-2 text-sm text-red-500"
        >
          <Trash2 size={15} /> ลบรายการ
        </button>
      )}
    </div>
  );
}
