
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { Invoice, Material, Purchase, ProductBundle } from '@/lib/types';
import { format } from 'date-fns';
import { DashboardChart } from '@/components/dashboard-chart';
import type { ChartConfig } from '@/components/ui/chart';

export default function Dashboard() {
  const [invoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [materials] = useLocalStorage<Material[]>('materials', []);
  const [purchases] = useLocalStorage<Purchase[]>('purchases', []);
  const [productBundles] = useLocalStorage<ProductBundle[]>('productBundles', []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const safeInvoices = invoices || [];
  const safeMaterials = materials || [];
  const safePurchases = purchases || [];
  const safeProductBundles = productBundles || [];
  
  // Calculations for summary cards
  const collectedRevenue = safeInvoices
    .filter((invoice) => invoice && invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  const getCostOfInvoice = (invoice: Invoice): number => {
    if (!invoice || !Array.isArray(invoice.items)) return 0;
    return invoice.items.reduce((invoiceCost, item) => {
      let itemCostBasis = 0;
      if (item.productBundleId) {
        const bundle = safeProductBundles.find(b => b.id === item.productBundleId);
        if (bundle && Array.isArray(bundle.items)) {
          itemCostBasis = bundle.items.reduce((bundleCost, bundleItem) => {
            const material = safeMaterials.find(m => m.id === bundleItem.materialId);
            return bundleCost + (material ? material.costPerUnit * bundleItem.quantity : 0);
          }, 0);
        }
      } else if (item.materialId) {
        const material = safeMaterials.find(m => m.id === item.materialId);
        itemCostBasis = material ? material.costPerUnit : 0;
      }
      return invoiceCost + itemCostBasis * item.quantity;
    }, 0);
  };

  const cogsForPaidInvoices = safeInvoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, invoice) => sum + getCostOfInvoice(invoice), 0);

  const grossProfit = collectedRevenue - cogsForPaidInvoices;
  
  const totalRevenue = safeInvoices.reduce((sum, invoice) => sum + (invoice?.amount || 0), 0);
  
  const totalInventoryValue = safeMaterials.reduce(
    (sum, material) => sum + (material?.quantity || 0) * (material?.costPerUnit || 0),
    0
  );

  // Data for unpaid invoices table
  const unpaidInvoices = [...safeInvoices]
    .filter((invoice) => invoice && (invoice.status === 'unpaid' || invoice.status === 'overdue'))
    .sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    })
    .slice(0, 5);

  const statusStyles: { [key: string]: string } = {
    unpaid: 'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
    overdue: 'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
  };

  // Data for inventory chart
  const inventoryChartData = safeMaterials
    .map((material, index) => ({
        name: material.name,
        value: (material.quantity || 0) * (material.costPerUnit || 0),
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const chartConfig = inventoryChartData.reduce((acc, item) => {
      acc[item.name as keyof typeof acc] = { label: item.name, color: item.fill };
      return acc;
  }, {} as ChartConfig);


  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{collectedRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From paid invoices only</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{grossProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Collected Revenue - COGS</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{totalInventoryValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Value of materials in stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-12 lg:col-span-4">
            <CardHeader>
                <CardTitle>Recent Unpaid Invoices</CardTitle>
                <CardDescription>Your 5 most recent unpaid or overdue invoices.</CardDescription>
            </CardHeader>
            <CardContent>
               {unpaidInvoices.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {unpaidInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>
                                    <div className="font-medium">{invoice.customer}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {invoice.date && !isNaN(new Date(invoice.date).getTime()) ? format(new Date(invoice.date), 'PPP') : 'No date'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={statusStyles[invoice.status] || ''}>
                                        {(invoice.status || 'unknown').charAt(0).toUpperCase() + (invoice.status || 'unknown').slice(1)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">Rs.{(invoice.amount || 0).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                    You have no unpaid invoices. Great job!
                </div>
                )}
            </CardContent>
        </Card>
         <Card className="col-span-12 lg:col-span-3">
            <CardHeader>
                <CardTitle>Inventory Value Breakdown</CardTitle>
                <CardDescription>Value distribution of your top materials in stock.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
                {inventoryChartData.length > 0 ? (
                    <DashboardChart 
                        data={inventoryChartData} 
                        chartConfig={chartConfig}
                        totalLabel="Total Inventory"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No inventory data to display.
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
