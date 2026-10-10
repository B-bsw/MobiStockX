"use client";

import { useRef, useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, SelectControl, controlClass } from "@/components/ui/field";
import { PanelSection } from "@/components/ui/panel";
import { ROLE_LABEL, type UserRole } from "@/lib/auth-context";
import { ROLE_ROUTES, ROUTE_LABEL } from "@/lib/permissions";
import { ROLE_ORDER } from "@/types/users/types";

export interface UserFormValues {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole | "";
}

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

export const EMPTY_USER_FORM: UserFormValues = {
  username: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "",
};

type FormErrors = UserFormErrors;

/** Order matters: the first invalid field in this list gets focus on submit. */
const FIELD_ORDER: (keyof UserFormValues)[] = [
  "username",
  "fullName",
  "email",
  "phone",
  "password",
  "role",
];

/** Mirrors the server rules in CreateUserRequest so the user is told sooner. */
export function validateUserForm(
  values: UserFormValues,
  passwordOptional = false,
): FormErrors {
  const errors: FormErrors = {};

  const username = values.username.trim();
  if (username === "") {
    errors.username = "กรุณากรอกชื่อผู้ใช้";
  } else if (username.length < 3) {
    errors.username = "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
  }

  if (values.fullName.trim() === "") {
    errors.fullName = "กรุณากรอกชื่อ-นามสกุล";
  }

  const email = values.email.trim();
  if (email === "") {
    errors.email = "กรุณากรอกอีเมล";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
  }

  const phone = values.phone.trim();
  if (phone !== "" && !/^[0-9][0-9-\s]{7,19}$/.test(phone)) {
    errors.phone = "เบอร์โทรต้องเป็นตัวเลข 8-20 หลัก";
  }

  if (values.password === "") {
    if (!passwordOptional) errors.password = "กรุณากรอกรหัสผ่าน";
  } else if (values.password.length < 8) {
    errors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }

  if (values.role === "") {
    errors.role = "กรุณาเลือกสิทธิ์การใช้งาน";
  }

  return errors;
}

interface UserFormProps {
  values: UserFormValues;
  onChange: <K extends keyof UserFormValues>(
    field: K,
    value: UserFormValues[K],
  ) => void;
  saving: boolean;
  error?: string;
  /** Called only once every field passes validation. */
  onValid: () => void;
  onCancel: () => void;
}

export function UserForm({
  values,
  onChange,
  saving,
  error = "",
  onValid,
  onCancel,
}: UserFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Silent until the first submit, then live as the user fixes each field.
  const errors = submitted ? validateUserForm(values) : {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const found = validateUserForm(values);
    const firstInvalid = FIELD_ORDER.find((field) => found[field]);

    if (firstInvalid) {
      const element = formRef.current?.querySelector<HTMLElement>(
        `#user-${firstInvalid}`,
      );
      element?.focus({ preventScroll: true });
      element?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    onValid();
  }

  const describedBy = (field: keyof UserFormValues) =>
    errors[field] ? `user-${field}-error` : undefined;

  // Spelled out under the picker so an admin can see what they are handing over
  // before they hand it over.
  const rolePreview =
    values.role === ""
      ? null
      : ROLE_ROUTES[values.role].map((route) => ROUTE_LABEL[route]).join(" · ");

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {error !== "" ? (
        <div className="px-4 pt-4 sm:px-6">
          <Alert tone="danger">{error}</Alert>
        </div>
      ) : null}

      <PanelSection
        title="เพิ่มผู้ใช้ใหม่"
        description="สร้างบัญชีพนักงานและกำหนดสิทธิ์ว่าเห็นเมนูใดได้"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="user-username"
            label="ชื่อผู้ใช้"
            required
            error={errors.username}
            hint={errors.username ? undefined : "ใช้สำหรับเข้าสู่ระบบ"}
          >
            <input
              id="user-username"
              type="text"
              autoComplete="off"
              placeholder="เช่น somchai.m"
              value={values.username}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={describedBy("username") ?? "user-username-hint"}
              onChange={(event) => onChange("username", event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field
            id="user-fullName"
            label="ชื่อ-นามสกุล"
            required
            error={errors.fullName}
          >
            <input
              id="user-fullName"
              type="text"
              placeholder="เช่น สมชาย มีทรัพย์"
              value={values.fullName}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={describedBy("fullName")}
              onChange={(event) => onChange("fullName", event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field id="user-email" label="อีเมล" required error={errors.email}>
            <input
              id="user-email"
              type="email"
              autoComplete="off"
              placeholder="name@mobistockx.co.th"
              value={values.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy("email")}
              onChange={(event) => onChange("email", event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field id="user-phone" label="เบอร์โทร" error={errors.phone}>
            <input
              id="user-phone"
              type="tel"
              inputMode="tel"
              placeholder="ไม่บังคับ"
              value={values.phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy("phone")}
              onChange={(event) => onChange("phone", event.target.value)}
              className={`${controlClass} tabular-nums`}
            />
          </Field>

          <Field
            id="user-password"
            label="รหัสผ่านเริ่มต้น"
            required
            error={errors.password}
            hint={
              errors.password ? undefined : "อย่างน้อย 8 ตัวอักษร แจ้งให้พนักงานเปลี่ยนภายหลัง"
            }
          >
            <input
              id="user-password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={describedBy("password") ?? "user-password-hint"}
              onChange={(event) => onChange("password", event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field
            id="user-role"
            label="สิทธิ์การใช้งาน"
            required
            error={errors.role}
          >
            <SelectControl
              id="user-role"
              value={values.role}
              aria-invalid={Boolean(errors.role)}
              aria-describedby={describedBy("role") ?? "user-role-preview"}
              onChange={(event) =>
                onChange("role", event.target.value as UserRole | "")
              }
            >
              <option value="">เลือกสิทธิ์</option>
              {ROLE_ORDER.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABEL[role]}
                </option>
              ))}
            </SelectControl>
          </Field>

          {rolePreview ? (
            <p
              id="user-role-preview"
              className="text-sm text-muted-foreground sm:col-span-2"
            >
              เมนูที่เห็นได้: {rolePreview}
            </p>
          ) : null}
        </div>
      </PanelSection>

      <div className="flex flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button
          type="button"
          size="touch"
          variant="outline"
          disabled={saving}
          onClick={onCancel}
        >
          ล้างฟอร์ม
        </Button>
        <Button type="submit" size="touch" disabled={saving}>
          <UserPlus aria-hidden="true" />
          {saving ? "กำลังบันทึก…" : "เพิ่มผู้ใช้"}
        </Button>
      </div>
    </form>
  );
}
