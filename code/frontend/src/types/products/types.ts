export type ProductCategory = "Flagship" | "Mid-Range" | "Budget";

export type ProductCategoryFilter = "ทั้งหมด" | ProductCategory;

export interface Product {
  id: number;
  name: string;
  brand: string;
  model: string;
  sku: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
}

export interface ProductModel {
  modelId: number;
  modelName: string;
  color: string | null;
  storageCapacity: string | null;
  modelWarrantyDuration: number | null;
  isSerialized: boolean;
  stockQuantity: number;
  standardCost: number;
  standardPrice: number;
  imageUrl: string | null;
  brandId: number;
  brandName: string;
  categoryId: number;
  categoryNameTh: string;
}

export interface Category {
  categoryId: number;
  categoryNameTh: string;
}

export interface Brand {
  brandId: number;
  brandName: string;
}
