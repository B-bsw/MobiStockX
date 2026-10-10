"use client";

import { useEffect, useState } from "react";
import { PackageOpen, Pencil, SearchX } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { StockEditSheet } from "@/components/stock/stock-edit-sheet";
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
import { SearchInput } from "@/components/ui/search-input";
import { Segmented } from "@/components/ui/segmented";
import {
  ITEM_STATUS_LABEL,
  ITEM_STATUS_TONE,
  type ItemStatus,
  type ProductItem,
  type StockEditForm,
} from "@/types/stock/types";

type StatusFilter = "ALL" | ItemStatus;

const FILTERS: readonly { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "AVAILABLE", label: "พร้อมขาย" },
  { value: "RESERVED", label: "จองแล้ว" },
  { value: "SOLD", label: "ขายแล้ว" },
  { value: "DAMAGED", label: "ชำรุด" },
  { value: "CLAIMING", label: "เคลมอยู่" },
];

export default function Page() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products/items", {
          params: { size: 200 },
        });

        setItems(response.data.data.content ?? []);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลสต๊อกได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  function openEditor(item: ProductItem) {
    setEditing(item);
    setSaveError("");
    setNotice("");
  }

  async function saveItem(itemId: number, values: StockEditForm) {
    setSaving(true);
    setSaveError("");

    try {
      const response = await api.patch(`/products/items/${itemId}`, {
        serialNumber: values.serialNumber.trim() || null,
        imei: values.imei.trim() || null,
        grade: values.grade.trim() || null,
        condition: values.condition,
        batteryHealth:
          values.batteryHealth.trim() === ""
            ? null
            : Number(values.batteryHealth),
        costPrice: Number(values.costPrice),
        sellingPrice: Number(values.sellingPrice),
        status: values.status,
      });

      const updated: ProductItem = response.data.data;

      setItems((current) =>
        current.map((item) => (item.itemId === itemId ? updated : item)),
      );
      setEditing(null);
      setNotice(`บันทึกการแก้ไข ${updated.modelName} แล้ว`);
    } catch (caught) {
      const status = (caught as { response?: { status?: number } }).response
        ?.status;
      const detail = (
        caught as { response?: { data?: { message?: string } } }
      ).response?.data?.message;

      setSaveError(
        status === 409
          ? (detail ?? "Serial หรือ IMEI นี้ถูกใช้กับเครื่องอื่นแล้ว")
          : (detail ?? "บันทึกการแก้ไขไม่สำเร็จ กรุณาลองอีกครั้ง"),
      );
    } finally {
      setSaving(false);
    }
  }

  const keyword = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchSearch = [item.modelName, item.serialNumber, item.imei].some(
      (value) => (value ?? "").toLowerCase().includes(keyword),
    );
    const matchStatus = status === "ALL" || item.status === status;
    return matchSearch && matchStatus;
  });

  const available = items.filter((item) => item.status === "AVAILABLE").length;

  const columns: Column<ProductItem>[] = [
    {
      id: "model",
      header: "รุ่นสินค้า",
      cell: (item) => (
        <span className="font-medium text-foreground">{item.modelName}</span>
      ),
    },
    {
      id: "serial",
      header: "Serial",
      cell: (item) => (
        <span className="text-muted-foreground tabular-nums">
          {item.serialNumber || "—"}
        </span>
      ),
    },
    {
      id: "imei",
      header: "IMEI",
      cell: (item) => (
        <span className="text-muted-foreground tabular-nums">
          {item.imei || "—"}
        </span>
      ),
    },
    {
      id: "grade",
      header: "เกรด",
      cell: (item) => (
        <span className="text-muted-foreground">{item.grade || "—"}</span>
      ),
    },
    {
      id: "price",
      header: "ราคาขาย",
      align: "end",
      cell: (item) => (
        <span className="tabular-nums">฿{formatMoney(item.sellingPrice)}</span>
      ),
    },
    {
      id: "status",
      header: "สถานะ",
      align: "end",
      cell: (item) => (
        <Badge tone={ITEM_STATUS_TONE[item.status] ?? "neutral"}>
          {ITEM_STATUS_LABEL[item.status] ?? item.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">การจัดการ</span>,
      align: "end",
      cell: (item) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => openEditor(item)}
          aria-label={`แก้ไข ${item.modelName}${item.serialNumber ? ` Serial ${item.serialNumber}` : ""}`}
        >
          <Pencil aria-hidden="true" />
        </Button>
      ),
    },
  ];

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="จัดการสต๊อก"
        description={`ทั้งหมด ${formatMoney(items.length)} เครื่อง · พร้อมขาย ${formatMoney(available)} เครื่อง`}
      />

      {notice !== "" && (
        <div className="px-4 pt-3 sm:px-6">
          <Alert tone="success" live="status">
            {notice}
          </Alert>
        </div>
      )}

      <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:gap-4 lg:px-6">
        <SearchInput
          label="ค้นหาเครื่องในสต๊อก"
          placeholder="ค้นหารุ่น Serial หรือ IMEI"
          value={search}
          onValueChange={setSearch}
          className="lg:max-w-sm lg:flex-1"
        />
        <Segmented
          label="กรองตามสถานะ"
          options={FILTERS}
          value={status}
          onValueChange={setStatus}
          className="lg:ml-auto"
        />
      </div>

      <DataTable
        caption="รายการเครื่องในสต๊อกรายตัว พร้อม Serial IMEI เกรด ราคาขาย และสถานะ"
        columns={columns}
        rows={filtered}
        rowKey={(item) => item.itemId}
        loading={loading}
        error={error}
        minWidthClass="min-w-[62rem]"
        maxHeightClass="max-h-144"
        mobileCard={(item) => (
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium text-foreground">
                {item.modelName}
              </p>
              <Badge tone={ITEM_STATUS_TONE[item.status] ?? "neutral"}>
                {ITEM_STATUS_LABEL[item.status] ?? item.status}
              </Badge>
            </div>
            <CardFields>
              <CardField label="Serial">{item.serialNumber || "—"}</CardField>
              <CardField label="IMEI">{item.imei || "—"}</CardField>
              <CardField label="เกรด">{item.grade || "—"}</CardField>
              <CardField label="ราคาขาย">
                ฿{formatMoney(item.sellingPrice)}
              </CardField>
            </CardFields>
            <Button
              type="button"
              variant="outline"
              size="touch"
              className="mt-3 w-full"
              onClick={() => openEditor(item)}
            >
              <Pencil aria-hidden="true" />
              แก้ไขเครื่องนี้
            </Button>
          </div>
        )}
        empty={
          keyword !== "" ? (
            <EmptyState
              icon={SearchX}
              title="ไม่พบเครื่องที่ค้นหา"
              description={`ไม่มีรุ่น Serial หรือ IMEI ที่ตรงกับ "${search.trim()}" ลองพิมพ์สั้นลงหรือล้างคำค้นหา`}
            />
          ) : (
            <EmptyState
              icon={PackageOpen}
              title="ไม่มีเครื่องในสถานะนี้"
              description="เลือกสถานะอื่นด้านบน หรือไปที่หน้ารับสินค้าเข้าเพื่อเพิ่มเครื่องเข้าคลัง"
            />
          )
        }
      />

      <StockEditSheet
        item={editing}
        saving={saving}
        error={saveError}
        onClose={() => setEditing(null)}
        onSave={saveItem}
      />
    </Panel>
  );
}
