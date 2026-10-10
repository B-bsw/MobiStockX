"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, SelectControl, controlClass } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ROLE_LABEL, type UserRole } from "@/lib/auth-context";
import { ROLE_ROUTES, ROUTE_LABEL } from "@/lib/permissions";
import { ROLE_ORDER, type AppUserRow } from "@/types/users/types";
import {
  validateUserForm,
  type UserFormErrors,
  type UserFormValues,
} from "./user-form";

export interface UserEditValues extends UserFormValues {
  isActive: boolean;
}

interface UserEditDialogProps {
  user: AppUserRow | null;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (values: UserEditValues) => void;
}

export function UserEditDialog({
  user,
  saving,
  error,
  onClose,
  onSave,
}: UserEditDialogProps) {
  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขผู้ใช้</DialogTitle>
          <DialogDescription>
            เว้นรหัสผ่านว่างไว้หากไม่ต้องการเปลี่ยน
          </DialogDescription>
        </DialogHeader>

        {user ? (
          <EditFields
            key={user.userId}
            user={user}
            saving={saving}
            error={error}
            onClose={onClose}
            onSave={onSave}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

interface EditFieldsProps {
  user: AppUserRow;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (values: UserEditValues) => void;
}

function EditFields({
  user,
  saving,
  error,
  onClose,
  onSave,
}: EditFieldsProps) {
  const [values, setValues] = useState<UserEditValues>({
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? "",
    password: "",
    role: user.role,
    isActive: user.isActive,
  });
  const [errors, setErrors] = useState<UserFormErrors>({});

  function change<K extends keyof UserEditValues>(
    field: K,
    value: UserEditValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateUserForm(values, true);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onSave(values);
  }

  const describedBy = (field: keyof UserFormValues) =>
    errors[field] ? `edit-user-${field}-error` : undefined;

  const rolePreview =
    values.role === ""
      ? null
      : ROLE_ROUTES[values.role].map((route) => ROUTE_LABEL[route]).join(" · ");

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-col">
      <DialogBody className="space-y-4">
        {error !== "" ? <Alert tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="edit-user-username"
            label="ชื่อผู้ใช้"
            required
            error={errors.username}
          >
            <input
              id="edit-user-username"
              type="text"
              autoComplete="off"
              value={values.username}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={describedBy("username")}
              onChange={(event) => change("username", event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field
            id="edit-user-fullName"
            label="ชื่อ-นามสกุล"
            required
            error={errors.fullName}
          >
            <input
              id="edit-user-fullName"
              type="text"
              value={values.fullName}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={describedBy("fullName")}
              onChange={(event) => change("fullName", event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field
            id="edit-user-email"
            label="อีเมล"
            required
            error={errors.email}
          >
            <input
              id="edit-user-email"
              type="email"
              autoComplete="off"
              value={values.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy("email")}
              onChange={(event) => change("email", event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field id="edit-user-phone" label="เบอร์โทร" error={errors.phone}>
            <input
              id="edit-user-phone"
              type="tel"
              inputMode="tel"
              placeholder="ไม่บังคับ"
              value={values.phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy("phone")}
              onChange={(event) => change("phone", event.target.value)}
              className={`${controlClass} tabular-nums`}
            />
          </Field>

          <Field
            id="edit-user-password"
            label="รหัสผ่านใหม่"
            error={errors.password}
            hint={
              errors.password ? undefined : "เว้นว่างไว้เพื่อใช้รหัสผ่านเดิม"
            }
          >
            <input
              id="edit-user-password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                describedBy("password") ?? "edit-user-password-hint"
              }
              onChange={(event) => change("password", event.target.value)}
              className={controlClass}
            />
          </Field>

          <Field
            id="edit-user-role"
            label="สิทธิ์การใช้งาน"
            required
            error={errors.role}
          >
            <SelectControl
              id="edit-user-role"
              value={values.role}
              aria-invalid={Boolean(errors.role)}
              aria-describedby={describedBy("role")}
              onChange={(event) =>
                change("role", event.target.value as UserRole | "")
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
        </div>

        {rolePreview ? (
          <p className="text-sm text-muted-foreground">
            เมนูที่เห็นได้: {rolePreview}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <label
            htmlFor="edit-user-active"
            className="cursor-pointer text-sm text-foreground"
          >
            เปิดใช้งานบัญชี
            <span className="block text-xs text-muted-foreground">
              ปิดไว้เพื่อระงับการเข้าสู่ระบบ โดยไม่ลบข้อมูล
            </span>
          </label>
          <Switch
            id="edit-user-active"
            checked={values.isActive}
            disabled={saving}
            onCheckedChange={(checked) => change("isActive", checked)}
          />
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          size="touch"
          disabled={saving}
          onClick={onClose}
        >
          ยกเลิก
        </Button>
        <Button type="submit" size="touch" disabled={saving}>
          {saving ? "กำลังบันทึก…" : "บันทึก"}
        </Button>
      </DialogFooter>
    </form>
  );
}
