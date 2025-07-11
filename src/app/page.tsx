
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Loader2,
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
} from 'lucide-react';
import type { Invoice, Material, ProductBundle, Purchase } from '@/lib/types';
import { format } from 'date-fns';
import { getCostOfInvoice } from '@/lib/calculations';
import { monthlySummary } from '@/lib/data';
import { DashboardChart } from '@/components/dashboard-chart';
import { RevenueChart } from '@/components/revenue-chart';
import type { ChartConfig } from '@/components/ui/chart';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');


export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [productBundles, setProductBundles] = useState<ProductBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribes = [
      onSnapshot(collection(db, 'invoices'), (snapshot) => {
        setInvoices(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Invoice)));
      }),
      onSnapshot(collection(db, 'materials'), (snapshot) => {
        setMaterials(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Material)));
      }),
      onSnapshot(collection(db, 'purchases'), (snapshot) => {
        setPurchases(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Purchase)));
      }),
      onSnapshot(collection(db, 'productBundles'), (snapshot) => {
        setProductBundles(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProductBundle)));
      }),
    ];

    Promise.all([
        new Promise(resolve => onSnapshot(collection(db, 'invoices'), resolve)),
        new Promise(resolve => onSnapshot(collection(db, 'materials'), resolve)),
        new Promise(resolve => onSnapshot(collection(db, 'purchases'), resolve)),
        new Promise(resolve => onSnapshot(collection(db, 'productBundles'), resolve)),
    ]).then(() => setLoading(false));

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);
  
  // Calculations for summary cards
  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + (invoice?.amount || 0),
    0
  );

  const collectedRevenue = invoices
    .filter((invoice) => invoice && invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  const cogsForPaidInvoices = invoices
    .filter((i) => i.status === 'paid')
    .reduce(
      (sum, invoice) =>
        sum + getCostOfInvoice(invoice, materials, productBundles),
      0
    );

  const grossProfit = collectedRevenue - cogsForPaidInvoices;
  
  const totalCustomers = new Set(invoices.map(i => i.customer)).size;

  const totalPurchases = purchases
    .filter((purchase) => purchase && purchase.status === 'completed')
    .reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);

  // Data for unpaid invoices table
  const unpaidInvoices = [...invoices]
    .filter(
      (invoice) =>
        invoice && (invoice.status === 'unpaid' || invoice.status === 'overdue')
    )
    .sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    })
    .slice(0, 5);

  const statusStyles: { [key: string]: string } = {
    unpaid:
      'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
    overdue:
      'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
  };

  // Data for inventory chart
  const inventoryChartData = materials
    .map((m) => ({
      name: m.name,
      value: (m.quantity || 0) * (m.costPerUnit || 0),
      slug: slugify(m.name),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const categoryColorMap: { [key: string]: string } = {
    "Laminating Sheet": "hsl(var(--chart-3))",
    "A4 Paper": "hsl(var(--chart-4))",
    "Steel Beams": "hsl(var(--chart-1))",
    "Concrete Mix": "hsl(var(--chart-5))",
    "Plywood Sheets": "hsl(var(--chart-2))",
    "Copper Wiring (ft)": "hsl(var(--chart-1))",
    "PVC Pipes": "hsl(var(--chart-2))",
  };

  const inventoryChartConfig = {
    value: {
      label: 'Value',
    },
    ...inventoryChartData.reduce((acc, item, index) => {
      acc[item.slug] = {
        label: item.name,
        color: categoryColorMap[item.name] || `hsl(var(--chart-${(index % 5) + 1}))`,
      };
      return acc;
    }, {} as { [key: string]: any }),
  } satisfies ChartConfig;
  
   const topProducts = [...invoices]
    .flatMap(invoice => invoice.items || [])
    .filter(item => item.productBundleId)
    .reduce((acc, item) => {
      const bundle = productBundles.find(b => b.id === item.productBundleId);
      if (bundle) {
        if (!acc[bundle.name]) {
          acc[bundle.name] = 0;
        }
        acc[bundle.name] += item.quantity;
      }
      return acc;
    }, {} as {[key: string]: number});
  
  const sortedTopProducts = Object.entries(topProducts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
               <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs.{totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From all invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{grossProfit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Based on paid invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
             <div className="h-8 w-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground">Unique customers served</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases
            </CardTitle>
             <div className="h-8 w-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs.{totalPurchases.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed purchase orders
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs. Purchases</CardTitle>
             <CardDescription>
                Monthly financial overview for the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={monthlySummary} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Value</CardTitle>
             <CardDescription>
              Top 5 materials by their total stock value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inventoryChartData.length > 0 ? (
                <DashboardChart
                data={inventoryChartData}
                chartConfig={inventoryChartConfig}
                totalLabel="Total Value"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-center text-sm text-muted-foreground">
                No inventory data to display.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Unpaid Invoices</CardTitle>
              <CardDescription>
                Your 5 most recent unpaid or overdue invoices.
              </CardDescription>
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
                            {invoice.date &&
                            !isNaN(new Date(invoice.date).getTime())
                              ? format(new Date(invoice.date), 'PPP')
                              : 'No date'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={statusStyles[invoice.status] || ''}
                          >
                            {(invoice.status || 'unknown').charAt(0).toUpperCase() +
                              (invoice.status || 'unknown').slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          Rs.{(invoice.amount || 0).toFixed(2)}
                        </TableCell>
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
          <Card className="col-span-full lg:col-span-1">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>
                Your most frequently sold products.
              </CardDescription>
            </CardHeader>
            <CardContent>
                {sortedTopProducts.length > 0 ? (
                  <div className="space-y-4">
                    {sortedTopProducts.map(([name, count]) => (
                      <div key={name} className="flex items-center">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md mr-4">
                           <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{name}</p>
                        </div>
                        <p className="text-sm font-semibold">{count}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No product sales data yet.
                  </div>
                )}
            </CardContent>
          </Card>
       </div>
    </div>
  );
}
