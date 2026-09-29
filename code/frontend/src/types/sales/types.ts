export type SaleStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export type PaymentMethod = "CASH" | "TRANSFER" | "CREDIT_CARD" | "INSTALLMENT";

export interface SaleOrderItem {
  saleItemId: number;
  modelId: number;
  modelName: string;
  itemId: number | null;
  itemSerialNumber: string | null;
  itemImei: string | null;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
}

export interface SaleOrder {
  saleId: number;
  saleCode: string;
  saleDate: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  createdByUserId: number;
  createdByUserName: string;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: SaleStatus;
  items: SaleOrderItem[];
}

export interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  phone: string;
}

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "เงินสด" },
  { value: "TRANSFER", label: "โอนเงิน" },
  { value: "CREDIT_CARD", label: "บัตรเครดิต" },
  { value: "INSTALLMENT", label: "ผ่อนชำระ" },
];

export const SALE_STATUS_LABEL: Record<SaleStatus, string> = {
  PENDING: "รอดำเนินการ",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
};
