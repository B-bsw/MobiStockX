import type { ReceiveRecord } from "@/types/receive/types";

export const suppliers = [
  "ผู้จำหน่าย Apple ไทย",
  "Samsung Authorized Dist.",
  "บริษัท เทคโกลบอล จำกัด",
];

export const initialReceiveHistory: ReceiveRecord[] = [
  { id: "sample-1", date: "2026-09-09", product: "Google Pixel 8 Pro", quantity: 10, supplier: suppliers[0], invoice: "INV-2026-XXX", note: "" },
  { id: "sample-2", date: "2026-09-09", product: "OnePlus 12", quantity: 5, supplier: suppliers[1], invoice: "INV-2026-XXX", note: "" },
  { id: "sample-3", date: "2026-09-09", product: "Realme GT6", quantity: 12, supplier: suppliers[2], invoice: "INV-2026-XXX", note: "" },
];
