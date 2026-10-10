export interface CustomerRecord {
  customerId: number;
  firstName: string;
  lastName: string;
  phone: string;
  taxNumber: string | null;
  idCard: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  taxNumber: string;
  address: string;
}

export type CustomerFormErrors = Partial<
  Record<keyof CustomerFormValues, string>
>;

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  taxNumber: "",
  address: "",
};

export function toCustomerForm(customer: CustomerRecord): CustomerFormValues {
  return {
    firstName: customer.firstName ?? "",
    lastName: customer.lastName ?? "",
    phone: customer.phone ?? "",
    taxNumber: customer.taxNumber ?? "",
    address: customer.address ?? "",
  };
}

export function customerName(customer: CustomerRecord) {
  return `${customer.firstName} ${customer.lastName}`.trim();
}

export function validateCustomer(
  values: CustomerFormValues,
): CustomerFormErrors {
  const errors: CustomerFormErrors = {};

  if (values.firstName.trim() === "") {
    errors.firstName = "กรุณากรอกชื่อ";
  } else if (values.firstName.trim().length > 255) {
    errors.firstName = "ชื่อต้องไม่เกิน 255 ตัวอักษร";
  }

  if (values.lastName.trim() === "") {
    errors.lastName = "กรุณากรอกนามสกุล";
  } else if (values.lastName.trim().length > 255) {
    errors.lastName = "นามสกุลต้องไม่เกิน 255 ตัวอักษร";
  }

  const phone = values.phone.replace(/[\s-]/g, "");
  if (phone === "") {
    errors.phone = "กรุณากรอกเบอร์โทรศัพท์";
  } else if (!/^\d{9,10}$/.test(phone)) {
    errors.phone = "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก";
  }

  const taxNumber = values.taxNumber.replace(/[\s-]/g, "");
  if (taxNumber !== "" && !/^\d{13}$/.test(taxNumber)) {
    errors.taxNumber = "เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก";
  }

  return errors;
}
