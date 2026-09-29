"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PackageCheck } from "lucide-react";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductModel } from "@/types/products/types";
import type { SaleOrder } from "@/types/sales/types";
import type { ProductItem } from "@/types/stock/types";

const LOW_STOCK_THRESHOLD = 3;

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

  const stats = [
    { label: "รุ่นสินค้าทั้งหมด", value: formatMoney(models.length), unit: "รุ่น" },
    { label: "สต๊อกรวม", value: formatMoney(totalStock), unit: "ชิ้น" },
    { label: "มูลค่าสต๊อก (ต้นทุน)", value: `฿${formatMoney(stockValue)}` },
    { label: "ยอดขายรวม", value: `฿${formatMoney(revenue)}` },
    { label: "บิลที่สำเร็จ", value: formatMoney(completed.length), unit: "บิล" },
    { label: "เครื่องพร้อมขาย", value: formatMoney(available), unit: "เครื่อง" },
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
          <dl className="grid grid-cols-2 gap-px border-b bg-border sm:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card px-4 py-4 sm:px-5">
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
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
            ))}
          </dl>

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
                      {quantity === 0 ? "หมดสต๊อก" : `เหลือ ${quantity}`}
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
