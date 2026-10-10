"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, UsersRound } from "lucide-react";
import { api } from "@/lib/api";
import { ROLE_LABEL, useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardField,
  CardFields,
  DataTable,
  type Column,
} from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import {
  UserEditDialog,
  type UserEditValues,
} from "@/components/users/user-edit-dialog";
import {
  EMPTY_USER_FORM,
  UserForm,
  type UserFormValues,
} from "@/components/users/user-form";
import { ROLE_TONE, type AppUserRow } from "@/types/users/types";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUserRow[]>([]);
  const [values, setValues] = useState<UserFormValues>(EMPTY_USER_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [created, setCreated] = useState("");

  const [editing, setEditing] = useState<AppUserRow | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const saveEdit = async (next: UserEditValues) => {
    if (!editing) return;

    setEditSaving(true);
    setEditError("");

    const phone = next.phone.trim();

    try {
      const response = await api.put(`/users/${editing.userId}`, {
        username: next.username.trim(),
        email: next.email.trim(),
        password: next.password === "" ? null : next.password,
        fullName: next.fullName.trim(),
        phone: phone === "" ? null : phone,
        role: next.role,
        isActive: next.isActive,
      });

      const updated: AppUserRow = response.data.data;

      setUsers((current) =>
        current.map((user) =>
          user.userId === editing.userId ? updated : user,
        ),
      );
      setCreated(`บันทึกข้อมูล ${updated.username} แล้ว`);
      setEditing(null);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      const detail = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      setEditError(
        status === 409
          ? "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้แล้ว กรุณาใช้ค่าอื่น"
          : status === 400
            ? (detail ?? "").includes("last active administrator")
              ? "ต้องมีผู้ดูแลระบบที่เปิดใช้งานอย่างน้อยหนึ่งคน"
              : "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง"
            : status === 403
              ? "เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขผู้ใช้ได้"
              : "บันทึกข้อมูลผู้ใช้ไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
    } finally {
      setEditSaving(false);
    }
  };

  const removeUser = async (user: AppUserRow) => {
    setDeletingId(user.userId);
    setListError("");

    try {
      await api.delete(`/users/${user.userId}`);

      setUsers((current) =>
        current.filter((item) => item.userId !== user.userId),
      );
      setCreated(`ลบผู้ใช้ ${user.username} แล้ว`);
      setConfirmId(null);
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response
        ?.status;
      const detail = (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      setListError(
        status === 400
          ? (detail ?? "").includes("sales history")
            ? "ผู้ใช้รายนี้มีประวัติการขายอยู่ จึงลบไม่ได้ กรุณาปิดใช้งานบัญชีแทน"
            : (detail ?? "").includes("last active administrator")
              ? "ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้"
              : (detail ?? "").includes("your own account")
                ? "ไม่สามารถลบบัญชีของตัวเองได้"
                : "ไม่สามารถลบผู้ใช้รายนี้ได้"
          : status === 403
            ? "เฉพาะผู้ดูแลระบบเท่านั้นที่ลบผู้ใช้ได้"
            : "ลบผู้ใช้ไม่สำเร็จ กรุณาลองอีกครั้ง",
      );
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const actions = (user: AppUserRow, className?: string) => {
    const isSelf = currentUser?.userId === user.userId;
    const deleting = deletingId === user.userId;

    if (confirmId === user.userId) {
      return (
        <div className={className}>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={deleting}
              onClick={() => removeUser(user)}
            >
              {deleting ? "กำลังลบ…" : "ยืนยันลบ"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={deleting}
              onClick={() => setConfirmId(null)}
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            title="แก้ไข"
            aria-label={`แก้ไข ${user.username}`}
            className="text-muted-foreground hover:bg-[#DCEEFF] hover:text-[#2580D9]"
            onClick={() => {
              setEditError("");
              setCreated("");
              setEditing(user);
            }}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            title={isSelf ? "ไม่สามารถลบบัญชีตัวเองได้" : "ลบ"}
            aria-label={`ลบ ${user.username}`}
            disabled={isSelf}
            className="text-muted-foreground hover:bg-danger-bg hover:text-danger"
            onClick={() => setConfirmId(user.userId)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
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
    {
      id: "actions",
      header: <span className="sr-only">การจัดการ</span>,
      align: "end",
      cell: (user) => actions(user),
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
        minWidthClass="min-w-[64rem]"
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
            {actions(user, "mt-3")}
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

      <UserEditDialog
        user={editing}
        saving={editSaving}
        error={editError}
        onClose={() => setEditing(null)}
        onSave={saveEdit}
      />
    </Panel>
  );
}
