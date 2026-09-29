"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { products } from "@/datas/product/data";
import { suppliers } from "@/datas/receive/data";
import type { ReceiveLine, ReceiveRecord } from "@/types/receive/types";
import { ReceiveItemRow } from "./receive-item-row";

function createLine(id: string): ReceiveLine {
  return { id, productId: "", quantity: "1", supplier: suppliers[0], invoice: "", note: "" };
}

interface ReceiveFormProps {
  onReceive: (records: ReceiveRecord[]) => void;
}

export function ReceiveForm({ onReceive }: ReceiveFormProps) {
  const [lines, setLines] = useState<ReceiveLine[]>([createLine("initial")]);
  const [message, setMessage] = useState("");

  function changeLine(id: string, field: keyof Omit<ReceiveLine, "id">, value: string) {
    setMessage("");
    setLines((current) => current.map((line) => line.id === id ? { ...line, [field]: value } : line));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valid = lines.every((line) =>
      products.some((product) => String(product.id) === line.productId) &&
      Number.isSafeInteger(Number(line.quantity)) && Number(line.quantity) > 0 &&
      Number(line.quantity) <= 999999 && suppliers.includes(line.supplier),
    );
    if (!valid) {
      setMessage("กรุณาเลือกสินค้า ซัพพลายเออร์ และระบุจำนวนเต็มตั้งแต่ 1 ถึง 999999");
      return;
    }
    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
    onReceive(lines.map((line) => ({
      id: crypto.randomUUID(),
      date,
      product: products.find((product) => String(product.id) === line.productId)!.name,
      quantity: Number(line.quantity),
      supplier: line.supplier,
      invoice: line.invoice.trim(),
      note: line.note.trim(),
    })));
    setLines([createLine(crypto.randomUUID())]);
    setMessage("เพิ่มรายการในหน้านี้แล้ว (ข้อมูลทดลองจะหายเมื่อรีเฟรช ยังไม่บันทึกเข้าคลังจริง)");
  }

  return (
    <section className="rounded-[20px] border border-[#EBEBEB] bg-white px-[18px] pb-6 pt-5">
      <h2 className="mb-4 px-1.5 text-[18px] text-black">บันทึกการรับสินค้าใหม่</h2>
      <form onSubmit={submit}>
        <div className="space-y-3">
          {lines.map((line) => <ReceiveItemRow key={line.id} line={line} removable={lines.length > 1} onChange={changeLine} onRemove={(id) => setLines((current) => current.filter((item) => item.id !== id))} />)}
        </div>
        <div className="mt-5 flex flex-wrap gap-5 px-1">
          <button type="button" onClick={() => { setLines((current) => [...current, createLine(crypto.randomUUID())]); setMessage(""); }} className="flex h-[49px] items-center justify-center gap-2 rounded-full border border-[#EBEBEB] px-5 text-[20px] text-[#808080] hover:bg-gray-50">
            <Plus size={24} aria-hidden="true" /> เพิ่มรายการ
          </button>
          <button type="submit" className="h-[49px] rounded-full bg-[#7FBFFF] px-7 text-[20px] text-white transition hover:bg-[#68AEF4]">ยืนยันการรับสินค้า</button>
        </div>
        {message && <p role="status" className="mt-3 px-2 text-sm text-[#606060]">{message}</p>}
      </form>
    </section>
  );
}
