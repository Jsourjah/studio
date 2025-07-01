
'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
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
import { invoices as initialInvoices, materials as initialMaterials, purchases as initialPurchases } from '@/lib/data';
import type { Invoice, Material, Purchase } from '@/lib/types';
import { format } from 'date-fns';
import { ReportGenerator } from '@/components/report-generator';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';


export default function ReportsPage() {
  const [invoices] = useLocalStorage<Invoice[]>('invoices', initialInvoices);
  const [materials] = useLocalStorage<Material[]>('materials', initialMaterials);
  const [purchases] = useLocalStorage<Purchase[]>('purchases', initialPurchases);

  const totalRevenue = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const outstandingRevenue = invoices
    .filter((invoice) => invoice.status === 'unpaid' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const totalInventoryValue = materials.reduce(
    (sum, material) => sum + material.quantity * material.costPerUnit,
    0
  );

  const totalPurchaseAmount = purchases
    .filter((purchase) => purchase.status === 'completed')
    .reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  
  const recentPurchases = purchases.slice(0, 5);
  
  const statusStyles = {
    completed:
      'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
    pending:
      'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
    cancelled:
      'bg-gray-500/20 text-gray-700 hover:bg-gray-500/30 dark:bg-gray-500/10 dark:text-gray-400',
  };


  return (
    <ReportGenerator>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>From paid invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toLocaleString('en-US')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Revenue</CardTitle>
            <CardDescription>Unpaid & Overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${outstandingRevenue.toLocaleString('en-US')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Value</CardTitle>
            <CardDescription>Total cost of materials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalInventoryValue.toLocaleString('en-US')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Purchases</CardTitle>
            <CardDescription>Total spend</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalPurchaseAmount.toLocaleString('en-US')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
          <CardDescription>
            A list of the 5 most recent purchase orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.id}</TableCell>
                  <TableCell>{purchase.supplier}</TableCell>
                  <TableCell>{format(new Date(purchase.date), 'MM/dd/yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[purchase.status]}>
                      {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${purchase.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Update Status</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </ReportGenerator>
  );
}
