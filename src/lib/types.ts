
export type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
  materialId?: string;
};

export type Invoice = {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  date: string;
  address?: string;
  phone?: string;
  items: InvoiceItem[];
};

export type Material = {
  id:string;
  name: string;
  quantity: number;
  costPerUnit: number;
};

export type Purchase = {
  id: string;
  supplier: string;
  itemCount: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
};

export type ProductBundleItem = {
  materialId: string;
  quantity: number;
};

export type ProductBundle = {
  id: string;
  name: string;
  items: ProductBundleItem[];
};
