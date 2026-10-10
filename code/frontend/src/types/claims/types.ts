export type ClaimStatus =
  | "OPEN"
  | "UNDER_REPAIR"
  | "REPAIRED"
  | "REPLACED"
  | "REJECTED";

export interface WarrantyRecord {
  warrantyId: number;
  warrantyCode: string;
  itemImei: string;
  startDate: string;
  expireDate: string;
  termsConditions: string | null;
  warrantyStatus: string;
  createdAt: string;
}

/** One IMEI the cashier can pick when opening a claim. */
export interface ImeiOption {
  itemId: number;
  imei: string;
  modelName: string;
  serialNumber: string | null;
}

export interface ClaimRecord {
  claimId: number;
  claimCode: string;
  warrantyId: number;
  warrantyCode: string;
  itemImei: string;
  modelName: string | null;
  customerName: string | null;
  warrantyExpireDate: string;
  claimDate: string;
  symptom: string;
  resolution: string | null;
  claimStatus: ClaimStatus;
  closedDate: string | null;
  createdByName: string | null;
  createdAt: string;
}

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  OPEN: "แจ้งเคลม",
  UNDER_REPAIR: "กำลังซ่อม",
  REPAIRED: "ซ่อมเสร็จ / คืนลูกค้า",
  REPLACED: "เปลี่ยนเครื่อง",
  REJECTED: "ปฏิเสธการเคลม",
};

export const CLAIM_STATUS_TONE: Record<
  ClaimStatus,
  "neutral" | "warning" | "success" | "danger"
> = {
  OPEN: "warning",
  UNDER_REPAIR: "warning",
  REPAIRED: "success",
  REPLACED: "neutral",
  REJECTED: "danger",
};

/** Mirrors the server-side state machine in WarrantyClaimServiceImpl. */
export const CLAIM_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  OPEN: ["UNDER_REPAIR", "REJECTED"],
  UNDER_REPAIR: ["REPAIRED", "REPLACED"],
  REPAIRED: [],
  REPLACED: [],
  REJECTED: [],
};

export function isWarrantyValid(warranty: WarrantyRecord) {
  return (
    warranty.warrantyStatus === "ACTIVE" &&
    new Date(warranty.expireDate) >= new Date(new Date().toDateString())
  );
}
