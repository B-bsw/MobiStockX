import type { BadgeTone } from "@/components/ui/badge";

export type ItemStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "DAMAGED"
  | "CLAIMING";

export interface ProductItem {
  itemId: number;
  modelId: number;
  modelName: string;
  serialNumber: string | null;
  imei: string | null;
  condition: string | null;
  grade: string | null;
  batteryHealth: number | null;
  costPrice: number;
  sellingPrice: number;
  status: ItemStatus;
  warrantyExpireDate: string | null;
  createdAt: string;
}

export type ItemCondition = "NEW" | "SECOND_HAND";

export interface StockEditForm {
  serialNumber: string;
  imei: string;
  grade: string;
  condition: ItemCondition;
  batteryHealth: string;
  costPrice: string;
  sellingPrice: string;
  status: ItemStatus;
}

export type StockEditErrors = Partial<Record<keyof StockEditForm, string>>;

export const GRADE_OPTIONS = ["A", "B", "C", "D"] as const;

export const CONDITION_LABEL: Record<ItemCondition, string> = {
  NEW: "เครื่องใหม่",
  SECOND_HAND: "เครื่องมือสอง",
};

export const STATUS_OPTIONS: readonly ItemStatus[] = [
  "AVAILABLE",
  "RESERVED",
  "DAMAGED",
  "CLAIMING",
  "SOLD",
];

export function toEditForm(item: ProductItem): StockEditForm {
  return {
    serialNumber: item.serialNumber ?? "",
    imei: item.imei ?? "",
    grade: item.grade ?? "",
    condition: (item.condition as ItemCondition) ?? "NEW",
    batteryHealth:
      item.batteryHealth === null ? "" : String(item.batteryHealth),
    costPrice: String(item.costPrice ?? ""),
    sellingPrice: String(item.sellingPrice ?? ""),
    status: item.status,
  };
}

export function validateStockEdit(values: StockEditForm): StockEditErrors {
  const errors: StockEditErrors = {};

  const imei = values.imei.trim();
  if (imei !== "" && !/^\d{15}$/.test(imei)) {
    errors.imei = "IMEI ต้องเป็นตัวเลข 15 หลัก";
  }

  if (values.grade.trim().length > 10) {
    errors.grade = "เกรดต้องไม่เกิน 10 ตัวอักษร";
  }

  const battery = values.batteryHealth.trim();
  if (battery !== "") {
    const value = Number(battery);
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      errors.batteryHealth = "สุขภาพแบตเตอรี่ต้องเป็นจำนวนเต็ม 0-100";
    }
  }

  const cost = Number(values.costPrice);
  if (values.costPrice.trim() === "" || Number.isNaN(cost) || cost < 0) {
    errors.costPrice = "ต้นทุนต้องเป็นตัวเลขไม่ติดลบ";
  }

  const selling = Number(values.sellingPrice);
  if (values.sellingPrice.trim() === "" || Number.isNaN(selling)) {
    errors.sellingPrice = "กรุณากรอกราคาขาย";
  } else if (selling <= 0) {
    errors.sellingPrice = "ราคาขายต้องมากกว่า 0";
  }

  return errors;
}

export const ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  AVAILABLE: "พร้อมขาย",
  RESERVED: "จองแล้ว",
  SOLD: "ขายแล้ว",
  DAMAGED: "ชำรุด",
  CLAIMING: "เคลมอยู่",
};

/**
 * Badge tone per status. Each tone resolves to a token pair that clears
 * 4.5:1, which the hand-written hex classes this replaced did not.
 */
export const ITEM_STATUS_TONE: Record<ItemStatus, BadgeTone> = {
  AVAILABLE: "success",
  RESERVED: "warning",
  SOLD: "info",
  DAMAGED: "danger",
  CLAIMING: "violet",
};
