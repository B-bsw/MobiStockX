"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PosHeader } from "@/components/headers/posHeader";
import { PosCatalog } from "@/components/pos/pos-catalog";
import { PosCart } from "@/components/pos/pos-cart";
import { PosHistory } from "@/components/pos/pos-history";
import { useAuth } from "@/lib/auth-context";
import type { CartItem, PosProduct, PosTab } from "@/types/pos/types";
import type { ProductModel } from "@/types/products/types";
import type {
  Customer,
  PaymentMethod,
  SaleOrder,
} from "@/types/sales/types";

function toPosProduct(model: ProductModel): PosProduct {
  const spec = [model.storageCapacity, model.color]
    .filter((value) => value && value !== "-")
    .join(" · ");

  return {
    id: model.modelId,
    name: model.modelName,
    brand: model.brandName,
    model: spec || model.categoryNameTh,
    price: Number(model.standardPrice ?? 0),
    stock: Number(model.stockQuantity ?? 0),
  };
}

export default function Page() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PosTab>("sale");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [received, setReceived] = useState("");

  const [products, setProducts] = useState<PosProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const [modelRes, customerRes, saleRes] = await Promise.all([
          api.get("/products/models", { params: { size: 100 } }),
          api.get("/customers", { params: { size: 100 } }),
          api.get("/sales", { params: { size: 50 } }),
        ]);

        const models: ProductModel[] = modelRes.data.data.content ?? [];

        setProducts(
          models
            .filter((m) => Number(m.stockQuantity ?? 0) > 0)
            .map(toPosProduct),
        );
        setCustomers(customerRes.data.data.content ?? []);
        setSales(saleRes.data.data.content ?? []);
      } catch {
        setLoadError("ไม่สามารถโหลดข้อมูลสำหรับการขายได้");
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [reloadToken]);

  const query = search.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    [product.name, product.brand, product.model].some((value) =>
      (value ?? "").toLowerCase().includes(query),
    ),
  );

  function addProduct(product: PosProduct) {
    setMessage("");
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
    setMessage("");
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

  async function checkout() {
    if (items.length === 0 || customerId === "" || !user) return;

    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    setSaving(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await api.post("/sales", {
        customerId: Number(customerId),
        cashierUserId: user.userId,
        discountAmount: 0,
        items: items.map((item) => ({
          modelId: item.product.id,
          itemId: null,
          quantity: item.quantity,
          unitPrice: item.product.price,
          discountAmount: 0,
        })),
        payment: {
          paymentMethod,
          amount: total,
          referenceNo: null,
        },
        requiresTaxInvoice: false,
      });

      const saleCode = response.data?.data?.saleCode ?? "";

      setItems([]);
      setReceived("");
      setMessage(`ขายสำเร็จ เลขที่บิล ${saleCode}`);
      setReloadToken((token) => token + 1);
    } catch {
      setIsError(true);
      setMessage("บันทึกการขายไม่สำเร็จ กรุณาตรวจสอบสต๊อกและลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] bg-white shadow-md lg:h-[calc(100dvh-104px)]">
      <PosHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {loadError && (
        <div className="mx-6 mt-4 rounded-[20px] bg-[#FFE4E4] px-7 py-3 text-[16px] text-[#E53935]">
          {loadError}
        </div>
      )}

      {activeTab === "sale" ? (
        <div className="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[minmax(0,1.88fr)_minmax(300px,1fr)]">
          <PosCatalog
            products={filteredProducts}
            items={items}
            search={search}
            loading={loading}
            onSearchChange={setSearch}
            onAdd={addProduct}
          />

          <PosCart
            items={items}
            received={received}
            customers={customers}
            customerId={customerId}
            paymentMethod={paymentMethod}
            saving={saving}
            message={message}
            isError={isError}
            onReceivedChange={setReceived}
            onCustomerChange={setCustomerId}
            onPaymentMethodChange={setPaymentMethod}
            onQuantityChange={changeQuantity}
            onCheckout={checkout}
          />
        </div>
      ) : (
        <PosHistory sales={sales} loading={loading} />
      )}
    </div>
  );
}
