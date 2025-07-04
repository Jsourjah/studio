
'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import type { Invoice, Material, Purchase, ProductBundle } from '@/lib/types';
import { initialProductBundles } from '@/lib/data';
import { isThisMonth } from 'date-fns';
import { ReportGenerator } from '@/components/report-generator';
import { Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const [invoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [materials] = useLocalStorage<Material[]>('materials', []);
  const [purchases] = useLocalStorage<Purchase[]>('purchases', []);
  const [productBundles] = useLocalStorage<ProductBundle[]>(
    'productBundles',
    initialProductBundles
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const safeInvoices = invoices || [];
  const safeMaterials = materials || [];
  const safePurchases = purchases || [];
  const safeProductBundles = productBundles || [];

  const totalRevenue = safeInvoices.reduce(
    (sum, invoice) => sum + (invoice?.amount || 0),
    0
  );

  const collectedRevenue = safeInvoices
    .filter((invoice) => invoice && invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  const outstandingRevenue = safeInvoices
    .filter(
      (invoice) =>
        invoice && (invoice.status === 'unpaid' || invoice.status === 'overdue')
    )
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  const totalInventoryValue = safeMaterials.reduce(
    (sum, material) =>
      sum + (material?.quantity || 0) * (material?.costPerUnit || 0),
    0
  );

  const totalPurchaseAmount = safePurchases
    .filter((purchase) => purchase && purchase.status === 'completed')
    .reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);

  const getCostOfInvoice = (invoice: Invoice): number => {
    if (!invoice || !Array.isArray(invoice.items)) return 0;

    return invoice.items.reduce((invoiceCost, item) => {
      let itemCostBasis = 0;

      if (item.productBundleId) {
        const bundle = safeProductBundles.find(
          (b) => b.id === item.productBundleId
        );
        if (bundle && Array.isArray(bundle.items)) {
          itemCostBasis = bundle.items.reduce((bundleCost, bundleItem) => {
            const material = safeMaterials.find(
              (m) => m.id === bundleItem.materialId
            );
            return (
              bundleCost + (material ? material.costPerUnit * bundleItem.quantity : 0)
            );
          }, 0);
        }
      } else if (item.materialId) {
        const material = safeMaterials.find((m) => m.id === item.materialId);
        itemCostBasis = material ? material.costPerUnit : 0;
      }

      return invoiceCost + itemCostBasis * item.quantity;
    }, 0);
  };

  const totalCogs = safeInvoices.reduce(
    (sum, invoice) => sum + getCostOfInvoice(invoice),
    0
  );

  const cogsForPaidInvoices = safeInvoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, invoice) => sum + getCostOfInvoice(invoice), 0);

  const grossProfit = collectedRevenue - cogsForPaidInvoices;

  const cogsThisMonth = safeInvoices
    .filter((i) => i.date && !isNaN(new Date(i.date).getTime()) && isThisMonth(new Date(i.date)))
    .reduce((sum, invoice) => sum + getCostOfInvoice(invoice), 0);

  // Data for Invoice Summary Table
  const paidInvoices = safeInvoices.filter(i => i.status === 'paid');
  const unpaidInvoices = safeInvoices.filter(i => i.status === 'unpaid' || i.status === 'overdue');
  const paidAmount = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
  const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);

  // Data for Material Usage Table
  const materialUsage = safeInvoices.reduce((acc, invoice) => {
    const materialsInThisInvoice = new Set<string>();
    if (invoice && Array.isArray(invoice.items)) {
        invoice.items.forEach(item => {
            if (item.materialId) {
                materialsInThisInvoice.add(item.materialId);
            } else if (item.productBundleId) {
                const bundle = safeProductBundles.find(b => b.id === item.productBundleId);
                if (bundle && Array.isArray(bundle.items)) {
                    bundle.items.forEach(bundleItem => {
                        materialsInThisInvoice.add(bundleItem.materialId);
                    });
                }
            }
        });
    }
    materialsInThisInvoice.forEach(materialId => {
        acc[materialId] = (acc[materialId] || 0) + 1;
    });
    return acc;
  }, {} as { [materialId: string]: number });

  const materialUsageReportData = Object.entries(materialUsage).map(([materialId, invoiceCount]) => {
    const material = safeMaterials.find(m => m.id === materialId);
    return {
        name: material ? material.name : 'Unknown Material',
        invoiceCount: invoiceCount
    };
  }).sort((a, b) => b.invoiceCount - a.invoiceCount);

  // Data for Purchase Summary Table
  const purchaseSummary = safePurchases
    .filter(p => p.status === 'completed' && Array.isArray(p.items))
    .reduce((acc, purchase) => {
        purchase.items.forEach(item => {
            const name = item.materialName.trim();
            if (!acc[name]) {
                acc[name] = {
                    name: item.materialName,
                    totalQuantity: 0,
                    totalAmount: 0,
                };
            }
            acc[name].totalQuantity += item.quantity;
            acc[name].totalAmount += item.quantity * item.costPerUnit;
        });
        return acc;
    }, {} as { [name: string]: { name: string, totalQuantity: number, totalAmount: number } });
  
  const purchaseReportData = Object.values(purchaseSummary)
    .sort((a, b) => b.totalAmount - a.totalAmount);

  const financialSummaryData = [
    { metric: 'Total Revenue', value: totalRevenue, description: 'From all invoices' },
    { metric: 'Collected Revenue', value: collectedRevenue, description: 'From paid invoices' },
    { metric: 'Outstanding Revenue', value: outstandingRevenue, description: 'Unpaid & Overdue' },
    { metric: 'Gross Profit', value: grossProfit, description: 'Collected Revenue - COGS' },
    { metric: 'Cost of Goods Sold (Total)', value: totalCogs, description: 'Cost of materials in all invoices' },
    { metric: 'Cost of Goods Sold (This Month)', value: cogsThisMonth, description: 'Cost of materials used this month' },
    { metric: 'Completed Purchases', value: totalPurchaseAmount, description: 'Total spend on materials' },
    { metric: 'Inventory Value', value: totalInventoryValue, description: 'Total cost of materials in stock' },
  ];

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ReportGenerator>
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">Financial Summary</h3>
          <p className="text-sm text-muted-foreground mb-4">A top-level overview of your business finances.</p>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialSummaryData.map((item) => (
                  <TableRow key={item.metric}>
                    <TableCell>
                      <p className="font-medium">{item.metric}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      Rs.{item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
            <h3 className="text-2xl font-semibold tracking-tight mt-6">Invoice Summary</h3>
            <div className="mt-4 rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Invoice Count</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                    <TableCell className="font-medium">Paid</TableCell>
                    <TableCell className="text-center">{paidInvoices.length}</TableCell>
                    <TableCell className="text-right">Rs.{paidAmount.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                    <TableCell className="font-medium">Unpaid/Overdue</TableCell>
                    <TableCell className="text-center">{unpaidInvoices.length}</TableCell>
                    <TableCell className="text-right">Rs.{unpaidAmount.toFixed(2)}</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter>
                    <TableRow>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-center">{safeInvoices.length}</TableHead>
                    <TableHead className="text-right">Rs.{totalRevenue.toFixed(2)}</TableHead>
                    </TableRow>
                </TableFooter>
                </Table>
            </div>
        </div>

        <div>
            <h3 className="text-2xl font-semibold tracking-tight mt-6">Material Purchase Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">Based on completed purchases.</p>
            <div className="mt-4 rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Name</TableHead>
                  <TableHead className="text-center">Qty Purchased</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseReportData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-center">{item.totalQuantity}</TableCell>
                    <TableCell className="text-right">Rs.{item.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
        </div>

       <div>
            <h3 className="text-2xl font-semibold tracking-tight mt-6">Material Usage in Invoices</h3>
            <p className="text-sm text-muted-foreground mb-4">How many invoices each material appears in.</p>
            <div className="mt-4 rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Material Name</TableHead>
                        <TableHead className="text-right">Used in # of Invoices</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {materialUsageReportData.map((item) => (
                        <TableRow key={item.name}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.invoiceCount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
        </div>
    </div>
    </ReportGenerator>
  );
}
