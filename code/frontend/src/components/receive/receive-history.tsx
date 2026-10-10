"use client";

import { useState } from "react";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/ui/search-input";
import { Segmented } from "@/components/ui/segmented";
import { usePagination } from "@/lib/use-pagination";
import { CONDITION_LABEL, type ProductItem } from "@/types/stock/types";

type ConditionFilter = "ALL" | "NEW" | "SECOND_HAND";

const CONDITION_FILTERS: readonly { value: ConditionFilter; label: string }[] = [
  { value: "ALL", label: "ทุกสภาพ" },
  { value: "NEW", label: CONDITION_LABEL.NEW },
  { value: "SECOND_HAND", label: CONDITION_LABEL.SECOND_HAND },
];

type RangeFilter = "ALL" | "TODAY" | "7D" | "30D";

const RANGE_FILTERS: readonly { value: RangeFilter; label: string }[] = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "TODAY", label: "วันนี้" },
  { value: "7D", label: "7 วัน" },
  { value: "30D", label: "30 วัน" },
];

const DAYS: Record<Exclude<RangeFilter, "ALL" | "TODAY">, number> = {
  "7D": 7,
  "30D": 30,
};

function inRange(createdAt: string, range: RangeFilter) {
  if (range === "ALL") return true;

  const received = new Date(createdAt);
  if (Number.isNaN(received.getTime())) return false;

  if (range === "TODAY") {
    const now = new Date();
    return received.toDateString() === now.toDateString();
  }

  const cutoff = Date.now() - DAYS[range] * 24 * 60 * 60 * 1000;
  return received.getTime() >= cutoff;
}

interface ReceiveHistoryProps {
  items: ProductItem[];
  loading?: boolean;
  error?: string;
}

export function ReceiveHistory({
  items,
  loading = false,
  error = "",
}: ReceiveHistoryProps) {
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState<ConditionFilter>("ALL");
  const [range, setRange] = useState<RangeFilter>("ALL");

  const keyword = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchSearch = [item.modelName, item.serialNumber, item.imei].some(
      (value) => (value ?? "").toLowerCase().includes(keyword),
    );
    const matchCondition = condition === "ALL" || item.condition === condition;

    return matchSearch && matchCondition && inRange(item.createdAt, range);
  });

  const paged = usePagination(filtered);
  const filtering = keyword !== "" || condition !== "ALL" || range !== "ALL";

  return (
    <section className="border-t border-[#EBEBEB] bg-white px-6 py-6 xl:px-10">
      <div className="mb-5">
        <h2 className="text-[20px] font-semibold text-[#292929]">
          ประวัติการรับสินค้า
        </h2>

        <p className="mt-1 text-[16px] text-[#606060]">
          รายการสินค้าที่รับเข้าคลังล่าสุด
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <SearchInput
            label="ค้นหาประวัติการรับสินค้า"
            placeholder="ค้นหารุ่น Serial หรือ IMEI"
            value={search}
            onValueChange={setSearch}
            className="lg:max-w-sm lg:flex-1"
          />
          <Segmented
            label="กรองตามช่วงเวลาที่รับเข้า"
            options={RANGE_FILTERS}
            value={range}
            onValueChange={setRange}
            className="lg:ml-auto"
          />
        </div>
        <Segmented
          label="กรองตามสภาพเครื่อง"
          options={CONDITION_FILTERS}
          value={condition}
          onValueChange={setCondition}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#EBEBEB]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <caption className="sr-only">
              ประวัติการรับสินค้าเข้าคลัง พร้อมวันที่ Serial ต้นทุน และราคาขาย
            </caption>
            <thead className="border-b border-[#EBEBEB] bg-[#F8F9FB] text-sm text-[#707070]">
              <tr>
                <th scope="col" className="w-[22%] px-6 py-3 font-medium">
                  วันที่รับเข้า
                </th>

                <th scope="col" className="w-[30%] px-5 py-3 font-medium">
                  สินค้า
                </th>

                <th scope="col" className="w-[20%] px-5 py-3 font-medium">
                  Serial
                </th>

                <th scope="col" className="w-[14%] px-4 py-3 font-medium">
                  ต้นทุน
                </th>

                <th scope="col" className="px-5 py-3 font-medium">
                  ราคาขาย
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-[#808080]"
                  >
                    กำลังโหลดข้อมูล...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-[#E53935]"
                  >
                    {error}
                  </td>
                </tr>
              ) : paged.rows.length > 0 ? (
                paged.rows.map((item) => (
                  <tr
                    key={item.itemId}
                    className="border-b border-[#EBEBEB] text-sm last:border-b-0"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-[#606060]">
                      {formatDateTime(item.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-[#292929]">
                      {item.modelName}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#808080]">
                      {item.serialNumber || item.imei || "—"}
                    </td>

                    <td className="px-4 py-4 text-[#606060]">
                      ฿{formatMoney(item.costPrice)}
                    </td>

                    <td className="px-5 py-4 text-[#606060]">
                      ฿{formatMoney(item.sellingPrice)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-[#808080]"
                  >
                    {filtering
                      ? "ไม่พบประวัติที่ตรงกับตัวกรอง ลองล้างคำค้นหาหรือเลือกช่วงเวลาอื่น"
                      : "ยังไม่มีประวัติการรับสินค้า"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && error === "" && filtered.length > 0 ? (
          <Pagination
            page={paged.page}
            pageCount={paged.pageCount}
            pageSize={paged.pageSize}
            total={paged.total}
            from={paged.from}
            to={paged.to}
            unit="รายการ"
            onPageChange={paged.setPage}
            onPageSizeChange={paged.setPageSize}
            className="bg-white"
          />
        ) : null}
      </div>
    </section>
  );
}
