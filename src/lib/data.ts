import type { Invoice, Material, Purchase } from './types';
import { subMonths, formatISO } from 'date-fns';

const now = new Date();

export const invoices: Omit<Invoice, 'id'>[] = [
  { customer: 'Global Tech Inc.', amount: 250.0, status: 'paid', date: formatISO(subMonths(now, 0)), address: '123 Tech Park, Silicon Valley, CA 94000', phone: '555-0101', items: 'Cloud consulting services' },
  { customer: 'Innovate Solutions', amount: 150.75, status: 'unpaid', date: formatISO(subMonths(now, 0)), address: '456 Innovation Dr, Austin, TX 78701', phone: '555-0102', items: 'Data analysis package' },
  { customer: 'Synergy Corp', amount: 350.0, status: 'paid', date: formatISO(subMonths(now, 1)), address: '789 Synergy Blvd, New York, NY 10001', phone: '555-0103', items: 'Marketing campaign management' },
  { customer: 'Apex Industries', amount: 450.0, status: 'overdue', date: formatISO(subMonths(now, 2)), address: '101 Apex Rd, Chicago, IL 60601', phone: '555-0104', items: 'Custom software development' },
  { customer: 'Dynamic Systems', amount: 550.5, status: 'paid', date: formatISO(subMonths(now, 2)), address: '212 Dynamic Way, Seattle, WA 98101', phone: '555-0105', items: 'IT support contract' },
  { customer: 'Global Tech Inc.', amount: 200.0, status: 'unpaid', date: formatISO(subMonths(now, 3)), address: '123 Tech Park, Silicon Valley, CA 94000', phone: '555-0101', items: 'Server maintenance' },
  { customer: 'Innovate Solutions', amount: 300.0, status: 'paid', date: formatISO(subMonths(now, 4)), address: '456 Innovation Dr, Austin, TX 78701', phone: '555-0102', items: 'Website redesign project' },
];

export const materials: Omit<Material, 'id'>[] = [
  { name: 'Steel Beams', quantity: 100, costPerUnit: 50.0 },
  { name: 'Concrete Mix', quantity: 500, costPerUnit: 5.5 },
  { name: 'Plywood Sheets', quantity: 200, costPerUnit: 15.0 },
  { name: 'Copper Wiring (ft)', quantity: 1000, costPerUnit: 0.75 },
  { name: 'PVC Pipes', quantity: 300, costPerUnit: 8.25 },
];

export const purchases: Omit<Purchase, 'id'>[] = [
  { supplier: 'Steel Supply Co.', itemCount: 2, totalAmount: 5000.0, status: 'completed', date: formatISO(subMonths(now, 1)) },
  { supplier: 'Builder\'s World', itemCount: 3, totalAmount: 1500.0, status: 'pending', date: formatISO(subMonths(now, 0)) },
  { supplier: 'Industrial Hardware', itemCount: 5, totalAmount: 750.0, status: 'completed', date: formatISO(subMonths(now, 2)) },
  { supplier: 'Steel Supply Co.', itemCount: 1, totalAmount: 2500.0, status: 'cancelled', date: formatISO(subMonths(now, 3)) },
  { supplier: 'Plumbing Pros', itemCount: 4, totalAmount: 3200.0, status: 'completed', date: formatISO(subMonths(now, 4)) },
];

export const monthlySummary = [
  { month: 'Jan', revenue: 4000, purchases: 2400 },
  { month: 'Feb', revenue: 3000, purchases: 1398 },
  { month: 'Mar', revenue: 5000, purchases: 9800 },
  { month: 'Apr', revenue: 4780, purchases: 3908 },
  { month: 'May', revenue: 6890, purchases: 4800 },
  { month: 'Jun', revenue: 5390, purchases: 3800 },
];
