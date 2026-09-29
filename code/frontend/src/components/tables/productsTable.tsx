"use client";

import { PackageOpen, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoney } from "@/lib/format";
import type { ProductModel } from "@/types/products/types";
import {
  ProductActions,
  ProductMobileCard,
  productSpec,
  type ProductRowActions,
} from "./productRow";

interface ProductsTableProps {
  products: ProductModel[];
  search: string;
  loading?: boolean;
  error?: string;
  actions: ProductRowActions;
}

export function ProductsTable({
  products,
  search,
  loading = false,
  error = "",
  actions,
}: ProductsTableProps) {
  const searching = search.trim() !== "";

  const columns: Column<ProductModel>[] = [
    {
      id: "product",
      header: "สินค้า",
      cell: (product) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {product.modelName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {product.brandName}
          </p>
        </div>
      ),
    },
    {
      id: "spec",
      header: "ความจุ / สี",
      cell: (product) => (
        <span className="text-muted-foreground">{productSpec(product)}</span>
      ),
    },
    {
      id: "category",
      header: "หมวดหมู่",
      cell: (product) => <Badge tone="info">{product.categoryNameTh}</Badge>,
    },
    {
      id: "price",
      header: "ราคาขาย",
      align: "end",
      cell: (product) => (
        <span className="tabular-nums">฿{formatMoney(product.standardPrice)}</span>
      ),
    },
    {
      id: "cost",
      header: "ต้นทุน",
      align: "end",
      className: "hidden xl:table-cell",
      cell: (product) => (
        <span className="tabular-nums text-muted-foreground">
          ฿{formatMoney(product.standardCost)}
        </span>
      ),
    },
    {
      id: "stock",
      header: "สต๊อก",
      align: "end",
      cell: (product) => {
        const quantity = Number(product.stockQuantity ?? 0);

        return (
          <Badge
            tone={quantity === 0 ? "danger" : quantity <= 3 ? "warning" : "success"}
          >
            {quantity === 0 ? "หมด" : quantity}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: <span className="sr-only">จัดการ</span>,
      align: "end",
      cell: (product) => (
        <ProductActions product={product} actions={actions} />
      ),
    },
  ];

  return (
    <DataTable
      caption="รายการรุ่นสินค้าทั้งหมด พร้อมราคาขาย ต้นทุน และจำนวนสต๊อก"
      columns={columns}
      rows={products}
      rowKey={(product) => product.modelId}
      mobileCard={(product) => (
        <ProductMobileCard product={product} actions={actions} />
      )}
      loading={loading}
      error={error}
      minWidthClass="min-w-[60rem]"
      empty={
        searching ? (
          <EmptyState
            icon={SearchX}
            title="ไม่พบสินค้าที่ค้นหา"
            description={`ไม่มีรุ่นหรือแบรนด์ที่ตรงกับ "${search.trim()}" ลองพิมพ์สั้นลงหรือล้างคำค้นหา`}
          />
        ) : (
          <EmptyState
            icon={PackageOpen}
            title="ยังไม่มีสินค้าในหมวดหมู่นี้"
            description="กดปุ่มเพิ่มสินค้าด้านบนเพื่อสร้างรุ่นแรก แล้วค่อยรับเครื่องเข้าคลัง"
          />
        )
      }
    />
  );
}
