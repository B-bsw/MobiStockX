"use client";

import { formatDateTime, formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SALE_STATUS_LABEL,
  SALE_STATUS_TONE,
  type SaleOrder,
} from "@/types/sales/types";

interface SaleDetailDialogProps {
  sale: SaleOrder | null;
  onClose: () => void;
}

export function SaleDetailDialog({ sale, onClose }: SaleDetailDialogProps) {
  return (
    <Dialog
      open={sale !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        {sale ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                <span className="tabular-nums">บิล {sale.saleCode}</span>
                <Badge tone={SALE_STATUS_TONE[sale.status] ?? "neutral"}>
                  {SALE_STATUS_LABEL[sale.status] ?? sale.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {formatDateTime(sale.saleDate)} · {sale.customerName} ·{" "}
                {sale.customerPhone}
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4">
              <ul className="divide-y rounded-xl border">
                {(sale.items ?? []).map((item) => (
                  <li key={item.saleItemId} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-medium text-foreground">
                        {item.modelName}
                      </p>
                      <p className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                        ฿{formatMoney(item.subtotal)}
                      </p>
                    </div>

                    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">IMEI</dt>
                        <dd className="mt-0.5 truncate text-sm tabular-nums text-foreground">
                          {item.itemImei || "—"}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">
                          Serial
                        </dt>
                        <dd className="mt-0.5 truncate text-sm tabular-nums text-foreground">
                          {item.itemSerialNumber || "—"}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">
                          ราคา/ชิ้น
                        </dt>
                        <dd className="mt-0.5 text-sm tabular-nums text-foreground">
                          ฿{formatMoney(item.unitPrice)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">จำนวน</dt>
                        <dd className="mt-0.5 text-sm tabular-nums text-foreground">
                          {formatMoney(item.quantity)} ชิ้น
                        </dd>
                      </div>
                    </dl>

                    {Number(item.discountAmount ?? 0) > 0 ? (
                      <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                        ส่วนลดรายการ ฿{formatMoney(item.discountAmount)}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>

              <dl className="space-y-1.5 rounded-xl bg-muted px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ยอดก่อนส่วนลด</dt>
                  <dd className="tabular-nums text-foreground">
                    ฿{formatMoney(sale.subtotalAmount)}
                  </dd>
                </div>
                {Number(sale.discountAmount ?? 0) > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">ส่วนลด</dt>
                    <dd className="tabular-nums text-foreground">
                      −฿{formatMoney(sale.discountAmount)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t pt-1.5">
                  <dt className="text-muted-foreground">ยอดรวม</dt>
                  <dd className="font-semibold tabular-nums text-foreground">
                    ฿{formatMoney(sale.totalAmount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">พนักงานขาย</dt>
                  <dd className="text-foreground">{sale.createdByUserName}</dd>
                </div>
              </dl>
            </DialogBody>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
