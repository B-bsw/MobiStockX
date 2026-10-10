import type { BadgeTone } from "@/components/ui/badge";

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
  taxNumber: string | null;
  address: string | null;
}

export interface TaxInvoice {
  invoiceId: number;
  invoiceNumber: string;
  companyOrBuyerName: string;
  taxId: string;
  branchNumber: string;
  address: string;
  subtotalAmount: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  issuedAt: string;
  pdfUrl: string | null;
}

export interface TaxInvoiceForm {
  companyOrBuyerName: string;
  taxId: string;
  branchNumber: string;
  address: string;
}

export const EMPTY_TAX_INVOICE: TaxInvoiceForm = {
  companyOrBuyerName: "",
  taxId: "",
  branchNumber: "00000",
  address: "",
};

export type TaxInvoiceErrors = Partial<Record<keyof TaxInvoiceForm, string>>;

export function validateTaxInvoice(values: TaxInvoiceForm): TaxInvoiceErrors {
  const errors: TaxInvoiceErrors = {};

  if (values.companyOrBuyerName.trim() === "") {
    errors.companyOrBuyerName = "กรุณากรอกชื่อผู้ซื้อหรือบริษัท";
  }

  const taxId = values.taxId.replace(/[\s-]/g, "");
  if (taxId === "") {
    errors.taxId = "กรุณากรอกเลขประจำตัวผู้เสียภาษี";
  } else if (!/^\d{13}$/.test(taxId)) {
    errors.taxId = "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก";
  }

  const branch = values.branchNumber.trim();
  if (branch !== "" && !/^\d{5}$/.test(branch)) {
    errors.branchNumber = "เลขสาขาต้องเป็นตัวเลข 5 หลัก เช่น 00000";
  }

  if (values.address.trim() === "") {
    errors.address = "กรุณากรอกที่อยู่สำหรับออกใบกำกับภาษี";
  }

  return errors;
}

export function vatBreakdown(grandTotal: number) {
  const beforeVat = Math.round((grandTotal / 1.07) * 100) / 100;

  return { beforeVat, vat: Math.round((grandTotal - beforeVat) * 100) / 100 };
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

export const SALE_STATUS_TONE: Record<SaleStatus, BadgeTone> = {
  PENDING: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};
