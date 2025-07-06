
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, writeBatch, runTransaction, getDocs, query } from 'firebase/firestore';
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
import { Loader2, Database, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { initialProductBundles } from '@/lib/data';
import type { ProductBundle, Material } from '@/lib/types';
import { AddProductForm } from '@/components/add-product-form';
import { Badge } from '@/components/ui/badge';

export default function ProductsPage() {
  const [productBundles, setProductBundles] = useState<ProductBundle[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [productToEdit, setProductToEdit] = useState<ProductBundle | null>(null);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'productBundles'), (snapshot) => {
      setProductBundles(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ProductBundle)));
      setLoading(false);
    });
    const unsubscribeMaterials = onSnapshot(collection(db, 'materials'), (snapshot) => {
      setMaterials(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Material)));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeMaterials();
    };
  }, []);

  const handleAddProduct = async (newProductData: Omit<ProductBundle, 'id'>) => {
    const counterRef = doc(db, 'counters', 'productBundles');
    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        await transaction.set(counterRef, { nextId: 100 });
      }
      const newNextId = (counterDoc.data()?.nextId || 100);
      const newId = `P${String(newNextId).padStart(3, '0')}`;
      const newProductRef = doc(db, 'productBundles', newId);
      transaction.set(newProductRef, newProductData);
      transaction.update(counterRef, { nextId: newNextId + 1 });
    });
  };
  
  const handleUpdateProduct = async (updatedProduct: ProductBundle) => {
    const { id, ...data } = updatedProduct;
    await updateDoc(doc(db, 'productBundles', id), data);
    setProductToEdit(null);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'productBundles', id));
    setProductToDelete(null);
  };
  
  const seedData = async () => {
    setIsSeeding(true);
    const collectionRef = collection(db, 'productBundles');
    const snapshot = await getDocs(query(collectionRef));
    if (!snapshot.empty) {
      console.log('Product Bundles collection not empty, skipping seed.');
      setIsSeeding(false);
      return;
    }

    const batch = writeBatch(db);
    let nextId = 100;
    initialProductBundles.forEach(bundle => {
      const newId = `P${String(nextId).padStart(3, '0')}`;
      const docRef = doc(db, 'productBundles', newId);
      batch.set(docRef, { ...bundle, id: newId });
      nextId++;
    });

    const counterRef = doc(db, 'counters', 'productBundles');
    batch.set(counterRef, { nextId });

    await batch.commit();
    setIsSeeding(false);
  };
  
  const getMaterialName = (id: string) => {
    return materials.find(m => m.id === id)?.name || 'Unknown Material';
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
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <div className="flex items-center space-x-2">
            <AddProductForm 
              onAddProduct={handleAddProduct} 
              materials={materials}
              onUpdateProduct={handleUpdateProduct}
              productToEdit={productToEdit}
              setProductToEdit={setProductToEdit}
            />
          </div>
        </div>

        {productBundles.length === 0 ? (
           <Card className="mt-6">
            <CardHeader>
              <CardTitle>No Products Found</CardTitle>
              <CardDescription>
                Your product list is empty. A product is a bundle of materials you can sell as a single item.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={seedData} disabled={isSeeding}>
                {isSeeding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Database className="mr-2 h-4 w-4" />
                )}
                Load Sample Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Product & Service List</CardTitle>
              <CardDescription>
                Manage your products, which are bundles of materials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Components</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productBundles.filter(Boolean).map((bundle, index) => (
                      <TableRow key={bundle.id || index}>
                          <TableCell className="font-medium">{bundle.id}</TableCell>
                          <TableCell className="font-medium">{bundle.name || 'N/A'}</TableCell>
                          <TableCell>
                              <div className="flex flex-wrap gap-1">
                                  {(bundle.items || []).map((item, itemIndex) => (
                                      <Badge key={itemIndex} variant="outline">
                                          {item.quantity}x {getMaterialName(item.materialId)}
                                      </Badge>
                                  ))}
                              </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                              Rs.{(bundle.price || 0).toFixed(2)}
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
                                <DropdownMenuItem onClick={() => setProductToEdit(bundle)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onClick={() => setProductToDelete(bundle.id)}
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
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this product from the cloud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDeleteProduct(productToDelete!)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
