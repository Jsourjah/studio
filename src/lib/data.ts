
import type { Invoice, Material, Purchase, ProductBundle } from './types';
import { subMonths, formatISO } from 'date-fns';

const now = new Date();

export const invoices: Omit<Invoice, 'id'>[] = [
  { customer: 'Global Tech Inc.', amount: 250.0, status: 'paid', date: formatISO(subMonths(now, 0)), address: '123 Tech Park, Silicon Valley, CA 94000', phone: '555-0101', items: [{ description: 'Cloud consulting services', quantity: 1, price: 250.0 }] },
  { customer: 'Innovate Solutions', amount: 150.75, status: 'unpaid', date: formatISO(subMonths(now, 0)), address: '456 Innovation Dr, Austin, TX 78701', phone: '555-0102', items: [{ description: 'Data analysis package', quantity: 1, price: 150.75 }] },
  { customer: 'Synergy Corp', amount: 350.0, status: 'paid', date: formatISO(subMonths(now, 1)), address: '789 Synergy Blvd, New York, NY 10001', phone: '555-0103', items: [{ description: 'Marketing campaign management', quantity: 1, price: 350.0 }] },
  { customer: 'Apex Industries', amount: 450.0, status: 'overdue', date: formatISO(subMonths(now, 2)), address: '101 Apex Rd, Chicago, IL 60601', phone: '555-0104', items: [{ description: 'Custom software development', quantity: 1, price: 450.0 }] },
  { customer: 'Dynamic Systems', amount: 550.5, status: 'paid', date: formatISO(subMonths(now, 2)), address: '212 Dynamic Way, Seattle, WA 98101', phone: '555-0105', items: [{ description: 'IT support contract', quantity: 1, price: 550.5 }] },
  { customer: 'Global Tech Inc.', amount: 200.0, status: 'unpaid', date: formatISO(subMonths(now, 3)), address: '123 Tech Park, Silicon Valley, CA 94000', phone: '555-0101', items: [{ description: 'Server maintenance', quantity: 1, price: 200.0 }] },
  { customer: 'Innovate Solutions', amount: 300.0, status: 'paid', date: formatISO(subMonths(now, 4)), address: '456 Innovation Dr, Austin, TX 78701', phone: '555-0102', items: [{ description: 'Website redesign project', quantity: 1, price: 300.0 }] },
];

export const initialMaterials: Material[] = [
  { id: 'M001', name: 'Laminating Sheet', quantity: 500, costPerUnit: 18.00 },
  { id: 'M002', name: 'A4 Paper', quantity: 1000, costPerUnit: 2.70 },
  { id: 'M003', name: 'Steel Beams', quantity: 100, costPerUnit: 50.0 },
  { id: 'M004', name: 'Concrete Mix', quantity: 500, costPerUnit: 5.5 },
  { id: 'M005', name: 'Plywood Sheets', quantity: 200, costPerUnit: 15.0 },
  { id: 'M006', name: 'Copper Wiring (ft)', quantity: 1000, costPerUnit: 0.75 },
  { id: 'M007', name: 'PVC Pipes', quantity: 300, costPerUnit: 8.25 },
];

export const initialProductBundles: ProductBundle[] = [
  { 
    id: 'P001',
    name: 'Lamination Service',
    price: 30.00,
    items: [
      { materialId: 'M001', quantity: 1 },
      { materialId: 'M002', quantity: 1 }
    ] 
  }
];


export const purchases: Omit<Purchase, 'id'>[] = [
  { 
    supplier: 'Steel Supply Co.', 
    items: [
      { materialName: 'Steel Beams', quantity: 50, costPerUnit: 50.0 },
      { materialName: 'Plywood Sheets', quantity: 100, costPerUnit: 12.0 }
    ],
    totalAmount: 3700.0, 
    status: 'completed', 
    date: formatISO(subMonths(now, 1)) 
  },
  { 
    supplier: 'Builder\'s World', 
    items: [
      { materialName: 'Concrete Mix', quantity: 100, costPerUnit: 6.0 },
      { materialName: 'PVC Pipes', quantity: 50, costPerUnit: 8.0 }
    ],
    totalAmount: 1000.0, 
    status: 'pending', 
    date: formatISO(subMonths(now, 0)) 
  },
  { 
    supplier: 'Industrial Hardware', 
    items: [
      { materialName: 'Copper Wiring (ft)', quantity: 500, costPerUnit: 0.80 }
    ],
    totalAmount: 400.0, 
    status: 'completed', 
    date: formatISO(subMonths(now, 2)) 
  },
];

export const monthlySummary = [
  { month: 'Jan', revenue: 4000, purchases: 2400 },
  { month: 'Feb', revenue: 3000, purchases: 1398 },
  { month: 'Mar', revenue: 5000, purchases: 9800 },
  { month: 'Apr', revenue: 4780, purchases: 3908 },
  { month: 'May', revenue: 6890, purchases: 4800 },
  { month: 'Jun', revenue: 5390, purchases: 3800 },
];
