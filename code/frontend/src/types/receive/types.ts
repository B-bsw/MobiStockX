export interface ReceiveLine {
  id: string;
  productId: string;
  quantity: string;
  supplier: string;
  invoice: string;
  note: string;
}

export interface ReceiveRecord {
  id: string;
  date: string;
  product: string;
  quantity: number;
  supplier: string;
  invoice: string;
  note: string;
}
