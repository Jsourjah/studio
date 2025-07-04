
'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import Link from 'next/link';
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
import {
  CreditCard,
  DollarSign,
  ShoppingCart,
  Loader2,
} from 'lucide-react';

import { monthlySummary } from '@/lib/data';
import type { Invoice, Material } from '@/lib/types';
import { format } from 'date-fns';
import { DashboardChart } from '@/components/dashboard-chart';
import type { ChartConfig } from '@/components/ui/chart';

export default function Dashboard() {
  const [invoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [materials] = useLocalStorage<Material[]>('materials', []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const safeInvoices = invoices || [];
  const safeMaterials = materials || [];

  const unpaidInvoices = [...safeInvoices]
    .filter((invoice) => invoice && (invoice.status === 'unpaid' || invoice.status === 'overdue'))
    .sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    })
    .slice(0, 5);
    
  const totalSales = safeInvoices
    .filter((invoice) => invoice && invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

  const unpaidAmount = safeInvoices
    .filter((invoice) => invoice && (invoice.status === 'unpaid' || invoice.status === 'overdue'))
    .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  
  const totalMonthlyRevenue = monthlySummary.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalMonthlyPurchases = monthlySummary.reduce((acc, curr) => acc + curr.purchases, 0);

  // Inventory Chart
  const inventoryData = safeMaterials
    .map((material) => ({
      name: material.name,
      value: (material.quantity || 0) * (material.costPerUnit || 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const topN = 4;
  const chartDataItems = inventoryData.slice(0, topN);
  const otherValue = inventoryData
    .slice(topN)
    .reduce((sum, item) => sum + item.value, 0);

  if (otherValue > 0) {
    chartDataItems.push({ name: 'Other', value: otherValue });
  }

  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const inventoryChartConfig = chartDataItems.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: chartColors[index % chartColors.length],
    };
    return acc;
  }, {} as ChartConfig);

  const statusStyles: { [key: string]: string } = {
    paid:
      'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
    unpaid:
      'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
    overdue:
      'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
  };
  
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
        <Link href="/reports">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs.{totalMonthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                From monthly summary data
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/invoices">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unpaid Invoices
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs.{unpaidAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total amount outstanding
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/invoices">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs.{totalSales.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Sum of all paid invoices
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/purchases">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Purchases
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs.{totalMonthlyPurchases.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From monthly summary data
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>
                A breakdown of your current inventory by value.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart 
              data={chartDataItems} 
              chartConfig={inventoryChartConfig}
              totalLabel="Total Inventory"
              valueFormatter={(value) => `Rs.${value.toLocaleString()}`}
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Unpaid Invoices</CardTitle>
            <CardDescription>
              Your 5 most recent unpaid or overdue invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        {invoice.date && !isNaN(new Date(invoice.date).getTime())
                          ? format(new Date(invoice.date), 'PPP')
                          : 'No date'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[invoice.status] || ''}
                      >
                        {(invoice.status || 'unknown').charAt(0).toUpperCase() + (invoice.status || 'unknown').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      Rs.{(invoice.amount || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
