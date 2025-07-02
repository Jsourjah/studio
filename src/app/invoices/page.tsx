
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
import { MoreHorizontal, Loader2, Database } from 'lucide-react';
import { invoices as initialInvoices } from '@/lib/data';
import type { Invoice, Material } from '@/lib/types';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddInvoiceForm } from '@/components/add-invoice-form';
import { Button } from '@/components/ui/button';

const statusStyles = {
  paid:
    'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
  unpaid:
    'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
  overdue:
    'bg-red-500/20 text-red-700 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400',
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [nextInvoiceId, setNextInvoiceId] = useLocalStorage<number>('nextInvoiceId', 101);
  const [materials] = useLocalStorage<Material[]>('materials', []);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // This effect will run once on mount to handle initial loading state
  // and prevent hydration mismatch issues.
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleAddInvoice = (newInvoiceData: Omit<Invoice, 'id'>) => {
    const newId = String(nextInvoiceId).padStart(4, '0');
    const newInvoice: Invoice = {
      id: newId,
      ...newInvoiceData,
    };
    setInvoices(prevInvoices => [...prevInvoices, newInvoice]);
    setNextInvoiceId(prevId => prevId + 1);
    return newId;
  };

  const seedData = () => {
    setIsSeeding(true);
    let currentId = nextInvoiceId;
    const seededInvoices = initialInvoices.map(invoice => {
      const newInvoice = {
        ...invoice,
        id: String(currentId).padStart(4, '0'),
      };
      currentId++;
      return newInvoice;
    });
    setInvoices(seededInvoices);
    setNextInvoiceId(currentId);
    setIsSeeding(false);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sortedInvoices = [...invoices].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <div className="flex items-center space-x-2">
          <AddInvoiceForm onAddInvoice={handleAddInvoice} materials={materials} />
        </div>
      </div>

      {invoices.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>No Invoices Found</CardTitle>
            <CardDescription>
              Your invoice list is empty. You can add a new invoice or load
              sample data to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={seedData} disabled={isSeeding}>
              {isSeeding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
              )}
              Load Sample Invoices
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Management</CardTitle>
            <CardDescription>
              View, track, and manage all your customer invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.id}
                    </TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell className="truncate max-w-[200px]">
                      {invoice.items}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.date), 'MM/dd/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[invoice.status]}
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${invoice.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
