"use client";

import { useEffect, useState } from "react";
import { ReceiptText, SearchX } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { CardField, CardFields, DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { SearchInput } from "@/components/ui/search-input";
import {
  SALE_STATUS_LABEL,
  SALE_STATUS_TONE,
  type SaleOrder,
} from "@/types/sales/types";

export default function Page() {
  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/sales", {
          params: { size: 100 },
        });

        setSales(response.data.data.content ?? []);
      } catch {
        setError("ไม่สามารถโหลดประวัติการขายได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const keyword = search.trim().toLowerCase();
  const filtered = sales.filter((sale) =>
    [sale.saleCode, sale.customerName, sale.customerPhone].some((value) =>
      (value ?? "").toLowerCase().includes(keyword),
    ),
  );

  const totalRevenue = sales
    .filter((sale) => sale.status === "COMPLETED")
    .reduce((sum, sale) => sum + Number(sale.totalAmount ?? 0), 0);

  const columns: Column<SaleOrder>[] = [
    {
      id: "code",
      header: "เลขที่บิล",
      cell: (sale) => (
        <span className="font-medium tabular-nums text-foreground">
          {sale.saleCode}
        </span>
      ),
    },
    {
      id: "date",
      header: "วันที่",
      cell: (sale) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDateTime(sale.saleDate)}
        </span>
      ),
    },
    {
      id: "customer",
      header: "ลูกค้า",
      cell: (sale) => (
        <div className="min-w-0">
          <p className="truncate">{sale.customerName}</p>
          <p className="truncate text-xs tabular-nums text-muted-foreground">
            {sale.customerPhone}
          </p>
        </div>
      ),
    },
    {
      id: "items",
      header: "รายการ",
      align: "end",
      className: "hidden xl:table-cell",
      cell: (sale) => (
        <span className="tabular-nums text-muted-foreground">
          {(sale.items ?? []).length} รายการ
        </span>
      ),
    },
    {
      id: "total",
      header: "ยอดรวม",
      align: "end",
      cell: (sale) => (
        <span className="font-medium tabular-nums">
          ฿{formatMoney(sale.totalAmount)}
        </span>
      ),
    },
    {
      id: "status",
      header: "สถานะ",
      align: "end",
      cell: (sale) => (
        <Badge tone={SALE_STATUS_TONE[sale.status] ?? "neutral"}>
          {SALE_STATUS_LABEL[sale.status] ?? sale.status}
        </Badge>
      ),
    },
  ];

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="ประวัติการขาย"
        description={`ทั้งหมด ${formatMoney(sales.length)} บิล · ยอดขายรวม ฿${formatMoney(totalRevenue)}`}
      />

      <div className="border-b px-4 py-3 lg:px-6">
        <SearchInput
          label="ค้นหาบิลขาย"
          placeholder="ค้นหาเลขที่บิล ชื่อลูกค้า หรือเบอร์โทร"
          value={search}
          onValueChange={setSearch}
          className="lg:max-w-sm"
        />
      </div>

      <DataTable
        caption="ประวัติบิลขายทั้งหมด พร้อมวันที่ ลูกค้า ยอดรวม และสถานะ"
        columns={columns}
        rows={filtered}
        rowKey={(sale) => sale.saleId}
        loading={loading}
        error={error}
        minWidthClass="min-w-[58rem]"
        maxHeightClass="max-h-[36rem]"
        mobileCard={(sale) => (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium tabular-nums text-foreground">
                  {sale.saleCode}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDateTime(sale.saleDate)}
                </p>
              </div>
              <Badge tone={SALE_STATUS_TONE[sale.status] ?? "neutral"}>
                {SALE_STATUS_LABEL[sale.status] ?? sale.status}
              </Badge>
            </div>
            <CardFields>
              <CardField label="ลูกค้า">{sale.customerName}</CardField>
              <CardField label="เบอร์โทร">{sale.customerPhone}</CardField>
              <CardField label="รายการ">
                {(sale.items ?? []).length} รายการ
              </CardField>
              <CardField label="ยอดรวม">
                ฿{formatMoney(sale.totalAmount)}
              </CardField>
            </CardFields>
          </div>
        )}
        empty={
          keyword !== "" ? (
            <EmptyState
              icon={SearchX}
              title="ไม่พบบิลที่ค้นหา"
              description={`ไม่มีเลขที่บิล ชื่อลูกค้า หรือเบอร์โทรที่ตรงกับ "${search.trim()}"`}
            />
          ) : (
            <EmptyState
              icon={ReceiptText}
              title="ยังไม่มีประวัติการขาย"
              description="บิลจะขึ้นที่นี่ทันทีหลังปิดการขายครั้งแรกในหน้า POS"
            />
          )
        }
      />
    </Panel>
  );
}
