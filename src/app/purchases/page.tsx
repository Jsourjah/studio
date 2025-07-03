
'use client';

import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
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
import { PlusCircle, Loader2, Database } from 'lucide-react';
import { purchases as initialPurchases } from '@/lib/data';
import type { Purchase } from '@/lib/types';
import { format } from 'date-fns';

const statusStyles: { [key: string]: string } = {
  completed:
    'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
  pending:
    'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
  cancelled:
    'bg-gray-500/20 text-gray-700 hover:bg-gray-500/30 dark:bg-gray-500/10 dark:text-gray-400',
};

// Function to generate a simple unique ID
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};


export default function PurchasesPage() {
  const [purchases, setPurchases] = useLocalStorage<Purchase[]>('purchases', []);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, []);
  
  const seedData = () => {
    setIsSeeding(true);
    const seededPurchases = initialPurchases.map(purchase => ({
      ...purchase,
      id: generateUniqueId(),
    }));
    setPurchases(seededPurchases);
    setIsSeeding(false);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sortedPurchases = [...purchases].filter(Boolean).sort((a,b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Purchases</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Purchase
          </Button>
        </div>
      </div>

      {purchases.length === 0 ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>No Purchases Found</CardTitle>
            <CardDescription>
              Your purchase list is empty. You can add a new purchase or load
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
              Load Sample Purchases
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>
              Monitor all your purchase orders and their statuses.
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
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPurchases.map((purchase, index) => (
                  <TableRow key={purchase.id || index}>
                    <TableCell className="font-medium truncate max-w-[100px]">{(purchase.id || '').substring(0, 8).toUpperCase()}</TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>
                      {purchase.date ? format(new Date(purchase.date), 'MM/dd/yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[purchase.status] || ''}
                      >
                        {(purchase.status || 'unknown').charAt(0).toUpperCase() +
                          (purchase.status || 'unknown').slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {purchase.itemCount || 0}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rs.{(purchase.totalAmount || 0).toFixed(2)}
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
