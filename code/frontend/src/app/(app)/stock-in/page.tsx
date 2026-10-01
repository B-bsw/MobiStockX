"use client";

import { useEffect, useState } from "react";
import { PackageOpen, SearchX } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
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
} from "@/types/stock/types";

type StatusFilter = "ALL" | ItemStatus;

const FILTERS: readonly { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "AVAILABLE", label: "พร้อมขาย" },
  { value: "SOLD", label: "ขายแล้ว" },
  { value: "DAMAGED", label: "ชำรุด" },
];

export default function Page() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      className: "hidden xl:table-cell",
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
  ];

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="จัดการสต๊อก"
        description={`ทั้งหมด ${formatMoney(items.length)} เครื่อง · พร้อมขาย ${formatMoney(available)} เครื่อง`}
      />

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
        minWidthClass="min-w-[58rem]"
        maxHeightClass="max-h-full"
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
    </Panel>
  );
}
