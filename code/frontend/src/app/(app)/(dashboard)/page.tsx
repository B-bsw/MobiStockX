"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  PackageCheck,
  Smartphone,
  Wallet,
  Banknote,
  Receipt,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, type BarDatum } from "@/components/dashboard/bar-chart";
import {
  SalesTrend,
  type TrendPoint,
} from "@/components/dashboard/sales-trend";
import { PanelSection } from "@/components/ui/panel";
import type { ProductModel } from "@/types/products/types";
import type { SaleOrder } from "@/types/sales/types";
import {
  ITEM_STATUS_LABEL,
  type ItemStatus,
  type ProductItem,
} from "@/types/stock/types";

const LOW_STOCK_THRESHOLD = 3;
const TREND_DAYS = 7;

const STATUS_BAR_CLASS: Record<ItemStatus, string> = {
  AVAILABLE: "bg-chart-2",
  RESERVED: "bg-chart-3",
  SOLD: "bg-chart-1",
  DAMAGED: "bg-chart-5",
  CLAIMING: "bg-chart-4",
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildTrend(sales: SaleOrder[]): TrendPoint[] {
  const today = new Date();
  const buckets = new Map<string, { value: number; count: number }>();

  for (let offset = TREND_DAYS - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    buckets.set(dayKey(date), { value: 0, count: 0 });
  }

  for (const sale of sales) {
    if (sale.status !== "COMPLETED") continue;

    const key = (sale.saleDate ?? "").slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;

    bucket.value += Number(sale.totalAmount ?? 0);
    bucket.count += 1;
  }

  return [...buckets.entries()].map(([key, bucket]) => ({
    label: key.slice(8, 10) + "/" + key.slice(5, 7),
    value: bucket.value,
    count: bucket.count,
  }));
}

export default function Home() {
  const [models, setModels] = useState<ProductModel[]>([]);
  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const [modelRes, saleRes, itemRes] = await Promise.all([
          api.get("/products/models", { params: { size: 200 } }),
          api.get("/sales", { params: { size: 200 } }),
          api.get("/products/items", { params: { size: 200 } }),
        ]);

        setModels(modelRes.data.data.content ?? []);
        setSales(saleRes.data.data.content ?? []);
        setItems(itemRes.data.data.content ?? []);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลแดชบอร์ดได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const totalStock = models.reduce(
    (sum, model) => sum + Number(model.stockQuantity ?? 0),
    0,
  );

  const stockValue = models.reduce(
    (sum, model) =>
      sum + Number(model.standardCost ?? 0) * Number(model.stockQuantity ?? 0),
    0,
  );

  const completed = sales.filter((sale) => sale.status === "COMPLETED");
  const revenue = completed.reduce(
    (sum, sale) => sum + Number(sale.totalAmount ?? 0),
    0,
  );

  const available = items.filter((item) => item.status === "AVAILABLE").length;

  const lowStock = models
    .filter((model) => Number(model.stockQuantity ?? 0) <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => Number(a.stockQuantity) - Number(b.stockQuantity));

  const trend = buildTrend(sales);
  const trendTotal = trend.reduce((sum, point) => sum + point.value, 0);
  const trendBills = trend.reduce((sum, point) => sum + point.count, 0);

  const thisWeek = trend.slice(-TREND_DAYS / 2);
  const lastWeek = trend.slice(0, Math.floor(TREND_DAYS / 2));
  const thisWeekTotal = thisWeek.reduce((sum, point) => sum + point.value, 0);
  const lastWeekTotal = lastWeek.reduce((sum, point) => sum + point.value, 0);
  const growth =
    lastWeekTotal === 0
      ? null
      : ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;

  const averageBill = trendBills === 0 ? 0 : trendTotal / trendBills;

  const statusCounts = items.reduce<Partial<Record<ItemStatus, number>>>(
    (counts, item) => {
      counts[item.status] = (counts[item.status] ?? 0) + 1;
      return counts;
    },
    {},
  );

  const statusData = (Object.keys(ITEM_STATUS_LABEL) as ItemStatus[])
    .map((status) => ({
      status,
      label: ITEM_STATUS_LABEL[status],
      value: statusCounts[status] ?? 0,
    }))
    .filter((entry) => entry.value > 0);

  const soldByModel = new Map<string, { units: number; revenue: number }>();

  for (const sale of completed) {
    for (const line of sale.items ?? []) {
      const current = soldByModel.get(line.modelName) ?? {
        units: 0,
        revenue: 0,
      };

      current.units += Number(line.quantity ?? 0);
      current.revenue += Number(line.subtotal ?? 0);
      soldByModel.set(line.modelName, current);
    }
  }

  const topModels: BarDatum[] = [...soldByModel.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, entry]) => ({
      label: name,
      value: entry.revenue,
      caption: `ขายได้ ${formatMoney(entry.units)} ชิ้น`,
    }));

  const categoryValue = new Map<string, number>();

  for (const model of models) {
    const key = model.categoryNameTh || "ไม่ระบุหมวดหมู่";
    const value =
      Number(model.standardCost ?? 0) * Number(model.stockQuantity ?? 0);

    categoryValue.set(key, (categoryValue.get(key) ?? 0) + value);
  }

  const categoryData: BarDatum[] = [...categoryValue.entries()]
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      label: name,
      value,
      caption:
        stockValue === 0
          ? undefined
          : `${Math.round((value / stockValue) * 100)}% ของมูลค่าสต๊อก`,
    }));

  const comparisons = [
    {
      label: "ยอดขาย 3 วันล่าสุด",
      value: `฿${formatMoney(thisWeekTotal)}`,
      detail:
        growth === null
          ? "ยังไม่มียอดขายช่วงก่อนหน้าให้เทียบ"
          : `เทียบช่วงก่อนหน้า ฿${formatMoney(lastWeekTotal)}`,
      delta: growth,
    },
    {
      label: "บิลเฉลี่ยต่อใบ",
      value: `฿${formatMoney(Math.round(averageBill))}`,
      detail: `จาก ${formatMoney(trendBills)} บิลใน ${TREND_DAYS} วัน`,
      delta: null,
    },
    {
      label: "สัดส่วนเครื่องพร้อมขาย",
      value:
        items.length === 0
          ? "—"
          : `${Math.round((available / items.length) * 100)}%`,
      detail: `${formatMoney(available)} จาก ${formatMoney(items.length)} เครื่อง`,
      delta: null,
    },
    {
      label: "รุ่นที่ต้องเติมสต๊อก",
      value: formatMoney(lowStock.length),
      detail: `จากทั้งหมด ${formatMoney(models.length)} รุ่น`,
      delta: null,
    },
  ];

  const stats = [
    {
      label: "รุ่นสินค้าทั้งหมด",
      value: formatMoney(models.length),
      unit: "รุ่น",
      icon: Smartphone,
      iconClass: "bg-purple-100 text-purple-600",
    },
    {
      label: "สต๊อกรวม",
      value: formatMoney(totalStock),
      unit: "ชิ้น",
      icon: Package,
      iconClass: "bg-blue-100 text-blue-600",
    },
    {
      label: "มูลค่าสต๊อก (ต้นทุน)",
      value: `฿${formatMoney(stockValue)}`,
      icon: Wallet,
      iconClass: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "ยอดขายรวม",
      value: `฿${formatMoney(revenue)}`,
      icon: Banknote,
      iconClass: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "บิลที่สำเร็จ",
      value: formatMoney(completed.length),
      unit: "บิล",
      icon: Receipt,
      iconClass: "bg-pink-100 text-pink-600",
    },
    {
      label: "เครื่องพร้อมขาย",
      value: formatMoney(available),
      unit: "เครื่อง",
      icon: ShoppingCart,
      iconClass: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title="แดชบอร์ด"
        description="ภาพรวมคลังสินค้าและการขาย"
      />

      {error ? (
        <div className="px-4 pt-4 sm:px-6">
          <Alert tone="danger">{error}</Alert>
        </div>
      ) : null}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* gap-px over a border-coloured track gives exact 1px rules at every
              breakpoint without per-cell border maths, and keeps the numbers
              flush instead of floating in cards inside a card. */}
          <dl className="grid grid-cols-2 gap-px border-b bg-border sm:grid-cols-3 xl:grid-cols-[1fr_0.9fr_1.15fr_1fr_0.9fr_1fr]">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card px-4 py-4 sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                  >
                    <stat.icon
                      size={22}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">
                      {stat.label}
                    </dt>

                    <dd className="mt-1 flex items-baseline gap-1">
                      <span className="text-xl font-semibold tabular-nums text-foreground">
                        {stat.value}
                      </span>

                      {stat.unit ? (
                        <span className="text-xs text-muted-foreground">
                          {stat.unit}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </dl>

          <dl className="grid grid-cols-2 gap-px border-b bg-border lg:grid-cols-4">
            {comparisons.map((entry) => (
              <div key={entry.label} className="bg-card px-4 py-4 sm:px-5">
                <dt className="text-xs text-muted-foreground">{entry.label}</dt>
                <dd className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-lg font-semibold tabular-nums text-foreground">
                    {entry.value}
                  </span>
                  {entry.delta !== null ? (
                    <Badge tone={entry.delta >= 0 ? "success" : "danger"}>
                      <span className="flex items-center gap-1 tabular-nums">
                        {entry.delta >= 0 ? (
                          <TrendingUp size={14} aria-hidden="true" />
                        ) : (
                          <TrendingDown size={14} aria-hidden="true" />
                        )}
                        {entry.delta >= 0 ? "+" : ""}
                        {entry.delta.toFixed(1)}%
                      </span>
                    </Badge>
                  ) : null}
                </dd>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.detail}
                </p>
              </div>
            ))}
          </dl>

          <PanelSection
            title={`แนวโน้มยอดขาย ${TREND_DAYS} วันล่าสุด`}
            description={`รวม ฿${formatMoney(trendTotal)} จาก ${formatMoney(trendBills)} บิลที่สำเร็จ`}
          >
            <SalesTrend data={trend} />
          </PanelSection>

          <div className="grid border-b lg:grid-cols-2 lg:divide-x">
            <PanelSection
              title="สินค้าขายดี 5 อันดับ"
              description="เรียงตามยอดขายรวมของแต่ละรุ่น"
              className="border-b lg:border-b-0"
            >
              {topModels.length > 0 ? (
                <BarChart
                  data={topModels}
                  formatValue={(value) => `฿${formatMoney(value)}`}
                  barClass="bg-chart-1"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีข้อมูลการขาย
                </p>
              )}
            </PanelSection>

            <PanelSection
              title="มูลค่าสต๊อกตามหมวดหมู่"
              description={`คิดจากราคาต้นทุน รวม ฿${formatMoney(stockValue)}`}
              className="border-b-0"
            >
              {categoryData.length > 0 ? (
                <BarChart
                  data={categoryData}
                  formatValue={(value) => `฿${formatMoney(value)}`}
                  barClass="bg-chart-2"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีสต๊อกในระบบ
                </p>
              )}
            </PanelSection>
          </div>

          <PanelSection
            title="สถานะเครื่องในคลัง"
            description={`แยกตามสถานะจากทั้งหมด ${formatMoney(items.length)} เครื่อง`}
            className="border-b"
          >
            {statusData.length > 0 ? (
              <>
                <div
                  role="img"
                  aria-label={statusData
                    .map((entry) => `${entry.label} ${entry.value} เครื่อง`)
                    .join(", ")}
                  className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
                >
                  {statusData.map((entry) => (
                    <div
                      key={entry.status}
                      className={STATUS_BAR_CLASS[entry.status]}
                      style={{
                        width: `${(entry.value / items.length) * 100}%`,
                      }}
                    />
                  ))}
                </div>

                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {statusData.map((entry) => (
                    <li
                      key={entry.status}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        aria-hidden="true"
                        className={`size-2.5 shrink-0 rounded-full ${STATUS_BAR_CLASS[entry.status]}`}
                      />
                      <span className="text-muted-foreground">
                        {entry.label}
                      </span>
                      <span className="tabular-nums text-foreground">
                        {formatMoney(entry.value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                ยังไม่มีเครื่องในคลัง
              </p>
            )}
          </PanelSection>

          <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">
                สินค้าสต๊อกต่ำ
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                รุ่นที่เหลือไม่เกิน {LOW_STOCK_THRESHOLD} ชิ้น
                {lowStock.length > 10
                  ? ` · แสดง 10 จาก ${lowStock.length} รุ่น`
                  : null}
              </p>
            </div>
            <Button asChild size="touch" variant="outline" className="w-full sm:w-auto">
              <Link href="/receive">
                รับสินค้าเข้า
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {lowStock.length > 0 ? (
            <ul className="divide-y">
              {lowStock.slice(0, 10).map((model) => {
                const quantity = Number(model.stockQuantity);

                return (
                  <li
                    key={model.modelId}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6"
                  >
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="truncate text-sm font-medium text-foreground">
                        {model.modelName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {model.brandName}
                        {model.categoryNameTh ? ` · ${model.categoryNameTh}` : null}
                      </p>
                    </div>
                    <Badge tone={quantity === 0 ? "danger" : "warning"}>
                      <span className="flex items-center gap-1">
                        {quantity === 0 ? "หมดสต๊อก" : `เหลือ ${quantity}`}
                        <TriangleAlert size={14} aria-hidden="true" />
                      </span>
                    </Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={PackageCheck}
              title="สต๊อกทุกรุ่นอยู่ในระดับปกติ"
              description={`ยังไม่มีรุ่นไหนเหลือต่ำกว่า ${LOW_STOCK_THRESHOLD} ชิ้น ถ้ามีจะขึ้นเตือนที่นี่`}
            />
          )}
        </>
      )}
    </Panel>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <span className="sr-only" role="status">
        กำลังโหลดข้อมูลแดชบอร์ด
      </span>
      <div className="grid grid-cols-2 gap-px border-b bg-border sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="bg-card px-4 py-4 sm:px-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-6 w-20" />
          </div>
        ))}
      </div>
      <div className="space-y-3 px-4 py-5 sm:px-6">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}
