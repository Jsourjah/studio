
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { purchases as initialPurchases } from '@/lib/data';
import type { Purchase } from '@/lib/types';
import { format } from 'date-fns';
import { AddPurchaseForm } from '@/components/add-purchase-form';

const statusStyles: { [key: string]: string } = {
  completed:
    'bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400',
  pending:
    'bg-amber-500/20 text-amber-700 hover:bg-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
  cancelled:
    'bg-gray-500/20 text-gray-700 hover:bg-gray-500/30 dark:bg-gray-500/10 dark:text-gray-400',
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useLocalStorage<Purchase[]>('purchases', []);
  const [nextPurchaseId, setNextPurchaseId] = useLocalStorage<number>('nextPurchaseId', 100);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);
  const [purchaseToEdit, setPurchaseToEdit] = useState<Purchase | null>(null);


  useEffect(() => {
    setLoading(false);
  }, []);
  
  const handleAddPurchase = (newPurchaseData: Omit<Purchase, 'id'>) => {
    const newId = `P${String(nextPurchaseId).padStart(3, '0')}`;
    const newPurchase: Purchase = {
      id: newId,
      ...newPurchaseData,
    };
    setPurchases(prevPurchases => [...prevPurchases, newPurchase]);
    setNextPurchaseId(prevId => prevId + 1);
  };
  
  const handleUpdatePurchase = (updatedPurchase: Purchase) => {
    setPurchases(prev => 
      prev.map(p => p.id === updatedPurchase.id ? updatedPurchase : p)
    );
    setPurchaseToEdit(null);
  };

  const handleDeletePurchase = (id: string) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
    setPurchaseToDelete(null);
  };

  const seedData = () => {
    setIsSeeding(true);
    let currentId = nextPurchaseId;
    const seededPurchases = initialPurchases.map(purchase => {
      const newPurchase = {
        ...purchase,
        id: `P${String(currentId).padStart(3, '0')}`,
      };
      currentId++;
      return newPurchase;
    });
    setPurchases(seededPurchases);
    setNextPurchaseId(currentId);
    setIsSeeding(false);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sortedPurchases = [...purchases].filter(Boolean).sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
  });

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Purchases</h2>
          <div className="flex items-center space-x-2">
            <AddPurchaseForm 
              onAddPurchase={handleAddPurchase}
              purchaseToEdit={purchaseToEdit}
              onUpdatePurchase={handleUpdatePurchase}
              setPurchaseToEdit={setPurchaseToEdit}
            />
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
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPurchases.map((purchase, index) => (
                    <TableRow key={purchase.id || index}>
                      <TableCell className="font-medium">{purchase.id || ''}</TableCell>
                      <TableCell>{purchase.supplier || 'N/A'}</TableCell>
                      <TableCell>
                        {purchase.date && !isNaN(new Date(purchase.date).getTime())
                          ? format(new Date(purchase.date), 'MM/dd/yyyy')
                          : 'N/A'}
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
                            <DropdownMenuItem onClick={() => setPurchaseToEdit(purchase)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => setPurchaseToDelete(purchase.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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

      <AlertDialog
        open={!!purchaseToDelete}
        onOpenChange={(open) => !open && setPurchaseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this purchase record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDeletePurchase(purchaseToDelete!)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
