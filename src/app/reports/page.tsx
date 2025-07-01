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
import { invoices, materials, purchases } from '@/lib/data';
import { format } from 'date-fns';

export default function ReportsPage() {
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Business Report</h2>
      </div>
      
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
