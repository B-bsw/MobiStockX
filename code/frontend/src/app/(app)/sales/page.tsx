"use client";

import { useEffect, useState } from "react";
import { Eye, ReceiptText, SearchX } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import { SaleDetailDialog } from "@/components/sales/sale-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [selected, setSelected] = useState<SaleOrder | null>(null);

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
    [
      sale.saleCode,
      sale.customerName,
      sale.customerPhone,
      ...(sale.items ?? []).flatMap((item) => [
        item.modelName,
        item.itemImei,
        item.itemSerialNumber,
      ]),
    ].some((value) => (value ?? "").toLowerCase().includes(keyword)),
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
      header: "สินค้าที่ขาย",
      cell: (sale) => {
        const items = sale.items ?? [];
        const units = items.reduce(
          (sum, item) => sum + Number(item.quantity ?? 0),
          0,
        );

        if (items.length === 0) {
          return <span className="text-muted-foreground">—</span>;
        }

        return (
          <div className="min-w-0">
            <p className="truncate">
              {items[0].modelName}
              {items.length > 1 ? ` +${items.length - 1} รายการ` : ""}
            </p>
            <p className="truncate text-xs tabular-nums text-muted-foreground">
              {items[0].itemImei
                ? `IMEI ${items[0].itemImei}`
                : `${formatMoney(units)} ชิ้น`}
            </p>
          </div>
        );
      },
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
    {
      id: "detail",
      header: <span className="sr-only">รายละเอียด</span>,
      align: "end",
      cell: (sale) => (
        <Button
          size="icon-sm"
          variant="ghost"
          title="ดูรายละเอียด"
          aria-label={`ดูรายละเอียดบิล ${sale.saleCode}`}
          className="text-muted-foreground hover:bg-[#DCEEFF] hover:text-[#2580D9]"
          onClick={() => setSelected(sale)}
        >
          <Eye aria-hidden="true" />
        </Button>
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
          placeholder="ค้นหาเลขที่บิล ลูกค้า รุ่นสินค้า หรือ IMEI"
          value={search}
          onValueChange={setSearch}
          className="lg:max-w-sm"
        />
      </div>

      <DataTable
        caption="ประวัติบิลขายทั้งหมด พร้อมวันที่ ลูกค้า สินค้าที่ขาย ยอดรวม และสถานะ"
        columns={columns}
        rows={filtered}
        rowKey={(sale) => sale.saleId}
        loading={loading}
        error={error}
        minWidthClass="min-w-[64rem]"
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
              <CardField label="สินค้า">
                {(sale.items ?? [])[0]?.modelName ?? "—"}
                {(sale.items ?? []).length > 1
                  ? ` +${(sale.items ?? []).length - 1}`
                  : ""}
              </CardField>
              <CardField label="ยอดรวม">
                ฿{formatMoney(sale.totalAmount)}
              </CardField>
            </CardFields>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full"
              onClick={() => setSelected(sale)}
            >
              <Eye aria-hidden="true" />
              ดูรายละเอียดสินค้า
            </Button>
          </div>
        )}
        empty={
          keyword !== "" ? (
            <EmptyState
              icon={SearchX}
              title="ไม่พบบิลที่ค้นหา"
              description={`ไม่มีบิล ลูกค้า รุ่นสินค้า หรือ IMEI ที่ตรงกับ "${search.trim()}"`}
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

      <SaleDetailDialog sale={selected} onClose={() => setSelected(null)} />
    </Panel>
  );
}
