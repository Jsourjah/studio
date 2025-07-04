
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
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { Invoice } from '@/lib/types';
import { format } from 'date-fns';

export default function Dashboard() {
  const [invoices] = useLocalStorage<Invoice[]>('invoices', []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const safeInvoices = invoices || [];
  
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
      
       <div className="grid gap-4">
        <div className="col-span-12">
            <h3 className="text-2xl font-semibold tracking-tight">Recent Unpaid Invoices</h3>
            <p className="text-sm text-muted-foreground mb-4">Your 5 most recent unpaid or overdue invoices.</p>
               {unpaidInvoices.length > 0 ? (
                <div className="rounded-lg border">
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
                </div>
                ) : (
                <div className="p-6 text-center text-sm text-muted-foreground border rounded-lg">
                    You have no unpaid invoices. Great job!
                </div>
                )}
        </div>
      </div>
    </div>
  );
}
