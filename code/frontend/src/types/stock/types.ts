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
