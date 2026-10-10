"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import { PosHeader } from "@/components/headers/posHeader";
import { PosCatalog } from "@/components/pos/pos-catalog";
import { PosCart } from "@/components/pos/pos-cart";
import { PosHistory } from "@/components/pos/pos-history";
import { useAuth } from "@/lib/auth-context";
import {
  itemLabel,
  lineIdOf,
  type CartItem,
  type PosItem,
  type PosProduct,
  type PosTab,
} from "@/types/pos/types";
import {
  PosItemPicker,
  toPosItem,
} from "@/components/pos/pos-item-picker";
import type { ProductItem } from "@/types/stock/types";
import type { ProductModel } from "@/types/products/types";
import {
  EMPTY_TAX_INVOICE,
  validateTaxInvoice,
  type Customer,
  type PaymentMethod,
  type SaleOrder,
  type TaxInvoiceForm,
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
    imageUrl: model.imageUrl ?? null,
    isSerialized: Boolean(model.isSerialized),
  };
}

async function findItemByCode(code: string) {
  for (const path of [
    `/products/items/imei/${encodeURIComponent(code)}`,
    `/products/items/serial/${encodeURIComponent(code)}`,
  ]) {
    try {
      const response = await api.get(path);
      const item: ProductItem = response.data.data;
      if (item) return { item, modelId: item.modelId };
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  return null;
}

export default function Page() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PosTab>("sale");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [received, setReceived] = useState("");

  const [pickerProduct, setPickerProduct] = useState<PosProduct | null>(null);
  const [scan, setScan] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");

  const [products, setProducts] = useState<PosProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  const [taxInvoiceEnabled, setTaxInvoiceEnabled] = useState(false);
  const [taxInvoice, setTaxInvoice] =
    useState<TaxInvoiceForm>(EMPTY_TAX_INVOICE);

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

  function countInCart(current: CartItem[], modelId: number) {
    return current
      .filter((line) => line.product.id === modelId)
      .reduce((sum, line) => sum + line.quantity, 0);
  }

  function addProduct(product: PosProduct) {
    setMessage("");

    if (product.isSerialized) {
      setPickerProduct(product);
      return;
    }

    const lineId = lineIdOf(product.id, null);

    setItems((current) => {
      if (countInCart(current, product.id) >= product.stock) return current;

      const existing = current.find((line) => line.lineId === lineId);
      return existing
        ? current.map((line) =>
            line.lineId === lineId
              ? { ...line, quantity: line.quantity + 1 }
              : line,
          )
        : [...current, { lineId, product, item: null, quantity: 1 }];
    });
  }

  function addItem(product: PosProduct, item: PosItem) {
    setMessage("");
    setScanError("");

    const lineId = lineIdOf(product.id, item.itemId);
    let rejected = "";

    setItems((current) => {
      if (current.some((line) => line.lineId === lineId)) {
        rejected = `${itemLabel(item)} อยู่ในตะกร้าแล้ว`;
        return current;
      }

      if (countInCart(current, product.id) >= product.stock) {
        rejected = `สต๊อก ${product.name} ไม่พอ`;
        return current;
      }

      return [...current, { lineId, product, item, quantity: 1 }];
    });

    if (rejected) {
      setScanError(rejected);
      return;
    }

    setPickerProduct(null);
  }

  async function addByIdentifier() {
    const code = scan.trim();
    if (code === "" || scanning) return;

    setScanning(true);
    setScanError("");
    setMessage("");

    try {
      const found = await findItemByCode(code);

      if (!found) {
        setScanError(`ไม่พบเครื่องที่มี S/N หรือ IMEI "${code}"`);
        return;
      }

      const { item, modelId } = found;

      if (item.status !== "AVAILABLE") {
        setScanError(`เครื่องนี้ขายไม่ได้ (สถานะ ${item.status})`);
        return;
      }

      const product = products.find((candidate) => candidate.id === modelId);

      if (!product) {
        setScanError("รุ่นของเครื่องนี้ไม่มีสต๊อกพร้อมขายในระบบ");
        return;
      }

      addItem(product, toPosItem(item, product.price));
      setScan("");
    } catch {
      setScanError("ค้นหาเครื่องไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setScanning(false);
    }
  }

  function changeQuantity(lineId: string, quantity: number) {
    setMessage("");
    setItems((current) =>
      current
        .map((line) =>
          line.lineId === lineId
            ? {
                ...line,
                quantity: line.item
                  ? Math.min(1, Math.max(0, quantity))
                  : Math.min(line.product.stock, Math.max(0, quantity)),
              }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }


  function prefillFrom(selectedCustomerId: string): TaxInvoiceForm {
    const customer = customers.find(
      (candidate) => String(candidate.customerId) === selectedCustomerId,
    );

    return {
      ...EMPTY_TAX_INVOICE,
      companyOrBuyerName: customer
        ? `${customer.firstName} ${customer.lastName}`.trim()
        : "",
      taxId: customer?.taxNumber ?? "",
      address: customer?.address ?? "",
    };
  }

  function toggleTaxInvoice(enabled: boolean) {
    setTaxInvoiceEnabled(enabled);
    setMessage("");
    setTaxInvoice(enabled ? prefillFrom(customerId) : EMPTY_TAX_INVOICE);
  }

  function changeCustomer(value: string) {
    setCustomerId(value);

    if (taxInvoiceEnabled) {
      setTaxInvoice(prefillFrom(value));
    }
  }

  function confirmTaxInvoice(values: TaxInvoiceForm) {
    setTaxInvoice(values);
    setMessage("");
  }

  async function checkout() {
    if (items.length === 0 || customerId === "" || !user) return;

    if (taxInvoiceEnabled) {
      const found = validateTaxInvoice(taxInvoice);

      if (Object.keys(found).length > 0) {
        setIsError(true);
        setMessage("กรุณากรอกข้อมูลใบกำกับภาษีให้ครบถ้วน");
        return;
      }
    }

    const total = items.reduce(
      (sum, line) =>
        sum + (line.item?.price ?? line.product.price) * line.quantity,
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
        items: items.map((line) => ({
          modelId: line.product.id,
          itemId: line.item?.itemId ?? null,
          quantity: line.quantity,
          unitPrice: line.item?.price ?? line.product.price,
          discountAmount: 0,
        })),
        payment: {
          paymentMethod,
          amount: total,
          referenceNo: null,
        },
        requiresTaxInvoice: taxInvoiceEnabled,
        taxInvoice: taxInvoiceEnabled
          ? {
              companyOrBuyerName: taxInvoice.companyOrBuyerName.trim(),
              taxId: taxInvoice.taxId.replace(/[\s-]/g, ""),
              branchNumber: taxInvoice.branchNumber.trim() || "00000",
              address: taxInvoice.address.trim(),
            }
          : null,
      });

      const saleCode = response.data?.data?.saleCode ?? "";
      const invoiceNumber = response.data?.data?.taxInvoice?.invoiceNumber ?? "";

      setItems([]);
      setReceived("");
      setScan("");
      setScanError("");
      setTaxInvoiceEnabled(false);
      setTaxInvoice(EMPTY_TAX_INVOICE);
      setMessage(
        invoiceNumber
          ? `ขายสำเร็จ เลขที่บิล ${saleCode} · ใบกำกับภาษี ${invoiceNumber}`
          : `ขายสำเร็จ เลขที่บิล ${saleCode}`,
      );
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
            scan={scan}
            scanning={scanning}
            scanError={scanError}
            loading={loading}
            onSearchChange={setSearch}
            onScanChange={(value) => {
              setScan(value);
              setScanError("");
            }}
            onScanSubmit={addByIdentifier}
            onAdd={addProduct}
          />

          <PosCart
            items={items}
            received={received}
            customers={customers}
            customerId={customerId}
            paymentMethod={paymentMethod}
            taxInvoiceEnabled={taxInvoiceEnabled}
            taxInvoice={taxInvoice}
            saving={saving}
            message={message}
            isError={isError}
            onReceivedChange={setReceived}
            onCustomerChange={changeCustomer}
            onPaymentMethodChange={setPaymentMethod}
            onTaxInvoiceToggle={toggleTaxInvoice}
            onTaxInvoiceConfirm={confirmTaxInvoice}
            onQuantityChange={changeQuantity}
            onCheckout={checkout}
          />
        </div>
      ) : (
        <PosHistory sales={sales} loading={loading} />
      )}

      <PosItemPicker
        product={pickerProduct}
        pickedItemIds={items
          .map((line) => line.item?.itemId)
          .filter((id): id is number => id !== undefined)}
        onClose={() => setPickerProduct(null)}
        onPick={addItem}
      />
    </div>
  );
}
