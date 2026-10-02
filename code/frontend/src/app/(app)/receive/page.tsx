"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

import { Panel } from "@/components/ui/panel";

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

        const [modelRes, itemRes] =
          await Promise.all([
            api.get("/products/models", {
              params: { size: 100 },
            }),
            api.get("/products/items", {
              params: { size: 50 },
            }),
          ]);

        setModels(
          modelRes.data.data.content ?? [],
        );

        setItems(
          itemRes.data.data.content ?? [],
        );
      } catch {
        setError(
          "ไม่สามารถโหลดข้อมูลสินค้าได้",
        );
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [reloadToken]);

  return (
    <Panel className="overflow-hidden">
      <ReceiveHeader />

      {error && (
        <div className="px-4 pt-4 sm:px-6">
          <div className="rounded-lg bg-[#FFE4E4] px-4 py-3 text-sm text-[#E53935]">
            {error}
          </div>
        </div>
      )}

      <ReceiveForm
        models={models}
        onReceived={() =>
          setReloadToken(
            (token) => token + 1,
          )
        }
      />

      <ReceiveHistory
        items={items}
        loading={loading}
        error=""
      />
    </Panel>
  );
}