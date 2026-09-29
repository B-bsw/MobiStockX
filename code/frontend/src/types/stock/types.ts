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

export const ITEM_STATUS_STYLE: Record<ItemStatus, string> = {
  AVAILABLE: "bg-[#DDF6E2] text-[#249447]",
  RESERVED: "bg-[#FFF4D6] text-[#B4820A]",
  SOLD: "bg-[#DCEEFF] text-[#2580D9]",
  DAMAGED: "bg-[#FFE4E4] text-[#E53935]",
  CLAIMING: "bg-[#F3E8FF] text-[#7C3AED]",
};
