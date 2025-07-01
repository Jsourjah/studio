import type { Invoice, Material, Purchase } from './types';
import { subMonths, formatISO } from 'date-fns';

const now = new Date();

export const invoices: Invoice[] = [
  { id: 'INV-001', customer: 'Global Tech Inc.', amount: 250.0, status: 'paid', date: formatISO(subMonths(now, 0)) },
  { id: 'INV-002', customer: 'Innovate Solutions', amount: 150.75, status: 'unpaid', date: formatISO(subMonths(now, 0)) },
  { id: 'INV-003', customer: 'Synergy Corp', amount: 350.0, status: 'paid', date: formatISO(subMonths(now, 1)) },
  { id: 'INV-004', customer: 'Apex Industries', amount: 450.0, status: 'overdue', date: formatISO(subMonths(now, 2)) },
  { id: 'INV-005', customer: 'Dynamic Systems', amount: 550.5, status: 'paid', date: formatISO(subMonths(now, 2)) },
  { id: 'INV-006', customer: 'Global Tech Inc.', amount: 200.0, status: 'unpaid', date: formatISO(subMonths(now, 3)) },
  { id: 'INV-007', customer: 'Innovate Solutions', amount: 300.0, status: 'paid', date: formatISO(subMonths(now, 4)) },
];

export const materials: Material[] = [
  { id: 'MAT-001', name: 'Steel Beams', quantity: 100, costPerUnit: 50.0 },
  { id: 'MAT-002', name: 'Concrete Mix', quantity: 500, costPerUnit: 5.5 },
  { id: 'MAT-003', name: 'Plywood Sheets', quantity: 200, costPerUnit: 15.0 },
  { id: 'MAT-004', name: 'Copper Wiring (ft)', quantity: 1000, costPerUnit: 0.75 },
  { id: 'MAT-005', name: 'PVC Pipes', quantity: 300, costPerUnit: 8.25 },
];

export const purchases: Purchase[] = [
  { id: 'PO-001', supplier: 'Steel Supply Co.', itemCount: 2, totalAmount: 5000.0, status: 'completed', date: formatISO(subMonths(now, 1)) },
  { id: 'PO-002', supplier: 'Builder\'s World', itemCount: 3, totalAmount: 1500.0, status: 'pending', date: formatISO(subMonths(now, 0)) },
  { id: 'PO-003', supplier: 'Industrial Hardware', itemCount: 5, totalAmount: 750.0, status: 'completed', date: formatISO(subMonths(now, 2)) },
  { id: 'PO-004', supplier: 'Steel Supply Co.', itemCount: 1, totalAmount: 2500.0, status: 'cancelled', date: formatISO(subMonths(now, 3)) },
  { id: 'PO-005', supplier: 'Plumbing Pros', itemCount: 4, totalAmount: 3200.0, status: 'completed', date: formatISO(subMonths(now, 4)) },
];

export const monthlySummary = [
  { month: 'Jan', revenue: 4000, purchases: 2400 },
  { month: 'Feb', revenue: 3000, purchases: 1398 },
  { month: 'Mar', revenue: 5000, purchases: 9800 },
  { month: 'Apr', revenue: 4780, purchases: 3908 },
  { month: 'May', revenue: 6890, purchases: 4800 },
  { month: 'Jun', revenue: 5390, purchases: 3800 },
];
