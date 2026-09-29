"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ReceiveHeader } from "@/components/headers/receiveHeader";
import { ReceiveForm } from "@/components/receive/receive-form";
import { ReceiveHistory } from "@/components/receive/receive-history";
import type { ProductModel } from "@/types/products/types";
import type { ProductItem } from "@/types/stock/types";

export default function Page() {
  const [models, setModels] = useState<ProductModel[]>([]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setError("");

        const [modelRes, itemRes] = await Promise.all([
          axios.get("/api/v1/products/models", { params: { size: 100 } }),
          axios.get("/api/v1/products/items", { params: { size: 50 } }),
        ]);

        setModels(modelRes.data.data.content ?? []);
        setItems(itemRes.data.data.content ?? []);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [reloadToken]);

  return (
    <div className="min-h-[calc(100dvh-48px)] overflow-hidden rounded-[20px] bg-[#F8F9FB]">
      <ReceiveHeader />
      <div className="space-y-5 p-5">
        {error && (
          <div className="rounded-[20px] bg-[#FFE4E4] px-7 py-4 text-[16px] text-[#E53935]">
            {error}
          </div>
        )}
        <ReceiveForm
          models={models}
          onReceived={() => setReloadToken((token) => token + 1)}
        />
        <ReceiveHistory items={items} loading={loading} error="" />
      </div>
    </div>
  );
}
