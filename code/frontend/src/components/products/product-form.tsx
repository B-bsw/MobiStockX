"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, SelectControl, controlClass } from "@/components/ui/field";
import { Panel, PanelHeader, PanelSection } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ProductImage,
  isDisplayableImageUrl,
} from "@/components/products/product-image";
import type { Brand, Category } from "@/types/products/types";

export interface ProductFormValues {
  name: string;
  brandId: string;
  categoryId: string;
  color: string;
  storage: string;
  warranty: string;
  price: string;
  cost: string;
  imageUrl: string;
}

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  brandId: "",
  categoryId: "",
  color: "",
  storage: "",
  warranty: "12",
  price: "",
  cost: "",
  imageUrl: "",
};

type FormErrors = Partial<Record<keyof ProductFormValues, string>>;

/** Order matters: the first invalid field in this list gets focus on submit. */
const FIELD_ORDER: (keyof ProductFormValues)[] = [
  "name",
  "brandId",
  "categoryId",
  "price",
  "cost",
  "imageUrl",
];

export function validateProductForm(values: ProductFormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim() === "") {
    errors.name = "กรุณากรอกชื่อสินค้า";
  }
  if (values.brandId === "") {
    errors.brandId = "กรุณาเลือกแบรนด์";
  }
  if (values.categoryId === "") {
    errors.categoryId = "กรุณาเลือกหมวดหมู่";
  }

  const price = Number(values.price);
  if (values.price === "") {
    errors.price = "กรุณากรอกราคาขาย";
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = "ราคาขายต้องมากกว่า 0";
  }

  const cost = Number(values.cost);
  if (values.cost === "") {
    errors.cost = "กรุณากรอกราคาต้นทุน";
  } else if (!Number.isFinite(cost) || cost < 0) {
    errors.cost = "ราคาต้นทุนต้องไม่ติดลบ";
  }

  // Optional, but a typo should be caught here rather than saved and shown
  // as a broken image on every page that lists the product.
  const imageUrl = values.imageUrl.trim();
  if (imageUrl !== "") {
    if (!isDisplayableImageUrl(imageUrl)) {
      errors.imageUrl = "ลิงก์รูปต้องเริ่มด้วย http:// หรือ https://";
    } else if (imageUrl.length > 500) {
      errors.imageUrl = "ลิงก์รูปยาวเกิน 500 ตัวอักษร";
    }
  }

  return errors;
}

interface ProductFormProps {
  title: string;
  description: string;
  submitLabel: string;
  values: ProductFormValues;
  onChange: <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => void;
  brands: Brand[];
  categories: Category[];
  saving: boolean;
  loading?: boolean;
  error?: string;
  /** Called only once every field passes validation. */
  onValid: () => void;
  onCancel: () => void;
  footerNote?: ReactNode;
}

