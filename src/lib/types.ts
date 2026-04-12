export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Receipt {
  id: string;
  uploadDate: string;
  storeName: string;
  receiptDate: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}
