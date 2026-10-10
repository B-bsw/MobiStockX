import type { BadgeTone } from "@/components/ui/badge";
import type { UserRole } from "@/lib/auth-context";

export interface AppUserRow {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
}

/** Role order used by both the table legend and the role picker. */
export const ROLE_ORDER: readonly UserRole[] = [
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "TECHNICIAN",
];

export const ROLE_TONE: Record<UserRole, BadgeTone> = {
  ADMIN: "violet",
  MANAGER: "info",
  CASHIER: "success",
  TECHNICIAN: "warning",
};
