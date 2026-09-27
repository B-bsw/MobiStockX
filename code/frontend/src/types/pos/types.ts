export interface PosProduct {
  id: number;
  name: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
}

export interface CartItem {
  product: PosProduct;
  quantity: number;
}

export type PosTab = "sale" | "history";
