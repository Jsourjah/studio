
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
import {
  CreditCard,
  DollarSign,
  ShoppingCart,
  Loader2,
} from 'lucide-react';

import { monthlySummary } from '@/lib/data';
import type { Invoice, Purchase } from '@/lib/types';
import { format } from 'date-fns';
import { DashboardChart } from '@/components/dashboard-chart';
import type { ChartConfig } from '@/components/ui/chart';

export default function Dashboard() {
  const [invoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [purchases] = useLocalStorage<Purchase[]>('purchases', []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const unpaidInvoices = [...invoices]
    .filter((invoice) => invoice.status === 'unpaid' || invoice.status === 'overdue')
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
    
  const totalRevenue = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const unpaidAmount = invoices
    .filter((invoice) => invoice.status === 'unpaid' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  
  const activePurchases = purchases.filter(p => p.status === 'pending').length;

  const totalMonthlyRevenue = monthlySummary.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalMonthlyPurchases = monthlySummary.reduce((acc, curr) => acc + curr.purchases, 0);

  const pieData = [
    { name: 'Revenue', value: totalMonthlyRevenue, fill: 'var(--color-Revenue)' },
    { name: 'Purchases', value: totalMonthlyPurchases, fill: 'var(--color-Purchases)' },
  ];

  const chartConfig = {
    Revenue: {
      label: 'Revenue',
      color: 'hsl(var(--chart-1))',
    },
    Purchases: {
      label: 'Purchases',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  const statusStyles: { [key in Invoice['status']]: string } = {
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs.{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From all paid invoices
            </p>
          </CardContent>
        </Card>
        <Card>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs.{(totalRevenue + unpaidAmount).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Sum of all invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Purchases
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activePurchases}</div>
            <p className="text-xs text-muted-foreground">
              Currently pending purchases
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
                A summary of revenue vs. purchases.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart data={pieData} chartConfig={chartConfig} />
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
                        {format(new Date(invoice.date), 'PPP')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[invoice.status]}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      Rs.{invoice.amount.toFixed(2)}
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
