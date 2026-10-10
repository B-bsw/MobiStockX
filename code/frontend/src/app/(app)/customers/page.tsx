"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, SearchX, Trash2, UsersRound } from "lucide-react";
import { api } from "@/lib/api";
import { CustomerDialog } from "@/components/customers/customer-dialog";
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
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Segmented } from "@/components/ui/segmented";
import { usePagination } from "@/lib/use-pagination";
import {
  customerName,
  type CustomerFormValues,
  type CustomerRecord,
} from "@/types/customers/types";

type TaxFilter = "ALL" | "WITH_TAX" | "WITHOUT_TAX";

const TAX_FILTERS: readonly { value: TaxFilter; label: string }[] = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "WITH_TAX", label: "มีเลขผู้เสียภาษี" },
  { value: "WITHOUT_TAX", label: "ไม่มีเลขผู้เสียภาษี" },
];

export default function Page() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [taxFilter, setTaxFilter] = useState<TaxFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/customers", {
          params: { size: 200 },
        });

        setCustomers(response.data.data.content ?? []);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลลูกค้าได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  function openCreate() {
    setEditing(null);
    setSaveError("");
    setNotice("");
    setDialogOpen(true);
  }

  function openEdit(customer: CustomerRecord) {
    setEditing(customer);
    setSaveError("");
    setNotice("");
    setDialogOpen(true);
  }

  async function save(values: CustomerFormValues) {
    setSaving(true);
    setSaveError("");

    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.replace(/[\s-]/g, ""),
      taxNumber: values.taxNumber.replace(/[\s-]/g, "") || null,
      address: values.address.trim() || null,
    };

    try {
      if (editing) {
        const response = await api.put(
          `/customers/${editing.customerId}`,
          payload,
        );
        const updated: CustomerRecord = response.data.data;

        setCustomers((current) =>
          current.map((customer) =>
            customer.customerId === editing.customerId ? updated : customer,
          ),
        );
        setNotice(`บันทึกข้อมูล ${customerName(updated)} แล้ว`);
      } else {
        const response = await api.post("/customers", payload);
        const created: CustomerRecord = response.data.data;

        setCustomers((current) => [created, ...current]);
        setNotice(`เพิ่มลูกค้า ${customerName(created)} แล้ว`);
      }

      setDialogOpen(false);
      setEditing(null);
    } catch (caught) {
      const status = (caught as { response?: { status?: number } }).response
        ?.status;
      const detail = (
        caught as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      setSaveError(
        status === 409
          ? (detail ?? "เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว")
          : (detail ?? "บันทึกข้อมูลลูกค้าไม่สำเร็จ กรุณาลองอีกครั้ง"),
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(customer: CustomerRecord) {
    setDeletingId(customer.customerId);
    setError("");

    try {
      await api.delete(`/customers/${customer.customerId}`);

      setCustomers((current) =>
        current.filter((item) => item.customerId !== customer.customerId),
      );
      setNotice(`ลบลูกค้า ${customerName(customer)} แล้ว`);
      setConfirmId(null);
    } catch {
      setError("ลบลูกค้าไม่สำเร็จ ลูกค้ารายนี้อาจมีประวัติการขายอยู่");
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  }

  const keyword = search.trim().toLowerCase();
  const filtered = customers.filter((customer) => {
    const hasTax = (customer.taxNumber ?? "") !== "";

    const matchSearch = [
      customerName(customer),
      customer.phone,
      customer.taxNumber ?? "",
      customer.address ?? "",
    ].some((value) => value.toLowerCase().includes(keyword));

    const matchTax =
      taxFilter === "ALL" ||
      (taxFilter === "WITH_TAX" ? hasTax : !hasTax);

    return matchSearch && matchTax;
  });

  const paged = usePagination(filtered);

  const withTaxNumber = customers.filter(
    (customer) => (customer.taxNumber ?? "") !== "",
  ).length;

  const actions = (customer: CustomerRecord, className?: string) => {
    const deleting = deletingId === customer.customerId;
    const confirming = confirmId === customer.customerId;

    if (confirming) {
      return (
        <div className={className}>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={deleting}
              onClick={() => remove(customer)}
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
            aria-label={`แก้ไข ${customerName(customer)}`}
            className="text-muted-foreground hover:bg-[#DCEEFF] hover:text-[#2580D9]"
            onClick={() => openEdit(customer)}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            title="ลบ"
            aria-label={`ลบ ${customerName(customer)}`}
            className="text-muted-foreground hover:bg-danger-bg hover:text-danger"
            onClick={() => setConfirmId(customer.customerId)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  };

  const columns: Column<CustomerRecord>[] = [
    {
      id: "name",
      header: "ชื่อลูกค้า",
      cell: (customer) => (
        <span className="font-medium text-foreground">
          {customerName(customer)}
        </span>
      ),
    },
    {
      id: "phone",
      header: "เบอร์โทรศัพท์",
      cell: (customer) => (
        <span className="tabular-nums text-muted-foreground">
          {customer.phone}
        </span>
      ),
    },
    {
      id: "taxNumber",
      header: "เลขผู้เสียภาษี",
      cell: (customer) =>
        customer.taxNumber ? (
          <span className="tabular-nums text-muted-foreground">
            {customer.taxNumber}
          </span>
        ) : (
          <Badge tone="neutral">ไม่ระบุ</Badge>
        ),
    },
    {
      id: "address",
      header: "ที่อยู่",
      className: "hidden xl:table-cell",
      cell: (customer) => (
        <span className="line-clamp-2 text-muted-foreground">
          {customer.address || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">การจัดการ</span>,
      align: "end",
      cell: (customer) => actions(customer),
    },
  ];

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="ข้อมูลลูกค้า"
        description={`ลูกค้าทั้งหมด ${customers.length} ราย · มีเลขผู้เสียภาษี ${withTaxNumber} ราย`}
        actions={
          <Button size="touch" onClick={openCreate}>
            <Plus aria-hidden="true" />
            เพิ่มลูกค้า
          </Button>
        }
      />

      {notice !== "" ? (
        <div className="px-4 pt-4 sm:px-6">
          <Alert tone="success" live="status">
            {notice}
          </Alert>
        </div>
      ) : null}

      {error !== "" && customers.length > 0 ? (
        <div className="px-4 pt-4 sm:px-6">
          <Alert tone="danger">{error}</Alert>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:gap-4 lg:px-6">
        <SearchInput
          label="ค้นหาลูกค้า"
          placeholder="ค้นหาชื่อ เบอร์โทร หรือเลขผู้เสียภาษี"
          value={search}
          onValueChange={setSearch}
          className="lg:max-w-sm lg:flex-1"
        />
        <Segmented
          label="กรองตามเลขผู้เสียภาษี"
          options={TAX_FILTERS}
          value={taxFilter}
          onValueChange={setTaxFilter}
          className="lg:ml-auto"
        />
      </div>

      <DataTable
        caption="รายชื่อลูกค้าพร้อมเบอร์โทรศัพท์ เลขผู้เสียภาษี และที่อยู่"
        columns={columns}
        rows={paged.rows}
        rowKey={(customer) => customer.customerId}
        loading={loading}
        error={customers.length === 0 ? error : ""}
        minWidthClass="min-w-[52rem]"
        maxHeightClass="max-h-144"
        mobileCard={(customer) => (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {customerName(customer)}
                </p>
                <p className="truncate text-xs tabular-nums text-muted-foreground">
                  {customer.phone}
                </p>
              </div>
            </div>
            <CardFields>
              <CardField label="เลขผู้เสียภาษี">
                {customer.taxNumber || "—"}
              </CardField>
              <CardField label="ที่อยู่">{customer.address || "—"}</CardField>
            </CardFields>
            {actions(customer, "mt-3")}
          </div>
        )}
        empty={
          keyword !== "" ? (
            <EmptyState
              icon={SearchX}
              title="ไม่พบลูกค้าที่ค้นหา"
              description={`ไม่มีลูกค้าที่ตรงกับ "${search.trim()}" ลองพิมพ์สั้นลงหรือล้างคำค้นหา`}
            />
          ) : (
            <EmptyState
              icon={UsersRound}
              title="ยังไม่มีข้อมูลลูกค้า"
              description="กดเพิ่มลูกค้าเพื่อบันทึกรายแรก แล้วจะเลือกใช้ที่หน้า POS ได้ทันที"
            />
          )
        }
      />

      {!loading && filtered.length > 0 ? (
        <Pagination
          page={paged.page}
          pageCount={paged.pageCount}
          pageSize={paged.pageSize}
          total={paged.total}
          from={paged.from}
          to={paged.to}
          unit="ราย"
          onPageChange={paged.setPage}
          onPageSizeChange={paged.setPageSize}
        />
      ) : null}

      <CustomerDialog
        open={dialogOpen}
        customer={editing}
        saving={saving}
        error={saveError}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        onSave={save}
      />
    </Panel>
  );
}
