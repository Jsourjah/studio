
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, writeBatch, runTransaction, getDocs, query, orderBy, where, getDoc } from 'firebase/firestore';
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
import { Loader2, Database, MoreHorizontal, Trash2 } from 'lucide-react';
import { purchases as initialPurchases, initialMaterials } from '@/lib/data';
import type { Purchase, Material } from '@/lib/types';
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
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'purchases'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPurchases(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Purchase)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddPurchase = async (newPurchaseData: Omit<Purchase, 'id' | 'totalAmount'>) => {
    const batch = writeBatch(db);

    if (newPurchaseData.status === 'completed') {
      const materialsRef = collection(db, "materials");
      let nextMaterialId = 100;
      const counterRef = doc(db, 'counters', 'materials');
      const counterDoc = await getDoc(counterRef);
      if (counterDoc.exists()) {
        nextMaterialId = counterDoc.data().nextId;
      }

      for (const item of newPurchaseData.items) {
          const q = query(materialsRef, where("name", "==", item.materialName.trim()));
          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
              const existingMaterialDoc = snapshot.docs[0];
              const existingMaterial = existingMaterialDoc.data() as Material;
              const docRef = doc(db, "materials", existingMaterialDoc.id);
              batch.update(docRef, { 
                quantity: existingMaterial.quantity + item.quantity,
                costPerUnit: item.costPerUnit 
              });
          } else {
              const newMaterialId = `M${String(nextMaterialId).padStart(3, '0')}`;
              const docRef = doc(db, "materials", newMaterialId);
              batch.set(docRef, { 
                  name: item.materialName.trim(), 
                  quantity: item.quantity, 
                  costPerUnit: item.costPerUnit 
              });
              nextMaterialId++;
          }
      }
      batch.set(counterRef, { nextId: nextMaterialId }, { merge: true });
    }
    
    const purchaseCounterRef = doc(db, 'counters', 'purchases');
    let newId = '';
    await runTransaction(db, async transaction => {
      const counterDoc = await transaction.get(purchaseCounterRef);
      if (!counterDoc.exists()) {
        await transaction.set(purchaseCounterRef, { nextId: 100 });
      }
      const newNextId = (counterDoc.data()?.nextId || 100);
      newId = `PO${String(newNextId).padStart(3, '0')}`;
      const totalAmount = newPurchaseData.items.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
      const newPurchaseRef = doc(db, 'purchases', newId);
      transaction.set(newPurchaseRef, { ...newPurchaseData, totalAmount });
      transaction.update(purchaseCounterRef, { nextId: newNextId + 1 });
    });

    await batch.commit();
  };

  const handleDeletePurchase = async (id: string) => {
    await deleteDoc(doc(db, 'purchases', id));
    setPurchaseToDelete(null);
  };

  const seedData = async () => {
    setIsSeeding(true);
    // Seed Purchases
    const purchasesRef = collection(db, 'purchases');
    let pSnapshot = await getDocs(query(purchasesRef));
    if (pSnapshot.empty) {
      const pBatch = writeBatch(db);
      let nextPId = 100;
      initialPurchases.forEach(p => {
        const newId = `PO${String(nextPId).padStart(3, '0')}`;
        pBatch.set(doc(db, 'purchases', newId), p);
        nextPId++;
      });
      pBatch.set(doc(db, 'counters', 'purchases'), { nextId: nextPId });
      await pBatch.commit();
    }
    
    // Seed Materials (if empty)
    const materialsRef = collection(db, 'materials');
    let mSnapshot = await getDocs(query(materialsRef));
    if(mSnapshot.empty) {
        const mBatch = writeBatch(db);
        let nextMId = 100;
        initialMaterials.forEach(m => {
            const newId = `M${String(nextMId).padStart(3, '0')}`;
            const {id, ...data} = m;
            mBatch.set(doc(db, 'materials', newId), data);
            nextMId++;
        });
        mBatch.set(doc(db, 'counters', 'materials'), { nextId: nextMId });
        await mBatch.commit();
    }

    setIsSeeding(false);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Purchases</h2>
          <div className="flex items-center space-x-2">
            <AddPurchaseForm 
              onAddPurchase={handleAddPurchase}
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
                Load Sample Data
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
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.id}</TableCell>
                      <TableCell>{purchase.supplier}</TableCell>
                      <TableCell>
                        {purchase.date && !isNaN(new Date(purchase.date).getTime())
                          ? format(new Date(purchase.date), 'MM/dd/yyyy')
                          : 'N/A'}
                      </TableCell>
                       <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                              {(purchase.items || []).map((item, itemIndex) => (
                                  <Badge key={itemIndex} variant="secondary" className="font-normal">
                                      {item.quantity}x {item.materialName}
                                  </Badge>
                              ))}
                          </div>
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
              This action cannot be undone. This will permanently delete this purchase record from the cloud. Deleting a purchase will not revert inventory changes.
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