export function ProductForm({
  title,
  description,
  submitLabel,
  values,
  onChange,
  brands,
  categories,
  saving,
  loading = false,
  error = "",
  onValid,
  onCancel,
  footerNote,
}: ProductFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Silent until the first submit, then live as the user fixes each field.
  const errors = submitted ? validateProductForm(values) : {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const found = validateProductForm(values);
    const firstInvalid = FIELD_ORDER.find((field) => found[field]);

    if (firstInvalid) {
      const element = formRef.current?.querySelector<HTMLElement>(
        `#product-${firstInvalid}`,
      );
      element?.focus({ preventScroll: true });
      element?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    onValid();
  }

  const describedBy = (field: keyof ProductFormValues) =>
    errors[field] ? `product-${field}-error` : undefined;

  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        title={title}
        description={description}
        actions={
          <Button
            type="button"
            size="touch"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            <ArrowLeft aria-hidden="true" />
            กลับรายการสินค้า
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-4 px-4 py-6 sm:px-6" aria-hidden="true">
          <span className="sr-only" role="status">
            กำลังโหลดข้อมูลสินค้า
          </span>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-11 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          {error !== "" ? (
            <div className="px-4 pt-4 sm:px-6">
              <Alert tone="danger">{error}</Alert>
            </div>
          ) : null}

          <PanelSection
            title="ข้อมูลสินค้า"
            description="ชื่อรุ่น แบรนด์ และสเปกที่ใช้แยกความต่างระหว่างเครื่อง"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="product-name"
                label="ชื่อสินค้า"
                required
                error={errors.name}
                className="sm:col-span-2"
              >
                <input
                  id="product-name"
                  type="text"
                  placeholder="เช่น iPhone 15 Pro"
                  value={values.name}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy("name")}
                  onChange={(event) => onChange("name", event.target.value)}
                  className={controlClass}
                />
              </Field>

              <Field
                id="product-brandId"
                label="แบรนด์"
                required
                error={errors.brandId}
              >
                <SelectControl
                  id="product-brandId"
                  value={values.brandId}
                  aria-invalid={Boolean(errors.brandId)}
                  aria-describedby={describedBy("brandId")}
                  onChange={(event) => onChange("brandId", event.target.value)}
                >
                  <option value="">เลือกแบรนด์</option>
                  {brands.map((brand) => (
                    <option key={brand.brandId} value={brand.brandId}>
                      {brand.brandName}
                    </option>
                  ))}
                </SelectControl>
              </Field>

              <Field
                id="product-categoryId"
                label="หมวดหมู่"
                required
                error={errors.categoryId}
              >
                <SelectControl
                  id="product-categoryId"
                  value={values.categoryId}
                  aria-invalid={Boolean(errors.categoryId)}
                  aria-describedby={describedBy("categoryId")}
                  onChange={(event) =>
                    onChange("categoryId", event.target.value)
                  }
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryNameTh}
                    </option>
                  ))}
                </SelectControl>
              </Field>

              <Field id="product-color" label="สี">
                <input
                  id="product-color"
                  type="text"
                  placeholder="เช่น Natural Titanium"
                  value={values.color}
                  onChange={(event) => onChange("color", event.target.value)}
                  className={controlClass}
                />
              </Field>

              <Field id="product-storage" label="ความจุ">
                <input
                  id="product-storage"
                  type="text"
                  placeholder="เช่น 256GB"
                  value={values.storage}
                  onChange={(event) => onChange("storage", event.target.value)}
                  className={controlClass}
                />
              </Field>

              <Field
                id="product-warranty"
                label="ระยะประกัน (เดือน)"
                hint="เว้นว่างไว้จะใช้ 12 เดือน"
              >
                <input
                  id="product-warranty"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="12"
                  value={values.warranty}
                  aria-describedby="product-warranty-hint"
                  onChange={(event) => onChange("warranty", event.target.value)}
                  className={controlClass}
                />
              </Field>
            </div>
          </PanelSection>

          <PanelSection
            title="รูปสินค้า"
            description="วางลิงก์รูปภาพเพื่อให้แสดงในรายการสินค้าและหน้าขาย"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <ProductImage
                url={values.imageUrl.trim() || null}
                name={values.name.trim() || "สินค้า"}
                className="size-24 border border-border sm:size-28"
                iconSize={32}
              />

              <Field
                id="product-imageUrl"
                label="ลิงก์รูปสินค้า"
                hint="เว้นว่างไว้ได้ ระบบจะแสดงไอคอนแทน"
                error={errors.imageUrl}
                className="flex-1"
              >
                <input
                  id="product-imageUrl"
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com/iphone-15-pro.jpg"
                  value={values.imageUrl}
                  aria-invalid={Boolean(errors.imageUrl)}
                  aria-describedby={
                    describedBy("imageUrl") ?? "product-imageUrl-hint"
                  }
                  onChange={(event) => onChange("imageUrl", event.target.value)}
                  className={controlClass}
                />
              </Field>
            </div>
          </PanelSection>

          <PanelSection
            title="ราคา"
            description="ราคาตั้งต้นของรุ่นนี้ แก้รายเครื่องได้ตอนรับสินค้าเข้า"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="product-price"
                label="ราคาขาย"
                required
                error={errors.price}
              >
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={values.price}
                  aria-invalid={Boolean(errors.price)}
                  aria-describedby={describedBy("price")}
                  onChange={(event) => onChange("price", event.target.value)}
                  className={`${controlClass} tabular-nums`}
                />
              </Field>

              <Field
                id="product-cost"
                label="ราคาต้นทุน"
                required
                error={errors.cost}
              >
                <input
                  id="product-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={values.cost}
                  aria-invalid={Boolean(errors.cost)}
                  aria-describedby={describedBy("cost")}
                  onChange={(event) => onChange("cost", event.target.value)}
                  className={`${controlClass} tabular-nums`}
                />
              </Field>
            </div>
          </PanelSection>

          <div className="flex flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footerNote}
            <Button
              type="button"
              size="touch"
              variant="outline"
              disabled={saving}
              onClick={onCancel}
            >
              ยกเลิก
            </Button>
            <Button type="submit" size="touch" disabled={saving}>
              {saving ? "กำลังบันทึก…" : submitLabel}
            </Button>
          </div>
        </form>
      )}
    </Panel>
  );
}
