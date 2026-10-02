export interface ReceiveLine {
  id: string;
  modelId: string;
  quantity: string;
  costPrice: string;
  sellingPrice: string;
  grade: string;
  serialNumber: string;
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
