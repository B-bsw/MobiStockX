export interface PosProduct {
  id: number;
  name: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  /** Serialized models are sold per unit, picked by serial number / IMEI. */
  isSerialized: boolean;
}

/** A single physical unit in stock, identified by its serial number or IMEI. */
export interface PosItem {
  itemId: number;
  serialNumber: string | null;
  imei: string | null;
  grade: string | null;
  condition: string | null;
  batteryHealth: number | null;
  price: number;
}

export interface CartItem {
  /** Unique per cart row: a model line and each picked unit are separate rows. */
  lineId: string;
  product: PosProduct;
  /** null when the row is a plain model line without a chosen unit. */
  item: PosItem | null;
  quantity: number;
}

export type PosTab = "sale" | "history";

export function lineIdOf(modelId: number, itemId: number | null) {
  return itemId === null ? `model-${modelId}` : `item-${itemId}`;
}

/** What the cashier reads on the receipt line: IMEI wins, serial is the fallback. */
export function itemLabel(item: PosItem) {
  if (item.imei) return `IMEI ${item.imei}`;
  if (item.serialNumber) return `S/N ${item.serialNumber}`;
  return `เครื่อง #${item.itemId}`;
}

export function matchesIdentifier(item: PosItem, query: string) {
  return [item.imei, item.serialNumber].some((value) =>
    (value ?? "").toLowerCase().includes(query),
  );
}
