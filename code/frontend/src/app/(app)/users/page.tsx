"use client";

import { useEffect, useState } from "react";
import { UsersRound } from "lucide-react";
import { api } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CardField,
  CardFields,
  DataTable,
  type Column,
} from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  EMPTY_USER_FORM,
  UserForm,
  type UserFormValues,
} from "@/components/users/user-form";
import { ROLE_TONE, type AppUserRow } from "@/types/users/types";

export default function UsersPage() {
  const [users, setUsers] = useState<AppUserRow[]>([]);
  const [values, setValues] = useState<UserFormValues>(EMPTY_USER_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [created, setCreated] = useState("");

  /** Shared by the first load and the refresh after a successful create. */
  const loadUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.data ?? []);
      setListError("");
    } catch {
      setListError("ไม่สามารถโหลดรายชื่อผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getData = async () => {
      await loadUsers();
    };

    getData();
  }, []);

  const change = <K extends keyof UserFormValues>(
    field: K,
    value: UserFormValues[K],
  ) => setValues((prev) => ({ ...prev, [field]: value }));

  const submit = async () => {
    try {
      setSaving(true);
      setFormError("");
      setCreated("");

      const phone = values.phone.trim();

      await api.post("/users", {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        phone: phone === "" ? null : phone,
        role: values.role,
        isActive: true,
      });

      setCreated(`เพิ่มผู้ใช้ ${values.username.trim()} เรียบร้อยแล้ว`);
      setValues(EMPTY_USER_FORM);
      await loadUsers();
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;

      setFormError(
        status === 409
          ? "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้แล้ว กรุณาใช้ค่าอื่น"
          : status === 403
            ? "เฉพาะผู้ดูแลระบบเท่านั้นที่เพิ่มผู้ใช้ได้"
            : "เพิ่มผู้ใช้ไม่สำเร็จ กรุณาตรวจสอบข้อมูลและลองอีกครั้ง",
      );
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<AppUserRow>[] = [
    {
      id: "fullName",
      header: "ชื่อ-นามสกุล",
      cell: (user) => (
        <span className="font-medium text-foreground">{user.fullName}</span>
      ),
    },
    {
      id: "username",
      header: "ชื่อผู้ใช้",
      cell: (user) => (
        <span className="text-muted-foreground">{user.username}</span>
      ),
    },
    {
      id: "email",
      header: "อีเมล",
      className: "hidden xl:table-cell",
      cell: (user) => (
        <span className="text-muted-foreground">{user.email}</span>
      ),
    },
    {
      id: "phone",
      header: "เบอร์โทร",
      cell: (user) => (
        <span className="text-muted-foreground tabular-nums">
          {user.phone || "—"}
        </span>
      ),
    },
    {
      id: "role",
      header: "สิทธิ์",
      cell: (user) => (
        <Badge tone={ROLE_TONE[user.role] ?? "neutral"}>
          {ROLE_LABEL[user.role] ?? user.role}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "สถานะ",
      align: "end",
      cell: (user) => (
        <Badge tone={user.isActive ? "success" : "neutral"}>
          {user.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
        </Badge>
      ),
    },
  ];

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="จัดการผู้ใช้"
        description={`บัญชีพนักงานทั้งหมด ${users.length} คน พร้อมสิทธิ์การเข้าถึงเมนู`}
      />

      {created !== "" ? (
        <div className="px-4 pt-4 sm:px-6">
          <Alert tone="success" live="status">
            {created}
          </Alert>
        </div>
      ) : null}

      <UserForm
        values={values}
        onChange={change}
        saving={saving}
        error={formError}
        onValid={submit}
        onCancel={() => {
          setValues(EMPTY_USER_FORM);
          setFormError("");
          setCreated("");
        }}
      />

      <div className="border-t px-4 pt-5 sm:px-6">
        <h2 className="text-base font-semibold text-foreground">
          รายชื่อผู้ใช้
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          สิทธิ์กำหนดว่าผู้ใช้เห็นเมนูใดได้ และระบบตรวจสอบอีกครั้งที่ฝั่งเซิร์ฟเวอร์
        </p>
      </div>

      <DataTable
        caption="รายชื่อผู้ใช้งานระบบ พร้อมชื่อผู้ใช้ อีเมล เบอร์โทร สิทธิ์ และสถานะบัญชี"
        columns={columns}
        rows={users}
        rowKey={(user) => user.userId}
        loading={loading}
        error={listError}
        minWidthClass="min-w-[58rem]"
        maxHeightClass="max-h-144"
        className="mt-3"
        mobileCard={(user) => (
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium text-foreground">
                {user.fullName}
              </p>
              <Badge tone={ROLE_TONE[user.role] ?? "neutral"}>
                {ROLE_LABEL[user.role] ?? user.role}
              </Badge>
            </div>
            <CardFields>
              <CardField label="ชื่อผู้ใช้">{user.username}</CardField>
              <CardField label="เบอร์โทร">{user.phone || "—"}</CardField>
              <CardField label="อีเมล" className="col-span-2">
                {user.email}
              </CardField>
              <CardField label="สถานะ">
                {user.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
              </CardField>
            </CardFields>
          </div>
        )}
        empty={
          <EmptyState
            icon={UsersRound}
            title="ยังไม่มีผู้ใช้ในระบบ"
            description="กรอกแบบฟอร์มด้านบนเพื่อสร้างบัญชีพนักงานคนแรก"
          />
        }
      />
    </Panel>
  );
}
