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
