"use client";

import { useState } from "react";
import { PosHeader } from "@/components/headers/posHeader";
import { PosCatalog } from "@/components/pos/pos-catalog";
import { PosCart } from "@/components/pos/pos-cart";
import { posProducts } from "@/datas/pos/data";
import type { CartItem, PosProduct, PosTab } from "@/types/pos/types";

export default function Page() {
  const [activeTab, setActiveTab] = useState<PosTab>("sale");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [received, setReceived] = useState("");
  const query = search.trim().toLowerCase();
  const filteredProducts = posProducts.filter((product) =>
    [product.name, product.brand, product.model].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );

  function addProduct(product: PosProduct) {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if ((existing?.quantity ?? 0) >= product.stock) return current;
      return existing
        ? current.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [...current, { product, quantity: 1 }];
    });
  }

  function changeQuantity(id: number, quantity: number) {
    setItems((current) =>
      current
        .map((item) =>
          item.product.id === id
            ? {
                ...item,
                quantity: Math.min(item.product.stock, Math.max(0, quantity)),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-[20px] bg-white shadow-md">
      <PosHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "sale" ? (
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.88fr)_minmax(300px,1fr)]">
          <PosCatalog
            products={filteredProducts}
            items={items}
            search={search}
            onSearchChange={setSearch}
            onAdd={addProduct}
          />

          <PosCart
            items={items}
            received={received}
            onReceivedChange={setReceived}
            onQuantityChange={changeQuantity}
          />
        </div>
      ) : (
        <div className="flex min-h-[500px] flex-1 items-center justify-center bg-[#F8F9FB] text-[#808080]">
          ยังไม่มีประวัติการขาย
        </div>
      )}
    </div>
  );
}
