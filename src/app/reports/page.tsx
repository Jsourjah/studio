
'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
        if (bundle) {
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

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ReportGenerator>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>From all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs.{totalRevenue.toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Collected Revenue</CardTitle>
            <CardDescription>From paid invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs.{collectedRevenue.toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gross Profit</CardTitle>
            <CardDescription>Collected Revenue - COGS</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs.{grossProfit.toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Revenue</CardTitle>
            <CardDescription>Unpaid & Overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs.{outstandingRevenue.toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cost of Goods Sold (Total)</CardTitle>
            <CardDescription>Cost of materials in all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs.{totalCogs.toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Materials Used (This Month)</CardTitle>
            <CardDescription>Cost of materials used this month</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs.{cogsThisMonth.toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Purchases</CardTitle>
            <CardDescription>Total spend on materials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs.{totalPurchaseAmount.toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Value</CardTitle>
            <CardDescription>Total cost of materials in stock</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              Rs.{totalInventoryValue.toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
      </div>
    </ReportGenerator>
  );
}
