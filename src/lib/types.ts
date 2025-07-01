export type Invoice = {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'overdue';
  date: string;
};

export type Material = {
  id: string;
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
